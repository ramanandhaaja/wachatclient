import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { toUTC } from '@/lib/utils';
import { useBookingStore } from '@/stores/bookingStore';


// Define BookingState type to match the one in process-message.ts
export type BookingState = {
  name?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  barberId?: string;
  clientExists?: boolean;
  missingFields?: string[];
  status: 'initial' | 'pending_confirmation' | 'confirmed' | 'completed';
};


/**
 * Get tools for the LangChain chat agent
 */
export async function getTools(sessionId: string) {
  // Get a single store instance to use across all tools
  const store = useBookingStore.getState();

  const getServiceInfo = new DynamicStructuredTool({
    name: "get_service_info",
    description: "Informasi layanan servis dan harga",
    schema: z.object({
      service: z.string().describe("Nama layanan yang ingin dicek"),
    }),
    func: async ({ service }) => {
      const businessInfo = await prisma.businessInfo.findFirst({
        where: {
          userId: process.env.BUSINESS_OWNER_ID
        },
        select: {
          services: true,
          promos: true
        }
      });

      if (!businessInfo) {
        return 'Maaf, informasi layanan belum tersedia.';
      }

      const services = businessInfo.services as Record<string, string | Record<string, string>>;
      const promos = businessInfo.promos as Record<string, string | Record<string, string>>;

      // Handle promo request
      if (service.toLowerCase() === 'promo') {
        if (!promos || Object.keys(promos).length === 0) {
          return 'Maaf, tidak ada promo saat ini.';
        }

        const promoValues = Object.entries(promos)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return value;
            } else if (typeof value === 'object' && value !== null) {
              return Object.values(value).join(', ');
            }
            return null;
          })
          .filter(Boolean);

        return promoValues.length > 0
          ? `Promo saat ini:\n- ${promoValues.join('\n- ')}`
          : 'Maaf, tidak ada promo saat ini.';
      }

      // Handle service request
      const requestedService = service.toLowerCase();
      if (requestedService in services) {
        const value = services[requestedService];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).join(', ');
        }
      }

      // If service not found, list all available services
      const allServices = Object.entries(services)
        .map(([key, value]) => {
          const serviceInfo = typeof value === 'string' ? value : Object.values(value).join(', ');
          return `${key}: ${serviceInfo}`;
        });

      return allServices.length > 0
        ? `Berikut daftar layanan kami:\n- ${allServices.join('\n- ')}`
        : 'Maaf, belum ada daftar layanan tersedia.';
    },
  });

  const getLocation = new DynamicStructuredTool({
    name: "get_location",
    description: "Informasi lokasi dan petunjuk arah",
    schema: z.object({
      type: z.string().describe("Jenis informasi (alamat, petunjuk, parkir)"),
    }),
    func: async ({ type }) => {
      const businessInfo = await prisma.businessInfo.findFirst({
        where: {
          userId: process.env.BUSINESS_OWNER_ID
        },
        select: {
          location: true
        }
      });

      if (!businessInfo) {
        return 'Maaf, informasi lokasi belum tersedia.';
      }

      const location = businessInfo.location as Record<string, string | Record<string, string>>;
      
      // If the requested type exists directly in location object, return it
      const requestedType = type.toLowerCase();
      if (requestedType in location) {
        const value = location[requestedType];
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'object' && value !== null) {
          // If it's an object, concatenate all values
          return Object.values(value).join(', ');
        }
      }
      
      // If type not found, return all location info concatenated
      const allValues = Object.entries(location)
        .filter(([_, value]) => typeof value === 'string')
        .map(([_, value]) => value as string);
      
      return allValues.length > 0 
        ? allValues.join(', ')
        : 'Maaf, informasi lokasi yang diminta tidak tersedia.';
    },
  });
  

  const checkAvailability = new DynamicStructuredTool({
    name: "check_availability",
    description: "Cek slot kosong untuk booking",
    schema: z.object({
      date: z.string().describe("Tanggal untuk cek ketersediaan (format: YYYY-MM-DD)"),
      service: z.string().describe("Layanan yang ingin di-booking"),
    }),
    func: async ({ date, service }) => {
      // Placeholder: In a real implementation, this would check a database
      
      return `Slot tersedia untuk ${service} pada ${date}:
      - 10:00 WIB
      - 10.30 WIB
      - 11.00 WIB
      - 11.30 WIB
      - 12.00 WIB
      
      Silakan pilih waktu yang Anda inginkan untuk booking.`;
    },
  });

  const checkClientExists = new DynamicStructuredTool({
    name: "check_client_exists",
    description: "Cek apakah klien dengan nomor telepon tertentu sudah ada di database",
    schema: z.object({
      phone: z.string().describe("Nomor telepon/WhatsApp pelanggan"),
    }),
    func: async ({ phone }) => {
      try {
        // Check if client exists in database
        const client = await prisma.client.findFirst({
          where: {
            phone: phone,
          },
        });

        if (client) {
          // Update booking state
          const bookingStore = useBookingStore.getState();
          bookingStore.updateBookingState(sessionId, {
            phone: phone,
            name: client.name,
            clientExists: true
          });
          
          return `Klien ditemukan:
          Nama: ${client.name}
          Telepon: ${client.phone}`;
        } else {
          // Update booking state
          const bookingStore = useBookingStore.getState();
          bookingStore.updateBookingState(sessionId, {
            phone: phone,
            clientExists: false
          });
          
          return "Klien dengan nomor telepon tersebut belum terdaftar. Silakan tanyakan nama pelanggan.";
        }
      } catch (error) {
        console.error("Error checking client:", error);
        return "Maaf, terjadi kesalahan saat memeriksa data pelanggan.";
      }
    },
  });

  const updateBookingState = new DynamicStructuredTool({
    name: "update_booking_state",
    description: "Update status booking dan data pelanggan",
    schema: z.object({
      name: z.string().optional().describe("Nama pelanggan"),
      phone: z.string().optional().describe("Nomor telepon pelanggan"),
      service: z.string().optional().describe("Layanan yang dipilih"),
      date: z.string().optional().describe("Tanggal booking (format: YYYY-MM-DD)"),
      time: z.string().optional().describe("Waktu booking (format: HH:MM)"),
      barberId: z.string().optional().describe("ID barber yang dipilih"),
      status: z.enum(['initial', 'pending_confirmation', 'confirmed', 'completed']).optional().describe("Status booking"),
    }),
    func: async ({ name, phone, service, date, time, barberId, status }) => {
      const currentState = store.getBookingState(sessionId);

      // Create update object with only provided fields
      const updateObj: Partial<BookingState> = {};
      if (name) updateObj.name = name;
      if (phone) updateObj.phone = phone;
      if (service) updateObj.service = service;
      if (date) updateObj.date = date;
      if (time) updateObj.time = time;
      if (barberId) updateObj.barberId = barberId;
      if (status) updateObj.status = status;

      // Check for missing required fields if status is pending_confirmation
      if (status === 'pending_confirmation') {
        const requiredFields = ['name', 'phone', 'service', 'date', 'time'];
        const missingFields = requiredFields.filter(field => {
          // Check if field is missing in both current state and update
          return !currentState?.[field as keyof BookingState] && !updateObj[field as keyof BookingState];
        });

        if (missingFields.length > 0) {
          updateObj.missingFields = missingFields;
          return `Masih ada data yang belum lengkap: ${missingFields.join(', ')}. Silakan lengkapi data tersebut sebelum konfirmasi.`;
        } else {
          updateObj.missingFields = [];
        }
      }

      // Update the booking state
      store.updateBookingState(sessionId, updateObj);

      // Get the updated state
      const updatedState = store.getBookingState(sessionId);

      // Format current booking state for display
      let response = "Status booking telah diupdate.\n\n";
      
      if (status === 'confirmed' && currentState?.status === 'pending_confirmation') {
        // Only update to confirmed if current state is pending_confirmation
        response = "Terima kasih atas konfirmasi Anda! Saya akan segera memproses booking Anda.";
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

      return response;
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
        // Get current booking state
        const currentState = store.getBookingState(sessionId);

        // Check if status is confirmed
        if (!currentState || currentState.status !== 'confirmed') {
          return "Booking belum dikonfirmasi oleh pelanggan. Silakan minta konfirmasi terlebih dahulu.";
        }

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
        
        // Update booking state to completed
        store.updateBookingState(sessionId, {
          status: 'completed'
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

  return [checkAvailability, getServiceInfo, getLocation, checkClientExists, updateBookingState, bookAppointment];
}
