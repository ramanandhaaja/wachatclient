import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useEffect } from 'react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  timestamp: string;
  is_read: boolean;
  metadata: any;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  user_phone: string;
  user_name: string | null;
  status: string;
  last_message: string | null;
  last_message_time: string | null;
  created_at: string;
  updated_at: string;
  assigned_admin_id: string | null;
  is_bot_active: boolean;
  source: 'web' | 'whatsapp';
}

// Fetch conversations from Supabase
async function fetchConversations(userId: string, source?: 'web' | 'whatsapp') {
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_time', { ascending: false });

  if (source) {
    query = query.eq('source', source);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch messages for a conversation
async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Hook to manage conversations
export function useConversations(userId: string, source?: 'web' | 'whatsapp') {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error } = useQuery<Conversation[]>({
    queryKey: ['conversations', source],
    queryFn: () => fetchConversations(userId, source),
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          // Invalidate and refetch conversations
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    conversations: conversations || [],
    isLoading,
    error: error as Error | null,
  };
}

// Fetch conversation by id
async function fetchConversation(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) throw error;
  return data;
}

// Hook to manage single conversation and its messages
export function useConversation(conversationId: string | null) {
  const queryClient = useQueryClient();

  // Query for conversation details
  const { 
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError 
  } = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId!),
    enabled: !!conversationId,
  });

  // Query for messages
  const { 
    data: messages, 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          // Invalidate and refetch messages
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);

  // Set up real-time subscription for conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          // Invalidate and refetch conversation
          queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, queryClient]);

  return {
    conversation,
    messages: messages || [],
    isLoading: conversationLoading || messagesLoading,
    error: conversationError || messagesError,
  };
}
