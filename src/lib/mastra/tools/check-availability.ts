import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export function createCheckAvailabilityTool() {
  return createTool({
    id: 'check-availability',
    description: 'Cek slot kosong untuk booking',
    inputSchema: z.object({
      date: z.string().describe('Tanggal untuk cek ketersediaan (format: YYYY-MM-DD)'),
      service: z.string().describe('Layanan yang ingin di-booking'),
    }),
    outputSchema: z.object({
      slots: z.string(),
    }),
    execute: async ({ context }) => {
      // Placeholder: In a real implementation, this would check a database
      return {
        slots: `Slot tersedia untuk ${context.service} pada ${context.date}:
      - 10:00 WIB
      - 10.30 WIB
      - 11.00 WIB
      - 11.30 WIB
      - 12.00 WIB

      Silakan pilih waktu yang Anda inginkan untuk booking.`,
      };
    },
  });
}
