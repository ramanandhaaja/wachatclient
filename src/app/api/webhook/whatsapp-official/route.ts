import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processMessage } from '@/lib/server-chat-openai/process-message';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify token for webhook verification
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

async function sendtoChatBot(to: string, message: string, conversationId: string) {
  try {
    // Generate a session ID for this conversation
    const sessionId = conversationId;
    
    // Get response from OpenAI
    const response = await processMessage(sessionId, message);
    
    if (response) {
      // Send the AI response back via WhatsApp
      const WHATSAPP_API_VERSION = 'v17.0';
      const WHATSAPP_PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '';
      const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '';
      
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
              body: response
            }
          }),
        }
      );

      if (!whatsappResponse.ok) {
        throw new Error(`WhatsApp API error: ${whatsappResponse.status}`);
      }

      const data = await whatsappResponse.json();

      // Store the bot's response in the messages table
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: response,
          sender_type: 'bot',
          timestamp: new Date().toISOString(),
          metadata: {
            message_type: 'text',
            wa_message_id: data.messages?.[0]?.id,
            delivery_status: 'sent'
          }
        });

      if (messageError) {
        console.error('Error storing bot response:', messageError);
      }

      // Update conversation last message
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message: response,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in sendtoChatBot:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Handle the webhook verification request from Meta
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if this is a valid WhatsApp message webhook
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;
            
            if (value.messages && value.messages[0] && value.contacts && value.contacts[0]) {
              const message = value.messages[0];
              const contact = value.contacts[0];
              
              console.log('Processing message from:', contact.wa_id);

              // Store or update contact information and get conversation ID
              const { data: existingContact, error: findError } = await supabase
                .from('conversations')
                .select('id, sessions!inner(*)')
                .eq('user_phone', contact.wa_id)
                .single();

              if (findError && findError.code !== 'PGRST116') { // Not found error
                console.error('Error finding conversation:', findError);
                throw findError;
              }

              let conversationId: string;

              if (!existingContact) {
                // Create new conversation and session
                const { data: newConversation, error: insertError } = await supabase
                  .from('conversations')
                  .insert({
                    user_id: contact.wa_id,
                    user_phone: contact.wa_id,
                    user_name: contact.profile.name,
                    status: 'active',
                    last_message: message.text.body,
                    last_message_time: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_bot_active: true
                  })
                  .select('id')
                  .single();

                if (insertError) {
                  console.error('Error creating conversation:', insertError);
                  throw insertError;
                }

                conversationId = newConversation.id;

                // Create initial session
                const { error: sessionError } = await supabase
                  .from('sessions')
                  .insert({
                    conversation_id: conversationId,
                    status: 'active',
                    auto_reply_enabled: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (sessionError) {
                  console.error('Error creating session:', sessionError);
                  throw sessionError;
                }
              } else {
                conversationId = existingContact.id;

                // Update existing conversation
                const { error: updateError } = await supabase
                  .from('conversations')
                  .update({
                    last_message: message.text.body,
                    last_message_time: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingContact.id);

                if (updateError) {
                  console.error('Error updating conversation:', updateError);
                  throw updateError;
                }
              }

              // Store incoming message
              const { error: messageError } = await supabase
                .from('messages')
                .insert({
                  conversation_id: conversationId,
                  content: message.text.body,
                  sender_type: 'user',
                  timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                  metadata: {
                    message_type: message.type,
                    wa_message_id: message.id,
                    delivery_status: 'received'
                  }
                });

              if (messageError) {
                console.error('Error storing message:', messageError);
                throw messageError;
              }

              // Process message with chatbot
              await sendtoChatBot(contact.wa_id, message.text.body, conversationId);
            }
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
