import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { wibTimeToUTC, isWithinAvailability, findOverlappingEvent, getWIBDayOfWeek } from '@/lib/calendar-utils';
import { formatWIB } from '@/lib/utils';

export function createBookAppointmentTool(userId: string) {
  return createTool({
    id: 'book-appointment',
    description: 'Buat booking appointment untuk pelanggan',
    inputSchema: z.object({
      date: z.string().describe('Tanggal booking (format: YYYY-MM-DD)'),
      time: z.string().describe('Waktu booking dalam WIB (format: HH:mm)'),
      service: z.string().describe('Layanan yang dipilih'),
      name: z.string().describe('Nama pelanggan'),
      phone: z.string().describe('Nomor WhatsApp pelanggan'),
    }),
    outputSchema: z.object({
      result: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const startTime = wibTimeToUTC(context.date, context.time);
        const dayOfWeek = getWIBDayOfWeek(startTime);

        const [user, availabilityWindows] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { eventDuration: true },
          }),
          prisma.availability.findMany({
            where: { userId, dayOfWeek },
            select: { startTime: true, endTime: true },
          }),
        ]);

        if (!user) {
          return { result: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi nanti.' };
        }

        if (availabilityWindows.length === 0) {
          return { result: 'Maaf, tidak ada jadwal tersedia pada hari tersebut.' };
        }

        if (!isWithinAvailability(startTime, user.eventDuration, availabilityWindows)) {
          return {
            result: 'Maaf, waktu yang dipilih di luar jam operasional. Silakan gunakan check-availability untuk melihat slot yang tersedia.',
          };
        }

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + user.eventDuration);

        const [overlap, existingClient] = await Promise.all([
          findOverlappingEvent(userId, startTime, endTime),
          prisma.client.findFirst({
            where: { phone: context.phone, userId },
          }),
        ]);

        if (overlap) {
          return {
            result: 'Maaf, slot waktu tersebut sudah terisi. Silakan gunakan check-availability untuk melihat slot lain yang tersedia.',
          };
        }

        const client = existingClient ?? await prisma.client.create({
          data: {
            name: context.name,
            phone: context.phone,
            userId,
          },
        });

        await prisma.event.create({
          data: {
            startTime,
            endTime,
            serviceType: context.service,
            userId,
            clientId: client.id,
          },
        });

        const wibStart = formatWIB(startTime, 'HH:mm');
        const wibEnd = formatWIB(endTime, 'HH:mm');
        const wibDate = formatWIB(startTime, 'dd MMMM yyyy');

        return {
          result: `Booking berhasil!

• Layanan: ${context.service}
• Tanggal: ${wibDate}
• Jam: ${wibStart} - ${wibEnd} WIB
• Nama: ${client.name}
• WhatsApp: ${client.phone}

Mohon datang 5 menit sebelum jadwal.`,
        };
      } catch (error) {
        console.error('Error booking appointment:', error);
        return {
          result: 'Maaf, terjadi kesalahan saat booking. Silakan coba lagi atau hubungi kami langsung.',
        };
      }
    },
  });
}
