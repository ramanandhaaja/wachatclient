import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { useBookingStore, type BookingState } from '@/stores/bookingStore';

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

/**
 * Creates tools for the Mastra chat agent, scoped to a session and user.
 */
export function createTools(sessionId: string, userId: string) {
  const store = useBookingStore.getState();

  const getBusinessInfo = createTool({
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

  const checkAvailability = createTool({
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

  const checkClientExists = createTool({
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

  const updateBookingState = createTool({
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

  const bookAppointment = createTool({
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

  return {
    getBusinessInfo,
    checkAvailability,
    checkClientExists,
    updateBookingState,
    bookAppointment,
  };
}
