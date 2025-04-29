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
    console.log("Processing message:", { sessionId, message });
    

    // Initialize memory for this session if it doesn't exist
    if (!sessionMemory[sessionId]) {
      console.log("Initializing new memory");
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
      bookingStore.initializeSession(sessionId);
      currentBookingState = bookingStore.getBookingState(sessionId);
    }

    console.log("Current booking state:", currentBookingState);
    //console.log("Booking State value :", bookingStore.getBookingStateValue(sessionId));

    // Get chat history from memory
    const history = await sessionMemory[sessionId].loadMemoryVariables({});
    const messages = history.chat_history as BaseMessage[];
    //console.log("Loaded chat history:", messages);

    // Add booking state to context
    const contextWithState = {
      input: message,
      chat_history: messages || [],
      booking_state: JSON.stringify(currentBookingState, null, 2),
    };

    // Get tools based on session ID
    const tools = await getTools(sessionId, userId);

    // Setup the chat agent
    console.log("Setting up chat agent");
    const executor = await setupChatAgent(tools as DynamicStructuredTool[], true, userId);

    // Invoke the executor with the context
    // console.log("Invoking executor with:", contextWithState);
    
    let result;
    try {
      result = await executor.invoke(contextWithState);
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error.message && error.message.includes('429') && process.env.OPENAI_API_KEY_SERVER) {
        console.log("Rate limit hit, trying with server API key");
        
        // Create a new executor with the server API key
        const serverTools = await getTools(sessionId, userId);
        const serverExecutor = await setupChatAgent(serverTools as DynamicStructuredTool[], true, userId);
        
        // Try again with the server executor
        result = await serverExecutor.invoke(contextWithState);
      } else {
        // If it's not a rate limit error or we don't have a server key, rethrow
        throw error;
      }
    }

    //console.log("Executor result:", result);

    // Save the conversation to memory with proper message formatting
    if (result.output) {
      //console.log("Saving to memory:", {
      //  input: message,
      //  output: result.output,
      //});

      // Create message objects
      const humanMessage = new HumanMessage(message);
      const aiMessage = new AIMessage(result.output);

      // Add messages to chat history
      await sessionMemory[sessionId].chatHistory.addMessage(humanMessage);
      await sessionMemory[sessionId].chatHistory.addMessage(aiMessage);

      //console.log(
      //  "Updated chat history:",
      //  await sessionMemory[sessionId].chatHistory.getMessages()
      //);

      return result.output as string;
    } else {
      return "I apologize, but I couldn't process your message properly.";
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return "I apologize, but an error occurred while processing your message.";
  }
}
