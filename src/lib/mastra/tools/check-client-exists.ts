import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { BookingStore } from './types';

export function createCheckClientExistsTool(sessionId: string, store: BookingStore) {
  return createTool({
    id: 'check-client-exists',
    description: 'Cek apakah klien dengan nomor telepon tertentu sudah ada di database',
    inputSchema: z.object({
      phone: z.string().describe('Nomor telepon/WhatsApp pelanggan'),
    }),
    outputSchema: z.object({
      result: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const client = await prisma.client.findFirst({
          where: { phone: context.phone },
        });

        if (client) {
          store.updateBookingState(sessionId, {
            phone: context.phone,
            name: client.name,
            clientExists: true,
          });
          return {
            result: `Klien ditemukan:\n          Nama: ${client.name}\n          Telepon: ${client.phone}`,
          };
        }

        store.updateBookingState(sessionId, {
          phone: context.phone,
          clientExists: false,
        });
        return {
          result: 'Klien dengan nomor telepon tersebut belum terdaftar. Silakan tanyakan nama pelanggan.',
        };
      } catch (error) {
        console.error('Error checking client:', error);
        return { result: 'Maaf, terjadi kesalahan saat memeriksa data pelanggan.' };
      }
    },
  });
}
