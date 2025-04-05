import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { setupChatAgent } from './setup-chat-agent';

// Define input type for executor
interface ExecutorInput {
  input: string;
  chat_history?: any[];
  steps?: any[];
}

// Store conversation memory for different sessions
const sessionMemories: Record<string, ConversationSummaryMemory> = {};

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
      sessionMemories[sessionId] = new ConversationSummaryMemory({
        memoryKey: "chat_history",
        llm: new ChatOpenAI({ temperature: 0 }),
        returnMessages: true,
      });
    }

    // Setup the agent
    console.log('Setting up chat agent');
    const executor = await setupChatAgent();

    // Get chat history from memory
    console.log('Loading chat history');
    const history = await sessionMemories[sessionId].loadMemoryVariables({});
    console.log('Chat history:', history);
    
    // Convert message to a HumanMessage
    const currentMessage = new HumanMessage(message);
    
    // Process the message with history
    const executorInput: ExecutorInput = {
      input: message,
      chat_history: history.chat_history || [],
      steps: []
    };

    console.log('Invoking executor with:', executorInput);

    const result = await executor.invoke(executorInput);

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
