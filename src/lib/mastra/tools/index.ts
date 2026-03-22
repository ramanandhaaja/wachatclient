import { createGetBusinessInfoTool } from './get-business-info';
import { createCheckAvailabilityTool } from './check-availability';
import { createBookAppointmentTool } from './book-appointment';
import { createCheckScheduleTool } from './check-schedule';

export function createTools(userId: string) {
  return {
    getBusinessInfo: createGetBusinessInfoTool(userId),
    checkAvailability: createCheckAvailabilityTool(userId),
    bookAppointment: createBookAppointmentTool(userId),
    checkSchedule: createCheckScheduleTool(userId),
  };
}
