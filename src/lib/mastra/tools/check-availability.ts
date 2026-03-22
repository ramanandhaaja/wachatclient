import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAvailableSlots, getWIBDayOfWeekFromDateStr } from '@/lib/calendar-utils';
import { formatWIB } from '@/lib/utils';

const WIB_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function createCheckAvailabilityTool(userId: string) {
  return createTool({
    id: 'check-availability',
    description: 'Cek slot kosong untuk booking pada tanggal tertentu',
    inputSchema: z.object({
      date: z.string().describe('Tanggal untuk cek ketersediaan (format: YYYY-MM-DD)'),
    }),
    outputSchema: z.object({
      slots: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { eventDuration: true },
        });

        if (!user) {
          return { slots: 'Maaf, terjadi kesalahan sistem.' };
        }

        const availableSlots = await getAvailableSlots(userId, context.date, user.eventDuration);

        if (availableSlots.length === 0) {
          const dayOfWeek = getWIBDayOfWeekFromDateStr(context.date);
          return {
            slots: `Tidak ada slot tersedia pada hari ${WIB_DAY_NAMES[dayOfWeek]} (${context.date}). Silakan coba tanggal lain.`,
          };
        }

        const formattedSlots = availableSlots
          .map((slot) => `- ${formatWIB(slot.start, 'HH:mm')} WIB`)
          .join('\n');

        return {
          slots: `Slot tersedia pada ${context.date}:\n${formattedSlots}\n\nSilakan pilih waktu yang Anda inginkan untuk booking.`,
        };
      } catch (error) {
        console.error('Error checking availability:', error);
        return { slots: 'Maaf, terjadi kesalahan saat memeriksa ketersediaan.' };
      }
    },
  });
}
