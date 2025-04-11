import { DynamicStructuredTool } from '@langchain/core/tools';
import { BufferMemory } from 'langchain/memory';
import { setupChatAgent } from './setup-chat-agent';
import { getTools } from './tools';
import { useBookingStore, BookingState } from '@/stores/bookingStore';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

// In-memory session storage
const sessionMemory: { [key: string]: BufferMemory } = {};

// Maximum number of messages to keep in memory
const MAX_MESSAGES = 10;

/**
 * Process a message and return the response (server-side function)
 * This is a server-only function that can be imported in API routes
 */
export async function processMessage(sessionId: string, message: string): Promise<string> {
  try {
    console.log('Processing message:', { sessionId, message });

    // Initialize memory for this session if it doesn't exist
    if (!sessionMemory[sessionId]) {
      console.log('Initializing new memory');
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output"
      });

      sessionMemory[sessionId] = memory;
    }

    // Initialize booking state if not exists
    const bookingStore = useBookingStore.getState();
    let currentBookingState = bookingStore.getBookingState(sessionId);
    if (!currentBookingState) {
      bookingStore.initializeSession(sessionId);
      currentBookingState = bookingStore.getBookingState(sessionId);
    }

    // Get chat history from memory
    const history = await sessionMemory[sessionId].loadMemoryVariables({});
    console.log('Loaded chat history:', history);

    // Add booking state to context
    const contextWithState = {
      input: message,
      chat_history: history.chat_history || [],
      booking_state: JSON.stringify(currentBookingState, null, 2)
    };

    // Get tools based on session ID
    const tools = await getTools(sessionId);

    // Setup the chat agent
    console.log('Setting up chat agent');
    const executor = await setupChatAgent(tools as DynamicStructuredTool[]);

    // Invoke the executor with the context
    console.log('Invoking executor with:', contextWithState);
    const result = await executor.invoke(contextWithState);

    console.log('Executor result:', result);

    // Save the context using the memory's save method
    if (result.output) {
      console.log('Saving to memory:', {
        input: message,
        output: result.output
      });

      await sessionMemory[sessionId].saveContext(
        { input: message },
        { output: result.output }
      );

      return result.output as string;
    } else {
      return "I apologize, but I couldn't process your message properly.";
    }
  } catch (error) {
    console.error('Error processing message:', error);
    return "I apologize, but an error occurred while processing your message.";
  }
}
