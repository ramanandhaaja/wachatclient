import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { BUSINESS_INFO } from './setup-chat-agent';
import { prisma } from '@/lib/prisma';
import { toUTC } from '@/lib/utils';

type ServiceInfo = {
  [key: string]: string;
};

type LocationInfo = {
  [key: string]: string;
};

type BarberInfo = {
  id: string;
  name: string;
  speciality: string;
  available: boolean;
};

const barbers: BarberInfo[] = [
  { id: "1", name: "Pak Adi", speciality: "Classic cuts, Pompadour", available: true },
  { id: "2", name: "Mas Budi", speciality: "Kids cut, Modern style", available: true },
  { id: "3", name: "Bang Dedi", speciality: "Coloring, Fade specialist", available: true },
  { id: "4", name: "Pak Eko", speciality: "Beard grooming, Traditional cuts", available: true },
  { id: "5", name: "Mas Fajar", speciality: "Korean style, Trendy cuts", available: true }
];

/**
 * Get tools for the LangChain chat agent
 */
export async function getTools() {
  const checkAvailability = new DynamicStructuredTool({
    name: "check_availability",
    description: "Cek slot kosong untuk booking",
    schema: z.object({
      date: z.string().describe("Tanggal untuk cek ketersediaan (format: YYYY-MM-DD)"),
      service: z.string().describe("Layanan yang ingin di-booking"),
      barberId: z.string().optional().describe("ID barber yang diinginkan (opsional)"),
    }),
    func: async ({ date, service, barberId }) => {
      // Placeholder: In a real implementation, this would check a database
      if (barberId) {
        const barber = barbers.find(b => b.id === barberId);
        if (!barber) return "Maaf, barber tidak ditemukan.";
        if (!barber.available) return "Maaf, barber sedang tidak available hari ini.";
      }
      
      return `Slot tersedia untuk ${service} pada ${date}:
      - 10:00 WIB
      - 14:30 WIB
      - 16:15 WIB
      
      Silakan pilih waktu yang Anda inginkan untuk booking.`;
    },
  });

  const getServiceInfo = new DynamicStructuredTool({
    name: "get_service_info",
    description: "Informasi layanan dan harga",
    schema: z.object({
      service: z.string().describe("Nama layanan yang ingin dicek"),
    }),
    func: async ({ service }) => {
      const services: ServiceInfo = {
        'potong': `${BUSINESS_INFO.services.potong} (30-45 menit)`,
        'anak': `${BUSINESS_INFO.services.anak} (20-30 menit)`,
        'komplit': `${BUSINESS_INFO.services.komplit} (60 menit)`,
        'jenggot': `${BUSINESS_INFO.services.jenggot} (20 menit)`,
        'creambath': `${BUSINESS_INFO.services.creambath} (45-60 menit)`,
        'warna': `${BUSINESS_INFO.services.warna} (90-120 menit)`,
        'promo': `Promo saat ini:
        - ${BUSINESS_INFO.promos.weekday}
        - ${BUSINESS_INFO.promos.weekend}`
      };
      return services[service.toLowerCase()] || 'Maaf, layanan tersebut belum ada. Silakan cek daftar layanan kami.';
    },
  });

  const getBarberInfo = new DynamicStructuredTool({
    name: "get_barber_info",
    description: "Informasi tentang barber yang tersedia",
    schema: z.object({
      barberId: z.string().optional().describe("ID barber spesifik (opsional)"),
    }),
    func: async ({ barberId }) => {
      if (barberId) {
        const barber = barbers.find(b => b.id === barberId);
        if (!barber) return "Maaf, barber tidak ditemukan.";
        return `${barber.name}
        Spesialisasi: ${barber.speciality}
        Status: ${barber.available ? 'Available' : 'Tidak available'}`;
      }
      
      return `Daftar Barber kami:
      ${barbers.map(b => `- ${b.name} (${b.speciality})`).join('\n      ')}
      
      Semua barber kami berpengalaman minimal 5 tahun.`;
    },
  });

  const getLocation = new DynamicStructuredTool({
    name: "get_location",
    description: "Informasi lokasi dan petunjuk arah",
    schema: z.object({
      type: z.string().describe("Tipe informasi: 'alamat' atau 'maps'"),
    }),
    func: async ({ type }) => {
      const location: LocationInfo = {
        alamat: `Barbershop kami berlokasi di:
        ${BUSINESS_INFO.location.address}
        ${BUSINESS_INFO.location.area}
        ${BUSINESS_INFO.location.landmark}
        
        Landmark terdekat:
        - Seberang Mall BSD
        - Sebelah Bank BCA
        - 100m dari Halte BSD`,
        maps: `Anda bisa mengakses lokasi kami di Google Maps:
        https://maps.google.com/?q=Barbershop+BSD
        
        Atau gunakan keyword "Barbershop BSD" di Gojek/Grab`
      };
      return location[type as keyof LocationInfo] || location.alamat;
    },
  });

  const bookAppointment = new DynamicStructuredTool({
    name: "book_appointment",
    description: "Proses booking appointment",
    schema: z.object({
      date: z.string().describe("Tanggal booking (format: YYYY-MM-DD)"),
      time: z.string().describe("Waktu booking (format: HH:MM)"),
      service: z.string().describe("Layanan yang dipilih"),
      name: z.string().describe("Nama pelanggan"),
      phone: z.string().describe("Nomor WhatsApp"),
      barberId: z.string().optional().describe("ID barber yang diinginkan (opsional)"),
    }),
    func: async ({ date, time, service, name, phone, barberId }) => {
      try {
        // When a user enters 9 AM in the chat, they mean 9 AM WIB
        // JavaScript's Date constructor will interpret this as 9 AM in the local timezone
        // which is already correct for WIB input
        const localDate = new Date(`${date}T${time}:00`);
        
        // For database storage, we need to convert to UTC
        // No need to use toUTC here as JavaScript's toISOString() already converts to UTC
        const utcISOString = localDate.toISOString();
        
        // Prepare the data according to the EventSchema
        const eventData: any = {
          startTime: utcISOString,
          clientInfo: {
            name,
            phone,
            // Only include email if it exists
          },
          serviceType: service,
          // Only include optional fields if they exist
        };
        
        // If barberId is provided, add it to the request
        if (barberId) {
          eventData.providerId = barberId;
          
          // If we have a barber ID, try to get the name
          const barber = barbers.find(b => b.id === barberId);
          if (barber) {
            eventData.providerName = barber.name;
          }
        }
        
        // First, check if client with this phone number already exists
        let client = await prisma.client.findFirst({
          where: {
            phone: phone,
          },
        });

        // If client doesn't exist, create a new one
        if (!client) {
          client = await prisma.client.create({
            data: {
              name: name,
              phone: phone,
            },
          });
        }

        // Get the user (assuming we have a default user for the chatbot)
        const user = await prisma.user.findFirst();
        
        if (!user) {
          return "Maaf, terjadi kesalahan sistem. Silakan coba lagi nanti.";
        }
        
        // Calculate end time based on event duration
        const endTime = new Date(utcISOString);
        endTime.setMinutes(endTime.getMinutes() + (user.eventDuration || 60)); // Default to 60 minutes if not set
        
        // Create the event directly using prisma
        const event = await prisma.event.create({
          data: {
            startTime: utcISOString, // Store as UTC in the database
            endTime,
            serviceType: service,
            providerId: barberId,
            providerName: eventData.providerName,
            userId: user.id,
            clientId: client.id,
          },
          include: {
            client: true
          },
        });
        
        // Format the response message - convert UTC times back to WIB for display
        const localStartTime = new Date(event.startTime);
        
        return `Booking berhasil!

      •⁠  ⁠*Layanan*: ${service}
      •⁠  ⁠*Tanggal*: ${localStartTime.toLocaleDateString('id-ID')}
      •⁠  ⁠*Jam*: ${localStartTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      •⁠  ⁠*Nama*: ${event.client.name}
      •⁠  ⁠*WhatsApp*: ${event.client.phone}
      •⁠  ⁠*Barber*: ${event.providerName || "barber yang available"}
      
      Mohon datang 5 menit sebelum jadwal.
      Kami akan mengirimkan reminder via WhatsApp 1 jam sebelum jadwal Anda.`;
      } catch (error) {
        console.error("Error booking appointment:", error);
        return "Maaf, terjadi kesalahan saat booking. Silakan coba lagi atau hubungi kami langsung.";
      }
    },
  });

  return [checkAvailability, getServiceInfo, getBarberInfo, getLocation, bookAppointment];
}
