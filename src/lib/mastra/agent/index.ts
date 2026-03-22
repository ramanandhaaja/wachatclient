import { Agent } from '@mastra/core/agent';
import { prisma } from '@/lib/prisma';
import { formatWIB } from '@/lib/utils';
import { memory } from '../memory';
import { createTools } from '../tools';

async function getSystemPrompt(userId: string): Promise<string> {
  const businessInfo = await prisma.businessInfo.findFirst({
    where: { userId },
    select: { systemPrompt: true },
  });

  return businessInfo?.systemPrompt || 'You are a helpful AI assistant.';
}

export async function createChatAgent(sessionId: string, userId: string) {
  const systemPrompt = await getSystemPrompt(userId);
  const jakartaDate = formatWIB(new Date(), 'yyyy-MM-dd');
  const tools = createTools(userId);

  const agent = new Agent({
    id: 'whatsapp-chat-agent',
    name: 'WhatsApp Chat Agent',
    instructions: `${systemPrompt}

       Hari ini: ${jakartaDate}

       PENTING: JANGAN PERNAH membuat jawaban sendiri atau menggunakan informasi yang tidak dari tools!
       - SELALU gunakan get-business-info untuk informasi umum bisnis
       - SELALU gunakan check-availability untuk cek slot kosong
       - SELALU gunakan check-schedule untuk melihat jadwal booking yang ada
       - SELALU gunakan book-appointment untuk membuat booking baru

       PANDUAN PENGGUNAAN TOOLS:
       - Untuk informasi umum: WAJIB gunakan get-business-info
       - Untuk cek slot kosong: WAJIB gunakan check-availability, JANGAN menebak ketersediaan
       - Untuk lihat jadwal: WAJIB gunakan check-schedule
       - Untuk booking: WAJIB konfirmasi data dengan pelanggan sebelum gunakan book-appointment

       Gunakan bahasa yang ramah dan informatif serta casual. Selalu tawarkan booking jika pelanggan menanyakan ketersediaan.`,
    model: {
      id: `openai/${process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o'}` as `${string}/${string}`,
      apiKey: process.env.OPENAI_API_KEY_SERVER,
    },
    tools,
    memory,
  });

  return agent;
}
