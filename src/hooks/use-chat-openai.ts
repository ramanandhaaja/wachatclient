import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createChatAgent } from '@/lib/mastra/agent';

export function useOpenAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (message: string, userId: string): Promise<string> => {
    if (!sessionId) return 'Session not initialized';

    setLoading(true);
    setError(null);

    try {
      const agent = await createChatAgent(sessionId, userId);

      const result = await agent.generate(message, {
        memory: {
          thread: sessionId,
          resource: userId,
        },
      });

      return result.text || "I apologize, but I couldn't process your message properly.";
    } catch (err) {
      const errorMessage = 'Error processing message: ' + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      console.error(errorMessage);
      return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const resetConversation = useCallback(() => {
    setSessionId(uuidv4());
  }, []);

  return {
    sendMessage,
    resetConversation,
    loading,
    error,
  };
}
