import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

function formatReadable(obj: any, indent = 0): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  const pad = '  '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        return `${pad}${k}:\n${formatReadable(v, indent + 1)}`;
      }
      return `${pad}${k}: ${v}`;
    })
    .join('\n');
}

export function createGetBusinessInfoTool(userId: string) {
  return createTool({
    id: 'get-business-info',
    description: 'Informasi mengenai informasi umum perusahaan',
    inputSchema: z.object({
      service: z.string().describe('Informasi perusahaan yang ingin dicek'),
    }),
    outputSchema: z.object({
      info: z.string(),
    }),
    execute: async ({ context }) => {
      const businessInfo = await prisma.businessInfo.findFirst({
        where: { userId },
        select: { data: true },
      });

      if (!businessInfo) {
        return { info: 'Maaf, informasi perusahaan belum tersedia.' };
      }

      const output = formatReadable(businessInfo.data);
      return { info: output || 'Belum ada informasi bisnis yang tersedia.' };
    },
  });
}
