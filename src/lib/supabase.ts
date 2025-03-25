import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase tables
export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'bot' | 'admin';
  content: string;
  media_url?: string;
  media_type?: string;
  timestamp: string;
  is_read: boolean;
  metadata?: any;
};

export type Conversation = {
  id: string;
  user_id: string;
  user_phone: string;
  user_name?: string;
  status: 'active' | 'closed' | 'pending';
  last_message?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
  assigned_admin_id?: string;
  is_bot_active: boolean;
};

export type ChatUser = {
  id: string;
  phone: string;
  name?: string;
  profile_image?: string;
  created_at: string;
  last_active?: string;
  metadata?: any;
};

/**
 * Fetches all conversations from Supabase
 * @returns Array of conversations
 */
export async function fetchConversations() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
    
    return data as Conversation[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Fetches messages for a specific conversation
 * @param conversationId The ID of the conversation
 * @returns Array of messages
 */
export async function fetchMessages(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Creates a new message in the database
 * @param message The message to create
 * @returns The created message
 */
export async function createMessage(message: Omit<ChatMessage, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select();
    
    if (error) {
      console.error('Error creating message:', error);
      throw error;
    }
    
    return data[0] as ChatMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

/**
 * Creates a new conversation in the database
 * @param conversation The conversation to create
 * @returns The created conversation
 */
export async function createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        ...conversation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Updates a conversation's status
 * @param id The conversation ID
 * @param status The new status
 * @param adminId Optional admin ID
 * @returns The updated conversation
 */
export async function updateConversationStatus(id: string, status: Conversation['status'], adminId?: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        status,
        assigned_admin_id: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

/**
 * Updates a conversation's last message
 * @param id The conversation ID
 * @param lastMessage The last message
 * @returns The updated conversation
 */
export async function updateConversationLastMessage(id: string, lastMessage: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        last_message: lastMessage,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating conversation last message:', error);
      throw error;
    }
    
    return data[0] as Conversation;
  } catch (error) {
    console.error('Error updating conversation last message:', error);
    throw error;
  }
}
