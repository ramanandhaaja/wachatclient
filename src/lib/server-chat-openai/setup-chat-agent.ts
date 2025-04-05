import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor } from 'langchain/agents';
import { formatToOpenAIFunctionMessages } from 'langchain/agents/format_scratchpad';
import { RunnableSequence } from '@langchain/core/runnables';
import { getTools } from '@/lib/tools';

// Setup chat agent with LangChain
export async function setupChatAgent() {
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
    streaming: false,
  });

  const tools = await getTools();

  // Prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful AI assistant for WhatsBot AI, a SaaS platform for WhatsApp chatbots.
     You help users by providing accurate and friendly information.
     
     If asked about the product, WhatsBot AI offers:
     - Easy WhatsApp integration
     - AI-powered conversations
     - 24/7 automated customer support
     - Custom chat workflows
     - Detailed analytics
     - Multi-language support
     `],
    ["human", "{input}"],
    ["ai", "{agent_scratchpad}"],
  ]);

  // Create the agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  // Create the executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: false,
  });

  // Create the runnable sequence
  const runnable = RunnableSequence.from([
    {
      input: (i) => i.input,
      chat_history: (i) => i.chat_history || [],
      agent_scratchpad: (i) => {
        if (i.steps && i.steps.length) {
          return formatToOpenAIFunctionMessages(i.steps);
        }
        return [];
      },
    },
    prompt,
    agent,
    agentExecutor,
  ]);

  return runnable;
}
