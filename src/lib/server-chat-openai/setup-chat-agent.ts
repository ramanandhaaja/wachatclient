import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { BookingState } from './tools';

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


// Setup chat agent with LangChain
export async function setupChatAgent(tools: DynamicStructuredTool[], useServerKey: boolean = false) {
  // Initialize the model
  // Determine which API key to use
  const apiKey = useServerKey 
    ? process.env.OPENAI_API_KEY_SERVER 
    : process.env.OPENAI_API_KEY;
  
  //console.log("Using API key:", useServerKey ? "SERVER" : "PRIMARY", apiKey ? "(key is set)" : "(key is not set)");
  
  // Create the model with the selected API key
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL,
    openAIApiKey: apiKey,
    streaming: false,
  });

  //gpt-4o-mini
  // OpenRouter integration
  const model2 = new ChatOpenAI({
    modelName: 'openrouter/optimus-alpha',
    temperature: 0.8,
    streaming: true,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Site URL for rankings on openrouter.ai
        'X-Title': 'Barbershop', // Site title for rankings on openrouter.ai
      }
    }
  });
  
  // Add a fallback mechanism to handle rate limit errors
  const originalInvoke = model.invoke.bind(model);
  model.invoke = async (...args) => {
    try {
      return await originalInvoke(...args);
    } catch (error: any) {
      // If we hit a rate limit error and have a server API key, try again with that
      if (error.message && error.message.includes('429') && process.env.OPENAI_API_KEY_SERVER) {
        //console.log("Rate limit hit, using server API key as fallback");
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
      `Anda adalah asisten virtual yang ramah untuk barbershop kami. Berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.

       Hari ini: ${jakartaDate}

       {booking_state}

       PENTING: JANGAN PERNAH membuat jawaban sendiri atau menggunakan informasi yang tidak dari tools!
       - SELALU gunakan get_service_info untuk informasi layanan dan harga
       - SELALU gunakan get_location untuk informasi lokasi dan petunjuk arah
       - SELALU gunakan get_hours untuk informasi jam operasional
       - SELALU gunakan check_availability untuk cek slot kosong
       - SELALU gunakan check_client_exists untuk cek data pelanggan

       Panduan untuk booking:
       1. Ketika pelanggan menyebut "besok", gunakan tanggal ${new Date(now.getTime() + 86400000).toISOString().split('T')[0]} (besok)
       2. Ketika pelanggan menyebut waktu (misal "jam 2"), konversi ke format 24 jam (14:00)
       3. HANYA gunakan layanan yang tersedia dari get_service_info
       4. Jika pelanggan sudah memberikan nama dan nomor telepon, tanyakan konfirmasi
       5. Jangan tanya ulang informasi yang sudah diberikan pelanggan
       
       ALUR BOOKING YANG BENAR:
       1. Ketika pelanggan ingin booking, SELALU cek ketersediaan terlebih dahulu dengan check_availability
       2. Setelah pelanggan memilih waktu, cek apakah sudah ada data pelanggan dengan nomor telepon tersebut
       3. Jika data tidak lengkap, tanyakan satu per satu: nama, nomor telepon, layanan, tanggal, waktu
       4. Setelah semua data lengkap, ubah status ke pending_confirmation dan tampilkan semua detail booking
       5. Minta konfirmasi dari pelanggan
       6. Jika pelanggan mengkonfirmasi, ubah status ke confirmed dan gunakan book_appointment
       7. Setelah booking berhasil, ubah status ke completed
       
       PANDUAN PENGGUNAAN TOOLS:
       - Untuk informasi layanan/harga: WAJIB gunakan get_service_info, JANGAN membuat daftar sendiri
       - Untuk lokasi/petunjuk arah: WAJIB gunakan get_location, JANGAN membuat petunjuk sendiri
       - Untuk jam operasional: WAJIB gunakan get_hours, JANGAN menyebutkan jam sendiri
       - Untuk promo: WAJIB gunakan get_service_info dengan parameter "promo"
       - Untuk cek slot: WAJIB gunakan check_availability, JANGAN menebak ketersediaan
       
       Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.`
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Create the agent using the newer tools API
  const agent = await createOpenAIToolsAgent({
    llm: model,
    prompt,
    tools,  
  });

  // Create the executor and explicitly return it
  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true
  });
  
  return executor;
}
