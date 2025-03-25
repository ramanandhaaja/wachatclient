import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify token for webhook verification
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

// Send a simple "thanks" reply
async function sendSimpleReply(to: string) {
  try {
    // Send the reply using the WhatsApp Cloud API
    const WHATSAPP_API_VERSION = 'v17.0';
    const WHATSAPP_PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '';
    const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '';
    
    const response = await fetch(
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
            preview_url: false,
            body: 'Thanks for your message! Our AI assistant will respond shortly.'
          }
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Simple reply sent:', data);

    // Store the outbound message
    await supabase.from('messages').insert({
      sender_id: data.messages?.[0]?.id,
      conversation_id: to, // Using wa_id as conversation_id temporarily
      sender_type: 'bot',
      content: 'Thanks for your message! Our AI assistant will respond shortly.',
      timestamp: new Date().toISOString(),
      is_read: true,
      metadata: {
        message_type: 'text',
        wa_message_id: data.messages?.[0]?.id,
        delivery_status: 'sent'
      }
    });

  } catch (error) {
    console.error('Error sending reply:', error);
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
    
    // Log the webhook event for debugging
    console.log('Received webhook:', JSON.stringify(body, null, 2));
    
    // Check if this is a WhatsApp message notification
    if (body.object === 'whatsapp_business_account') {
      // Process each entry
      for (const entry of body.entry) {
        // Process each change
        for (const change of entry.changes) {
          // Check if this is a message
          if (change.field === 'messages') {
            const value = change.value;
            
            // Check if there are messages
            if (value.messages && value.messages.length > 0) {
              // Get the first message and contact
              const message = value.messages[0];
              const contact = value.contacts[0];
              
              console.log('Processing message from:', contact.wa_id);

              // Store contact information
              const { data: existingContact, error: findError } = await supabase
                .from('conversations')
                .select('id')
                .eq('user_phone', contact.wa_id)
                .single();

              if (findError) {
                console.error('Error finding conversation:', findError);
              }

              console.log('Existing contact:', existingContact);

              let conversationId: string;

              if (!existingContact) {
                console.log('Creating new conversation for:', contact.wa_id);
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
                  throw new Error('Failed to create conversation');
                }

                console.log('Created new conversation:', newConversation);
                conversationId = newConversation.id;
              } else {
                console.log('Updating existing conversation:', existingContact.id);
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
                  throw new Error('Failed to update conversation');
                }

                conversationId = existingContact.id;
              }

              // Store message
              console.log('Storing message for conversation:', conversationId);
              const { error: messageError } = await supabase.from('messages').insert({
                sender_id: message.id,
                conversation_id: conversationId,
                sender_type: 'user',
                content: message.text.body,
                timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                is_read: false,
                metadata: {
                  message_type: message.type,
                  wa_message_id: message.id
                }
              });

              if (messageError) {
                console.error('Error storing message:', messageError);
                throw new Error('Failed to store message');
              }

              console.log('Successfully stored message');

              // Send a simple "thanks" reply
              await sendSimpleReply(contact.wa_id);
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

