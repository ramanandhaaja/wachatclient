import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { setupChatAgent } from './setup-chat-agent';

// Store conversation memory for different sessions
const sessionMemories: Record<string, ConversationSummaryMemory> = {};

/**
 * Process a message and return the response (server-side function)
 * This is a server-only function that can be imported in API routes
 */
export async function processMessage(sessionId: string, message: string): Promise<string> {
  try {
    // Initialize or retrieve memory for this session
    if (!sessionMemories[sessionId]) {
      sessionMemories[sessionId] = new ConversationSummaryMemory({
        memoryKey: "chat_history",
        llm: new ChatOpenAI({ temperature: 0 }),
        returnMessages: true,
      });
    }

    // Setup the agent
    const executor = await setupChatAgent();

    // Get chat history from memory
    const history = await sessionMemories[sessionId].loadMemoryVariables({});
    
    // Ensure chat_history is initialized as an empty array if undefined
    const chatHistory = history.chat_history || [];

    // Process the message with history
    const result = await executor.invoke({
      input: message,
      chat_history: chatHistory,
    });

    // Save the conversation to memory
    await sessionMemories[sessionId].saveContext(
      { input: message },
      { output: result.output }
    );

    return result.output as string;
  } catch (err) {
    console.error('Error processing message:', err);
    return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
  }
}
