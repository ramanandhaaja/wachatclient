import { DynamicStructuredTool } from "@langchain/core/tools";
import { BufferMemory } from "langchain/memory";
import { setupChatAgent } from "./setup-chat-agent";
import { getTools } from "./tools";
import { useBookingStore, BookingState } from "@/stores/bookingStore";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";

// In-memory session storage
const sessionMemory: { [key: string]: BufferMemory } = {};

// Maximum number of messages to keep in memory
const MAX_MESSAGES = 10;

/**
 * Process a message and return the response (server-side function)
 * This is a server-only function that can be imported in API routes
 */
export async function processMessage(
  sessionId: string,
  message: string,
  userId: string
): Promise<string> {
  try {
    console.log('[processMessage] START', { sessionId, message, userId });
    // Initialize memory for this session if it doesn't exist
    if (!sessionMemory[sessionId]) {
      console.log('[processMessage] Initializing new memory for session');
      const chatHistory = new ChatMessageHistory();
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
        chatHistory,
      });
      sessionMemory[sessionId] = memory;
    }

    // Initialize booking state if not exists
    const bookingStore = useBookingStore.getState();
    let currentBookingState = bookingStore.getBookingState(sessionId);
    if (!currentBookingState) {
      console.log('[processMessage] Initializing booking state for session');
      bookingStore.initializeSession(sessionId);
      currentBookingState = bookingStore.getBookingState(sessionId);
    }
    console.log('[processMessage] Current booking state:', currentBookingState);

    // Get chat history from memory
    const history = await sessionMemory[sessionId].loadMemoryVariables({});
    const messages = history.chat_history as BaseMessage[];
    console.log('[processMessage] Loaded chat history:', messages?.length);

    // Add booking state to context
    const contextWithState = {
      input: message,
      chat_history: messages || [],
      booking_state: JSON.stringify(currentBookingState, null, 2),
    };
    console.log('[processMessage] Context for executor:', contextWithState);

    // Get tools based on session ID
    console.log('[processMessage] Fetching tools');
    const tools = await getTools(sessionId, userId);
    console.log('[processMessage] Tools fetched:', Array.isArray(tools) ? tools.length : typeof tools);

    // Setup the chat agent
    console.log('[processMessage] Setting up chat agent');
    const executor = await setupChatAgent(tools as DynamicStructuredTool[], true, userId);
    console.log('[processMessage] Chat agent setup complete');

    // Invoke the executor with the context
    console.log('[processMessage] Invoking executor');
    let result;
    try {
      result = await executor.invoke(contextWithState);
      console.log('[processMessage] Executor result:', result);
    } catch (error: any) {
      console.error('[processMessage] Executor error:', error);
      // Check if it's a rate limit error
      if (error.message && error.message.includes('429') && process.env.OPENAI_API_KEY_SERVER) {
        console.log('[processMessage] Rate limit hit, trying with server API key');
        // Create a new executor with the server API key
        const serverTools = await getTools(sessionId, userId);
        const serverExecutor = await setupChatAgent(serverTools as DynamicStructuredTool[], true, userId);
        // Try again with the server executor
        result = await serverExecutor.invoke(contextWithState);
        console.log('[processMessage] Server executor result:', result);
      } else {
        // If it's not a rate limit error or we don't have a server key, rethrow
        throw error;
      }
    }

    // Save the conversation to memory with proper message formatting
    if (result && result.output) {
      console.log('[processMessage] Saving messages to memory');
      // Create message objects
      const humanMessage = new HumanMessage(message);
      const aiMessage = new AIMessage(result.output);
      // Add messages to chat history
      await sessionMemory[sessionId].chatHistory.addMessage(humanMessage);
      await sessionMemory[sessionId].chatHistory.addMessage(aiMessage);
      console.log('[processMessage] Updated chat history');
      return result.output as string;
    } else {
      console.warn("[processMessage] No valid output from executor");
      return "I apologize, but I couldn't process your message properly.";
    }
  } catch (error) {
    console.error("[processMessage] Error processing message:", error);
    return "I apologize, but an error occurred while processing your message.";
  }
}
