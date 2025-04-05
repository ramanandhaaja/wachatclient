import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { setupChatAgent } from '@/lib/server-chat-openai/setup-chat-agent';
import { BaseMessage } from '@langchain/core/messages';
import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';

// Store conversation memory for different sessions (client-side only)
const clientSessionMemories: Record<string, ConversationSummaryMemory> = {};

// React hook for client-side chat functionality
export function useOpenAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session when component mounts
  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  // Send a message and get a response
  const sendMessage = useCallback(async (message: string): Promise<string> => {
    if (!sessionId) return "Session not initialized";
    
    setLoading(true);
    setError(null);
    
    try {
      // Initialize or retrieve memory for this session
      if (!clientSessionMemories[sessionId]) {
        clientSessionMemories[sessionId] = new ConversationSummaryMemory({
          memoryKey: "chat_history",
          llm: new ChatOpenAI({ temperature: 0 }),
          returnMessages: true,
        });
      }

      // Setup the agent
      const executor = await setupChatAgent();

      // Get chat history from memory
      const history = await clientSessionMemories[sessionId].loadMemoryVariables({});

      // Process the message with history
      const result = await executor.invoke({
        input: message,
        chat_history: (history.chat_history || []) as BaseMessage[],
      });

      // Save the conversation to memory
      await clientSessionMemories[sessionId].saveContext(
        { input: message } as Record<string, unknown>,
        { output: result.output } as Record<string, unknown>
      );

      const response = result.output as string;
      return response;
    } catch (err) {
      const errorMessage = "Error processing message: " + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      console.error(errorMessage);
      return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (sessionId && clientSessionMemories[sessionId]) {
      delete clientSessionMemories[sessionId];
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  return {
    sendMessage,
    resetConversation,
    loading,
    error,
  };
}
