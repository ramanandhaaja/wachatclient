import type { useBookingStore } from '@/stores/bookingStore';

export type BookingStore = ReturnType<typeof useBookingStore.getState>;
