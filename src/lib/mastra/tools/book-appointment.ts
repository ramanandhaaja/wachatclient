import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { BookingStore } from './types';

export function createBookAppointmentTool(sessionId: string, userId: string, store: BookingStore) {
  return createTool({
    id: 'book-appointment',
    description: 'Proses booking appointment',
    inputSchema: z.object({
      date: z.string().describe('Tanggal booking (format: YYYY-MM-DD)'),
      time: z.string().describe('Waktu booking (format: HH:MM)'),
      service: z.string().describe('Layanan yang dipilih'),
      name: z.string().describe('Nama pelanggan'),
      phone: z.string().describe('Nomor WhatsApp'),
      barberId: z.string().optional().describe('ID barber yang diinginkan (opsional)'),
    }),
    outputSchema: z.object({
      result: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const currentState = store.getBookingState(sessionId);

        if (!currentState || currentState.status !== 'confirmed') {
          return {
            result: 'Booking belum dikonfirmasi oleh pelanggan. Silakan minta konfirmasi terlebih dahulu.',
          };
        }

        const localDate = new Date(`${context.date}T${context.time}:00`);
        const utcISOString = localDate.toISOString();

        let client = await prisma.client.findFirst({
          where: { phone: context.phone },
        });

        if (!client) {
          client = await prisma.client.create({
            data: { name: context.name, phone: context.phone },
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return { result: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi nanti.' };
        }

        const endTime = new Date(utcISOString);
        endTime.setMinutes(endTime.getMinutes() + (user.eventDuration || 60));

        const event = await prisma.event.create({
          data: {
            startTime: utcISOString,
            endTime,
            serviceType: context.service,
            providerId: context.barberId,
            userId: user.id,
            clientId: client.id,
          },
          include: { client: true },
        });

        store.updateBookingState(sessionId, { status: 'completed' });

        const localStartTime = new Date(event.startTime);

        return {
          result: `Booking berhasil!

      •⁠  ⁠*Layanan*: ${context.service}
      •⁠  ⁠*Tanggal*: ${localStartTime.toLocaleDateString('id-ID')}
      •⁠  ⁠*Jam*: ${localStartTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      •⁠  ⁠*Nama*: ${event.client.name}
      •⁠  ⁠*WhatsApp*: ${event.client.phone}
      •⁠  ⁠*Barber*: ${event.providerName || 'barber yang available'}

      Mohon datang 5 menit sebelum jadwal.
      Kami akan mengirimkan reminder via WhatsApp 1 jam sebelum jadwal Anda.`,
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
