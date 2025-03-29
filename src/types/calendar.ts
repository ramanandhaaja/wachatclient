export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface Event {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  startTime: string; // ISO datetime
  clientName: string;
}

export interface UpdateEventInput {
  startTime?: string; // ISO datetime
  clientName?: string;
}

export interface CalendarQueryParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface Availability {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAvailabilityInput {
  dayOfWeek: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}
