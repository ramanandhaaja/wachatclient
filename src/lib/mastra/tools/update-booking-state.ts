import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { type BookingState } from '@/stores/bookingStore';
import type { BookingStore } from './types';

export function createUpdateBookingStateTool(sessionId: string, store: BookingStore) {
  return createTool({
    id: 'update-booking-state',
    description: 'Update status booking dan data pelanggan',
    inputSchema: z.object({
      name: z.string().optional().describe('Nama pelanggan'),
      phone: z.string().optional().describe('Nomor telepon pelanggan'),
      service: z.string().optional().describe('Layanan yang dipilih'),
      date: z.string().optional().describe('Tanggal booking (format: YYYY-MM-DD)'),
      time: z.string().optional().describe('Waktu booking (format: HH:MM)'),
      barberId: z.string().optional().describe('ID barber yang dipilih'),
      status: z
        .enum(['initial', 'pending_confirmation', 'confirmed', 'completed'])
        .optional()
        .describe('Status booking'),
    }),
    outputSchema: z.object({
      response: z.string(),
    }),
    execute: async ({ context }) => {
      const currentState = store.getBookingState(sessionId);

      const updateObj: Partial<BookingState> = {};
      if (context.name) updateObj.name = context.name;
      if (context.phone) updateObj.phone = context.phone;
      if (context.service) updateObj.service = context.service;
      if (context.date) updateObj.date = context.date;
      if (context.time) updateObj.time = context.time;
      if (context.barberId) updateObj.barberId = context.barberId;
      if (context.status) updateObj.status = context.status;

      if (context.status === 'pending_confirmation') {
        const requiredFields = ['name', 'phone', 'service', 'date', 'time'];
        const missingFields = requiredFields.filter(
          (field) =>
            !currentState?.[field as keyof BookingState] &&
            !updateObj[field as keyof BookingState],
        );

        if (missingFields.length > 0) {
          updateObj.missingFields = missingFields;
          return {
            response: `Masih ada data yang belum lengkap: ${missingFields.join(', ')}. Silakan lengkapi data tersebut sebelum konfirmasi.`,
          };
        }
        updateObj.missingFields = [];
      }

      store.updateBookingState(sessionId, updateObj);
      const updatedState = store.getBookingState(sessionId);

      let response = 'Status booking telah diupdate.\n\n';

      if (context.status === 'confirmed' && currentState?.status === 'pending_confirmation') {
        response = 'Terima kasih atas konfirmasi Anda! Saya akan segera memproses booking Anda.';
      } else if (updatedState?.status === 'pending_confirmation') {
        response += `Detail booking:
        • Nama: ${updatedState.name}
        • Telepon: ${updatedState.phone}
        • Layanan: ${updatedState.service}
        • Tanggal: ${updatedState.date}
        • Waktu: ${updatedState.time}

        Apakah data di atas sudah benar? Silakan konfirmasi untuk melanjutkan proses booking.`;
      } else {
        response += `Status booking saat ini: ${updatedState?.status}`;
      }

      return { response };
    },
  });
}
