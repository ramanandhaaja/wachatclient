import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { BookingState } from './tools';
import { prisma } from '@/lib/prisma';
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { z } from "zod";

// Memory key for chat history
const MEMORY_KEY = "chat_history";

// Get current date in Jakarta timezone
const now = new Date();
const jakartaDate = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(now).split('/').reverse().join('-');


// Helper function to get system prompt
async function getSystemPrompt(userId: string) {
  const businessInfo = await prisma.businessInfo.findFirst({
    where: {
      userId: userId
    },
    select: {
      systemPrompt: true
    }
  });

  if (!businessInfo || !businessInfo.systemPrompt) {
    return 'You are a helpful AI assistant.';
  }

  return businessInfo.systemPrompt;
}


// Setup chat agent with LangChain
export async function setupChatAgent(tools: DynamicStructuredTool[], useServerKey: boolean = false, userId: string) {
  console.log('[setupChatAgent] START', { toolsCount: tools.length, useServerKey, userId });

  // Get system prompt
  const systemPrompt = await getSystemPrompt(userId);
  console.log('[setupChatAgent] Got system prompt');

  // Initialize the model
  const apiKey = useServerKey 
    ? process.env.OPENAI_API_KEY_SERVER 
    : process.env.OPENAI_API_KEY;
  console.log('[setupChatAgent] Preparing ChatOpenAI model', { apiKeyUsed: useServerKey ? 'SERVER' : 'PRIMARY', hasKey: !!apiKey });

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL,
    openAIApiKey: apiKey,
    streaming: false,
  });

  // OpenRouter integration (secondary model)
  const model2 = new ChatOpenAI({
    modelName: 'openrouter/optimus-alpha',
    temperature: 0.8,
    streaming: true,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Barbershop',
      }
    }
  });
  console.log('[setupChatAgent] Model(s) created');

  // Add a fallback mechanism to handle rate limit errors
  const originalInvoke = model.invoke.bind(model);
  model.invoke = async (...args) => {
    try {
      return await originalInvoke(...args);
    } catch (error: any) {
      if (error.message && error.message.includes('429') && process.env.OPENAI_API_KEY_SERVER) {
        console.log('[setupChatAgent] Rate limit hit, using server API key as fallback');
        const fallbackModel = new ChatOpenAI({
          temperature: 0,
          modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL,
          openAIApiKey: process.env.OPENAI_API_KEY_SERVER,
          streaming: false,
        });
        return await fallbackModel.invoke(...args);
      }
      throw error;
    }
  };

  // Create prompt template with memory
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `${systemPrompt}

       Hari ini: ${jakartaDate}

       {booking_state}

       PENTING: JANGAN PERNAH membuat jawaban sendiri atau menggunakan informasi yang tidak dari tools!
       - SELALU gunakan get_business_info untuk informasi umum bisnis
       - SELALU gunakan get_hours untuk informasi jam operasional
       - SELALU gunakan check_availability untuk cek slot kosong
       - SELALU gunakan check_client_exists untuk cek data pelanggan

       PANDUAN PENGGUNAAN TOOLS:
       - Untuk informasi umum pertanyaan: WAJIB gunakan get_business_info, JANGAN membuat daftar sendiri
       - Untuk jam operasional: WAJIB gunakan get_hours, JANGAN menyebutkan jam sendiri
       - Untuk cek slot: WAJIB gunakan check_availability, JANGAN menebak ketersediaan
      
       Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.`
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
  console.log('[setupChatAgent] Prompt created');

  // --- Pinecone Retriever + Tools Agent Pattern ---
  console.log('[setupChatAgent] Creating Pinecone vector store');
  const index = pinecone.Index(process.env.PINECONE_INDEX!);
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY_SERVER }),
    {
      pineconeIndex: index,
      namespace: userId,
    }
  );
  console.log('[setupChatAgent] Pinecone vector store ready');
  const retriever = vectorStore.asRetriever({ k: 5 });

  // Add Pinecone knowledge base search as a tool
  const knowledgeBaseTool = new DynamicStructuredTool({
    name: "knowledge_base_search",
    description: "informasi mengenai detail menu dan daftar rekanan gedung",
    schema: z.object({
      query: z.string().describe("informasi mengenai detail menu dan daftar rekanan gedung."),
    }),
    func: async ({ query }) => {
      const docs = await retriever.getRelevantDocuments(query);
      return docs.map(doc => doc.pageContent).join("\n\n");
    },
  });

  const allTools = [...tools, knowledgeBaseTool];
  console.log('[setupChatAgent] All tools prepared:', allTools.length);

  // Create the agent using the newer tools API
  console.log('[setupChatAgent] Creating OpenAI tools agent');
  const agent = await createOpenAIToolsAgent({
    llm: model,
    prompt,
    tools: allTools,
  });
  console.log('[setupChatAgent] Agent created');

  // Create the executor and explicitly return it
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: false
  });
  console.log('[setupChatAgent] Executor created, returning');
  return executor;
}

