import { Agent } from '@mastra/core/agent';
import { prisma } from '@/lib/prisma';
import { formatWIB } from '@/lib/utils';
import { memory } from './memory';
import { createTools } from './tools';

async function getSystemPrompt(userId: string): Promise<string> {
  const businessInfo = await prisma.businessInfo.findFirst({
    where: { userId },
    select: { systemPrompt: true },
  });

  return businessInfo?.systemPrompt || 'You are a helpful AI assistant.';
}

/**
 * Creates a Mastra Agent configured for a specific session and user.
 * Called per-message since the system prompt and tools are user-specific.
 */
export async function createChatAgent(sessionId: string, userId: string) {
  const systemPrompt = await getSystemPrompt(userId);
  const jakartaDate = formatWIB(new Date(), 'yyyy-MM-dd');
  const tools = createTools(sessionId, userId);

  const agent = new Agent({
    name: 'WhatsApp Chat Agent',
    instructions: `${systemPrompt}

       Hari ini: ${jakartaDate}

       PENTING: JANGAN PERNAH membuat jawaban sendiri atau menggunakan informasi yang tidak dari tools!
       - SELALU gunakan get-business-info untuk informasi umum bisnis
       - SELALU gunakan get-hours untuk informasi jam operasional
       - SELALU gunakan check-availability untuk cek slot kosong
       - SELALU gunakan check-client-exists untuk cek data pelanggan

       PANDUAN PENGGUNAAN TOOLS:
       - Untuk informasi umum pertanyaan: WAJIB gunakan get-business-info, JANGAN membuat daftar sendiri
       - Untuk jam operasional: WAJIB gunakan get-hours, JANGAN menyebutkan jam sendiri
       - Untuk cek slot: WAJIB gunakan check-availability, JANGAN menebak ketersediaan

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
