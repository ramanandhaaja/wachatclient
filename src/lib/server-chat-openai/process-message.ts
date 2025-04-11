import { BufferMemory } from 'langchain/memory';
import { setupChatAgent } from './setup-chat-agent';
import { getTools, BookingState } from './tools';
import { DynamicStructuredTool } from '@langchain/core/tools';

// Store conversation memory for different sessions
const sessionMemories: Record<string, BufferMemory> = {};

// Store booking state for different sessions
const sessionBookingStates: Record<string, BookingState> = {};

// Maximum number of messages to keep in memory
const MAX_MESSAGES = 10;

/**
 * Process a message and return the response (server-side function)
 * This is a server-only function that can be imported in API routes
 */
export async function processMessage(sessionId: string, message: string): Promise<string> {
  try {
    console.log('Processing message:', { sessionId, message });

    // Initialize or retrieve memory for this session
    if (!sessionMemories[sessionId]) {
      console.log('Initializing new session memory');
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output"
      });

      // Limit the number of messages by overriding the internal array
      const originalSave = memory.saveContext.bind(memory);
      memory.saveContext = async (input: any, output: any) => {
        await originalSave(input, output);
        const vars = await memory.loadMemoryVariables({});
        if (vars.chat_history && vars.chat_history.length > MAX_MESSAGES) {
          // Keep only the most recent messages
          vars.chat_history = vars.chat_history.slice(-MAX_MESSAGES);
          // @ts-ignore - Accessing internal property to update messages
          memory.chatHistory.messages = vars.chat_history;
        }
      };

      sessionMemories[sessionId] = memory;
    }

    // Initialize or retrieve booking state for this session
    if (!sessionBookingStates[sessionId]) {
      console.log('Initializing new booking state');
      sessionBookingStates[sessionId] = {
        status: 'initial'
      };
    }

    // Get current booking state
    const currentBookingState = sessionBookingStates[sessionId];
    console.log('Current booking state:', currentBookingState);

    // Create a callback to update booking state
    const updateBookingState = (updatedState: Partial<BookingState>) => {
      console.log('Updating booking state:', updatedState);
      sessionBookingStates[sessionId] = {
        ...currentBookingState,
        ...updatedState
      };
      console.log('New booking state:', sessionBookingStates[sessionId]);
    };

    // Setup the chat agent with current booking state and update callback
    console.log('Setting up chat agent');
    const tools = await getTools(currentBookingState, updateBookingState);
    // Use type assertion to fix TypeScript error
    const executor = await setupChatAgent(tools as DynamicStructuredTool[], currentBookingState);

    // Get chat history from memory
    console.log('Loading chat history');
    const history = await sessionMemories[sessionId].loadMemoryVariables({});
    console.log('Chat history:', history);
    
    // Add booking state to context
    const contextWithState = {
      input: message,
      chat_history: history.chat_history || [],
      booking_state: currentBookingState
    };
    
    console.log('Invoking executor with:', contextWithState);

    const result = await executor.invoke(contextWithState);

    console.log('Executor result:', result);

    // Save the conversation to memory
    if (result.output) {
      console.log('Saving to memory:', {
        input: message,
        output: result.output
      });

      await sessionMemories[sessionId].saveContext(
        { input: message },
        { output: result.output }
      );

      return result.output as string;
    } else {
      throw new Error('No output from executor');
    }
  } catch (err) {
    console.error('Error processing message:', err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
    }
    return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
  }
}
