import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { prisma } from '@/lib/prisma';

// Helper function to get current Jakarta date (fresh per call)
function getJakartaDate(): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()).split('/').reverse().join('-');
}

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
  const systemPrompt = await getSystemPrompt(userId);

  const apiKey = useServerKey
    ? process.env.OPENAI_API_KEY_SERVER
    : process.env.OPENAI_API_KEY;

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL,
    openAIApiKey: apiKey,
    streaming: false,
  });

  // Compute fresh date per invocation to avoid stale date after midnight
  const jakartaDate = getJakartaDate();

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

  const agent = await createOpenAIToolsAgent({
    llm: model,
    prompt,
    tools,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: false
  });

  return executor;
}
