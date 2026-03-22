import { useBookingStore } from '@/stores/bookingStore';
import { createGetBusinessInfoTool } from './get-business-info';
import { createCheckAvailabilityTool } from './check-availability';
import { createCheckClientExistsTool } from './check-client-exists';
import { createUpdateBookingStateTool } from './update-booking-state';
import { createBookAppointmentTool } from './book-appointment';

export function createTools(sessionId: string, userId: string) {
  const store = useBookingStore.getState();

  return {
    getBusinessInfo: createGetBusinessInfoTool(userId),
    checkAvailability: createCheckAvailabilityTool(),
    checkClientExists: createCheckClientExistsTool(sessionId, store),
    updateBookingState: createUpdateBookingStateTool(sessionId, store),
    bookAppointment: createBookAppointmentTool(sessionId, userId, store),
  };
}
