import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Environment variables would be better for these values
const WHATSAPP_API_VERSION = 'v22.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '';

interface SendMessageParams {
  phoneNumber: string;
  message: string;
  previewUrl?: boolean;
  conversationId: string;
}

interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
    error_data?: any;
    fbtrace_id: string;
  };
}

export const useWhatsAppOfficial = () => {
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutation for sending a message via the official WhatsApp Cloud API
  const { mutate: sendMessage, isPending: isSending } = useMutation<
    SendMessageResponse, 
    Error, 
    SendMessageParams
  >({
    mutationFn: async ({ phoneNumber, message, previewUrl = false, conversationId }) => {
      try {
        // Clear previous errors
        setError(null);
        
        // Validate required environment variables
        if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
          throw new Error('WhatsApp API credentials are missing. Please check your environment variables.');
        }
        
        // Format phone number if needed (remove spaces, add country code if missing)
        const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

        // Save message to database first with pending status
        const { data: savedMessage, error: dbError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: message,
            sender_type: 'admin',
            timestamp: new Date().toISOString(),
            metadata: {
              delivery_status: 'pending'
            }
          })
          .select()
          .single();
          
        if (dbError) {
          console.error('Error saving message to database:', dbError);
          throw new Error('Failed to save message');
        }
        
        console.log('[WhatsApp Hook] Debug Info:', {
          phoneNumber: formattedPhoneNumber,
          message: message,
          apiVersion: WHATSAPP_API_VERSION,
          phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
        });

        const requestBody = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhoneNumber,
          type: 'text',
          text: {
            preview_url: previewUrl,
            body: message
          }
        };

        console.log('[WhatsApp Hook] Request Body:', requestBody);

        const response = await fetch(
          `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, 
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          }
        );

        const data = await response.json();
        console.log('[WhatsApp Hook] Response Data:', data);
        
        // Check for errors in the response
        if (data.error) {
          // Update message status to failed
          await supabase
            .from('messages')
            .update({
              metadata: {
                delivery_status: 'failed',
                error: data.error.message
              }
            })
            .eq('id', savedMessage.id);

          throw new Error(data.error.message || 'Failed to send WhatsApp message');
        }
        
        // Store the message ID and update status to sent
        if (data.messages && data.messages.length > 0) {
          setLastMessageId(data.messages[0].id);
          
          await supabase
            .from('messages')
            .update({
              metadata: {
                delivery_status: 'sent',
                whatsapp_message_id: data.messages[0].id
              }
            })
            .eq('id', savedMessage.id);
        }
        
        return data;
      } catch (err: any) {
        setError(err.message || 'An error occurred while sending the message');
        throw err;
      }
    },
    onError: (err) => {
      setError(err.message || 'Failed to send message');
    }
  });

  // Helper function to format phone numbers
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If the number doesn't start with '+', add it
    if (!phoneNumber.startsWith('+')) {
      // Assuming default country code is +1 (US/Canada)
      // You might want to make this configurable based on your user base
      return `+${digitsOnly}`;
    }
    
    return digitsOnly;
  };

  // Function to check message status using the WhatsApp Cloud API
  const checkMessageStatus = useCallback(async (messageId: string) => {
    try {
      if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        throw new Error('WhatsApp API credentials are missing');
      }
      
      // The WhatsApp Cloud API provides message status through webhooks
      // This is a placeholder for checking message status
      // In a real implementation, you would typically store message statuses in your database
      // when you receive webhook notifications and then query your database here
      console.log(`Checking status for message ID: ${messageId}`);
      
      return { 
        id: messageId,
        status: 'unknown', // In a real app, you'd return the actual status from your database
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      console.error('Failed to check message status:', err);
      return { error: err.message || 'Failed to check message status' };
    }
  }, []);

  return {
    sendMessage,
    isSending,
    lastMessageId,
    error,
    checkMessageStatus
  };
};
