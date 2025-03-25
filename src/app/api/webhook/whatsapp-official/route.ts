import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify token for webhook verification
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

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
              
              // Only process if it's a text message
              if (message.type === 'text') {
                // Send a simple "thanks" reply
                await sendSimpleReply(contact.wa_id);
              }
            }
          }
        }
      }
      
      // Return a 200 OK response to acknowledge receipt of the event
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }
    
    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Send a simple "thanks" reply
async function sendSimpleReply(to: string) {
  try {
    // Send the reply using the WhatsApp Cloud API
    const WHATSAPP_API_VERSION = 'v22.0';
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
            body: 'Thanks!'
          }
        }),
      }
    );
    
    const data = await response.json();
    console.log('Simple reply sent:', data);

    // Find the conversation for this phone number
    const { data: conversations, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('phone_number', to)
      .single();

    if (findError) {
      console.error('Error finding conversation:', findError);
      return;
    }

    // Save the reply message to Supabase
    const { error: saveError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversations.id,
        content: 'Thanks!', // The reply message
        sender_type: 'bot',
        timestamp: new Date().toISOString(),
        metadata: {
          delivery_status: 'sent',
          whatsapp_message_id: data.messages?.[0]?.id
        }
      });

    if (saveError) {
      console.error('Error saving reply message:', saveError);
    }
  } catch (error) {
    console.error('Error sending reply:', error);
  }
}
