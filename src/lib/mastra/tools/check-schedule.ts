import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { wibTimeToUTC } from '@/lib/calendar-utils';
import { formatWIB } from '@/lib/utils';

export function createCheckScheduleTool(userId: string) {
  return createTool({
    id: 'check-schedule',
    description: 'Lihat jadwal booking yang sudah ada pada tanggal tertentu',
    inputSchema: z.object({
      startDate: z.string().describe('Tanggal mulai (format: YYYY-MM-DD)'),
      endDate: z.string().optional().describe('Tanggal akhir (format: YYYY-MM-DD, opsional - default sama dengan startDate)'),
    }),
    outputSchema: z.object({
      schedule: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const startDateStr = context.startDate;
        const endDateStr = context.endDate || startDateStr;

        const rangeStart = wibTimeToUTC(startDateStr, '00:00');
        // Use next day 00:00 for exclusive upper bound
        const endDate = new Date(`${endDateStr}T00:00:00.000+07:00`);
        endDate.setDate(endDate.getDate() + 1);
        const rangeEnd = endDate;

        const events = await prisma.event.findMany({
          where: {
            userId,
            startTime: { gte: rangeStart, lt: rangeEnd },
          },
          include: { client: { select: { name: true, phone: true } } },
          orderBy: { startTime: 'asc' },
        });

        if (events.length === 0) {
          const dateRange = startDateStr === endDateStr
            ? startDateStr
            : `${startDateStr} s/d ${endDateStr}`;
          return {
            schedule: `Tidak ada booking pada ${dateRange}.`,
          };
        }

        const formatted = events.map((event) => {
          const date = formatWIB(event.startTime, 'dd MMM yyyy');
          const start = formatWIB(event.startTime, 'HH:mm');
          const end = formatWIB(event.endTime, 'HH:mm');
          const clientName = event.client?.name || 'Unknown';
          const clientPhone = event.client?.phone || '-';

          return `• ${date} | ${start}-${end} WIB | ${clientName} (${clientPhone}) | ${event.serviceType}`;
        });

        const header = startDateStr === endDateStr
          ? `Jadwal pada ${startDateStr}`
          : `Jadwal ${startDateStr} s/d ${endDateStr}`;

        return {
          schedule: `${header} (${events.length} booking):\n${formatted.join('\n')}`,
        };
      } catch (error) {
        console.error('Error checking schedule:', error);
        return { schedule: 'Maaf, terjadi kesalahan saat memeriksa jadwal.' };
      }
    },
  });
}
