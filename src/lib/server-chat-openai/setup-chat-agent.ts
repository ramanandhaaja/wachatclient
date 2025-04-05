import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { AgentExecutor } from 'langchain/agents';
import { getTools } from './tools';

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
export async function setupChatAgent() {
  // Initialize the model
  const model = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini-2024-07-18',
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: false,
  });

  // Get the tools
  const tools = await getTools();

  // Create prompt template with memory
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Anda adalah asisten virtual yang ramah untuk barbershop kami. Berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.

       Hari ini: ${jakartaDate}

       Layanan kami:
       ${Object.values(BUSINESS_INFO.services).map(service => `- ${service}`).join('\n       ')}
       
       Jam Operasional:
       - Senin-Jumat: ${BUSINESS_INFO.hours.weekday}
       - Sabtu-Minggu: ${BUSINESS_INFO.hours.weekend}
       
       Lokasi:
       ${BUSINESS_INFO.location.address}
       ${BUSINESS_INFO.location.area}
       ${BUSINESS_INFO.location.landmark}
       
       Informasi penting:
       - Menerima booking online atau walk-in
       - Tersedia 5 barber profesional
       - Bisa request barber favorit
       - Setiap barber sudah berpengalaman min. 5 tahun
       - Belum tersedia layanan home service
       - Anak-anak welcome (tersedia kursi khusus)
       
       Promo:
       - ${BUSINESS_INFO.promos.weekday}
       - ${BUSINESS_INFO.promos.weekend}
       
       Panduan untuk booking:
       1. Ketika pelanggan menyebut "besok", gunakan tanggal ${new Date(now.getTime() + 86400000).toISOString().split('T')[0]} (besok)
       2. Ketika pelanggan menyebut waktu (misal "jam 2"), konversi ke format 24 jam (14:00)
       3. Untuk layanan, gunakan nama layanan yang sesuai dari daftar di atas
       4. Jika pelanggan sudah memberikan nama dan nomor telepon, langsung lakukan booking
       5. Jangan tanya ulang informasi yang sudah diberikan pelanggan
       
       Contoh percakapan booking yang baik:
       Pelanggan: "Mau booking besok jam 2"
       Anda: [Cek ketersediaan untuk besok]
       Pelanggan: "Untuk potong rambut biasa"
       Anda: [Konfirmasi harga dan minta nama/nomor]
       Pelanggan: "Nama saya Budi 08123456789"
       Anda: [Langsung proses booking dengan data lengkap]
       
       State booking saat ini:
       {booking_state}
       
       Selalu bantu pelanggan dengan:
       - Informasi layanan dan harga
       - Booking appointment
       - Cek ketersediaan slot
       - Pilihan barber
       - Promo yang sedang berjalan
       - Petunjuk lokasi
       
       Gunakan bahasa yang ramah dan informatif. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.
       
       PENTING: Jika booking_state sudah memiliki nama, phone, service, date, dan time, langsung lakukan booking tanpa bertanya lagi.`
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
