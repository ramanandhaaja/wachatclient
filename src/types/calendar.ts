export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface Event {
  id: string;
  userId: string;
  clientId: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  providerId?: string;
  providerName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  startTime: string; // ISO datetime
  clientInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  serviceType: string;
  providerId?: string;
  providerName?: string;
  notes?: string;
}

export interface UpdateEventInput {
  startTime?: string; // ISO datetime
  serviceType?: string;
  providerId?: string;
  providerName?: string;
  notes?: string;
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
