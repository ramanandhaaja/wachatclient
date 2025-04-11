import { BufferMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { setupChatAgent } from "./setup-chat-agent";

// Store conversation memory for different sessions
const sessionMemories: Record<string, BufferMemory> = {};

// Store booking state for different sessions
type BookingState = {
  name?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  barberId?: string;
  status: "initial" | "pending_confirmation" | "confirmed" | "completed";
};

const bookingStates: Record<string, BookingState> = {};

// Maximum number of messages to keep in memory
const MAX_MESSAGES = 10;

/**
 * Process a message and return the response (server-side function)
 * This is a server-only function that can be imported in API routes
 */
export async function processMessage(
  sessionId: string,
  message: string
): Promise<string> {
  try {
    console.log("Processing message:", { sessionId, message });

    // Initialize or retrieve memory for this session
    if (!sessionMemories[sessionId]) {
      console.log("Initializing new session memory");
      const memory = new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
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

    // Initialize booking state if not exists
    if (!bookingStates[sessionId]) {
      bookingStates[sessionId] = { status: "initial" };
    }

    // Update booking state based on message content
    const state = bookingStates[sessionId];
    const lowerMsg = message.toLowerCase();

    // Handle confirmation
    if (state.status === "pending_confirmation") {
      if (
        lowerMsg.includes("ya") ||
        lowerMsg.includes("iya") ||
        lowerMsg.includes("ok") ||
        lowerMsg.includes("benar") ||
        lowerMsg.includes("setuju")
      ) {
        state.status = "confirmed";
      } else if (
        lowerMsg.includes("tidak") ||
        lowerMsg.includes("batal") ||
        lowerMsg.includes("gak") ||
        lowerMsg.includes("nggak")
      ) {
        state.status = "initial";
        // Clear booking info
        state.name = undefined;
        state.phone = undefined;
        state.service = undefined;
        state.date = undefined;
        state.time = undefined;
        state.barberId = undefined;
      }
    }

    // Extract name and phone if provided together
    const namePhoneMatch = lowerMsg.match(/([a-z]+)\s+(\d{6,})/i);
    if (namePhoneMatch) {
      state.name = namePhoneMatch[1];
      state.phone = namePhoneMatch[2];
    }

    // Extract time if mentioned
    if (lowerMsg.includes("jam")) {
      const timeMatch = lowerMsg.match(
        /jam\s*(\d{1,2})(?:[:.](\d{2}))?\s*(pagi|siang|sore|malam)?/i
      );
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? timeMatch[2] : "00";
        const period = timeMatch[3]?.toLowerCase();

        // Convert to 24-hour format
        if (period === "siang" && hour < 12) hour += 12;
        if (period === "sore") hour += 12;
        if (period === "malam" && hour < 12) hour += 12;
        if (period === "pagi" && hour === 12) hour = 0;

        state.time = `${hour.toString().padStart(2, "0")}:${minute}`;
      }
    }

    // Extract date if "besok" is mentioned
    if (lowerMsg.includes("besok")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      state.date = tomorrow.toISOString().split("T")[0];
    }

    // Extract service type
    if (lowerMsg.includes("gunting") || lowerMsg.includes("potong")) {
      state.service = "potong";
    }

    // If we have all booking info but haven't asked for confirmation
    if (
      state.status === "initial" &&
      state.name &&
      state.phone &&
      state.service &&
      (state.date || lowerMsg.includes("besok"))
    ) {
      state.status = "pending_confirmation";
    }

    // Setup the agent
    console.log("Setting up chat agent");
    const executor = await setupChatAgent();

    // Get chat history from memory
    console.log("Loading chat history");
    const history = await sessionMemories[sessionId].loadMemoryVariables({});
    console.log("Chat history:", history);

    // Add booking state to context
    const contextWithState = {
      input: message,
      chat_history: history.chat_history || [],
      booking_state: state,
    };

    console.log("Invoking executor with:", contextWithState);

    const result = await executor.invoke(contextWithState);

    console.log("Executor result:", result);

    // Save the conversation to memory
    if (result.output) {
      console.log("Saving to memory:", {
        input: message,
        output: result.output,
      });

      await sessionMemories[sessionId].saveContext(
        { input: message },
        { output: result.output }
      );

      // Clear booking state if booking was completed
      if (state.status === "completed") {
        bookingStates[sessionId] = { status: "initial" };
      }

      return result.output as string;
    } else {
      throw new Error("No output from executor");
    }
  } catch (err) {
    console.error("Error processing message:", err);
    if (err instanceof Error) {
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
    }
    return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
  }
}
