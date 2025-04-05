import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { AgentExecutor } from 'langchain/agents';
import { getTools } from './tools';

// Memory key for chat history
const MEMORY_KEY = "chat_history";

// Setup chat agent with LangChain
export async function setupChatAgent() {
  // Initialize the model
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
    streaming: false,
  });

  // Get the tools
  const tools = await getTools();

  // Create prompt template with memory
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful AI assistant for WhatsBot AI, a SaaS platform for WhatsApp chatbots.
       You help users by providing accurate and friendly information about our services.
       
       WhatsBot AI offers:
       - Easy WhatsApp integration
       - AI-powered conversations
       - 24/7 automated customer support
       - Custom chat workflows
       - Detailed analytics
       - Multi-language support
       
       Always be helpful, professional, and concise in your responses.`
    ],
    new MessagesPlaceholder(MEMORY_KEY),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Create the agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  // Create the executor
  const executor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: true,
    returnIntermediateSteps: true,
  });

  return executor;
}
