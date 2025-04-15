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

// Shared business information
export const BUSINESS_INFO = {
  services: {
    'potong': 'Potong rambut pria (Rp 50.000)',
    'anak': 'Potong rambut anak (Rp 35.000)',
    'komplit': 'Potong + cuci + pijat (Rp 85.000)',
    'jenggot': 'Grooming jenggot (Rp 35.000)',
    'creambath': 'Creambath (Rp 75.000)',
    'warna': 'Pewarnaan rambut (mulai Rp 150.000)',
  },
  hours: {
    weekday: '09.00 - 21.00 WIB',
    weekend: '09.00 - 18.00 WIB'
  },
  location: {
    address: 'Jl. Raya Serpong No. 123',
    area: 'BSD City, Tangerang Selatan',
    landmark: '(Sebelah Bank BCA)'
  },
  promos: {
    weekday: 'Diskon 20% untuk pelajar/mahasiswa (Senin-Kamis)',
    weekend: 'Paket Grooming Komplit diskon 15%'
  }
};

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

       Layanan kami:
       ${Object.values(BUSINESS_INFO.services).map(service => `- ${service}`).join('\n       ')}
       
       Jam Operasional:
       - Senin-Jumat: ${BUSINESS_INFO.hours.weekday}
       - Sabtu-Minggu: ${BUSINESS_INFO.hours.weekend}
       
       Lokasi:
       ${BUSINESS_INFO.location.address}
       ${BUSINESS_INFO.location.area}
       ${BUSINESS_INFO.location.landmark}
       
       Promo:
       - ${BUSINESS_INFO.promos.weekday}
       - ${BUSINESS_INFO.promos.weekend}
       
       Panduan untuk booking:
       1. Ketika pelanggan menyebut "besok", gunakan tanggal ${new Date(now.getTime() + 86400000).toISOString().split('T')[0]} (besok)
       2. Ketika pelanggan menyebut waktu (misal "jam 2"), konversi ke format 24 jam (14:00)
       3. Untuk layanan, gunakan nama layanan yang sesuai dari daftar di atas
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
       
       Selalu bantu pelanggan dengan:
       - Informasi layanan dan harga
       - Booking appointment
       - Cek ketersediaan slot
       - Pilihan barber
       - Promo yang sedang berjalan
       - Petunjuk lokasi
       
       Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.
       
       Gunakan tools yang tersedia untuk membantu pelanggan dengan efektif. Pastikan untuk menggunakan tools yang tepat sesuai kebutuhan pelanggan.`
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
  });
  
  return executor;
}
