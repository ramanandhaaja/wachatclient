import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface WhatsAppState {
  success: boolean;
  state: 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'DISCONNECTED';
  qr: string | null;
  message: string;
}

type SessionResponse = WhatsAppState & {
  error?: string;
};

export const useWhatsApp = (userId?: string) => {
  // Query for session status
  const defaultState: WhatsAppState = {
    success: false,
    state: 'DISCONNECTED',
    qr: null,
    message: ''
  };

  // Use separate state to control polling
  const [shouldPoll, setShouldPoll] = useState(false);

  const { data, error, refetch } = useQuery<WhatsAppState>({
    queryKey: ['whatsapp-status', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await fetch(`http://localhost:3007/session/${userId}/status`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to check WhatsApp session status');
      }
      // Update polling state based on response
      setShouldPoll(data.state !== 'DISCONNECTED');
      return data;
    },
    enabled: !!userId,
    refetchInterval: shouldPoll ? 1000 : false, // Only poll when not disconnected
    retry: false
  });

  const whatsAppState = data || defaultState;

  // Mutation for starting session
  const { mutateAsync: startSession, isPending: isLoading } = useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error('User ID is required');
      const response = await fetch('http://localhost:3007/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start WhatsApp session');
      }
      return data;
    }
  });

  return {
    startSession,
    isLoading,
    error,
    whatsAppState
  };
};
