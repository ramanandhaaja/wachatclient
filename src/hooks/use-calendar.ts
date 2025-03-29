import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  TimeSlot, 
  Event, 
  CreateEventInput, 
  UpdateEventInput, 
  CalendarQueryParams,
  Availability,
  CreateAvailabilityInput
} from '@/types/calendar';

const CALENDAR_KEYS = {
  all: ['calendar'] as const,
  events: () => [...CALENDAR_KEYS.all, 'events'] as const,
  event: (id: string) => [...CALENDAR_KEYS.events(), id] as const,
  slots: (date: Date) => [...CALENDAR_KEYS.all, 'slots', format(date, 'yyyy-MM-dd')] as const,
  availability: () => [...CALENDAR_KEYS.all, 'availability'] as const,
};

async function fetchAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(`/api/calendar/available-slots?date=${formattedDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch available slots');
  }
  const data = await response.json();
  return data.slots.map((slot: any) => ({
    ...slot,
    start: new Date(slot.start),
    end: new Date(slot.end),
  }));
}

async function fetchEvents(params?: CalendarQueryParams): Promise<Event[]> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);

  const response = await fetch(`/api/calendar/events?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const data = await response.json();
  return data.events.map((event: any) => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  }));
}

async function createEvent(input: CreateEventInput): Promise<Event> {
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create event');
  }
  return {
    ...data.event,
    startTime: new Date(data.event.startTime),
    endTime: new Date(data.event.endTime),
    createdAt: new Date(data.event.createdAt),
    updatedAt: new Date(data.event.updatedAt),
  };
}

async function updateEvent(eventId: string, input: UpdateEventInput): Promise<Event> {
  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  const data = await response.json();
  return {
    ...data.event,
    startTime: new Date(data.event.startTime),
    endTime: new Date(data.event.endTime),
    createdAt: new Date(data.event.createdAt),
    updatedAt: new Date(data.event.updatedAt),
  };
}

async function deleteEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
}

async function fetchAvailability(): Promise<Availability[]> {
  const response = await fetch('/api/calendar/availability');
  if (!response.ok) {
    throw new Error('Failed to fetch availability');
  }
  const data = await response.json();
  return data.availability;
}

async function createAvailability(input: CreateAvailabilityInput): Promise<Availability> {
  const response = await fetch('/api/calendar/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create availability');
  }
  const data = await response.json();
  return data.availability;
}

export function useCalendar() {
  const queryClient = useQueryClient();

  const availableSlots = {
    useQuery: (date: Date) => 
      useQuery({
        queryKey: CALENDAR_KEYS.slots(date),
        queryFn: () => fetchAvailableSlots(date),
      }),
  };

  const events = {
    useQuery: (params?: CalendarQueryParams) =>
      useQuery({
        queryKey: CALENDAR_KEYS.events(),
        queryFn: () => fetchEvents(params),
      }),
    useCreate: () =>
      useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.events() });
        },
      }),
    useUpdate: () =>
      useMutation({
        mutationFn: ({ eventId, input }: { eventId: string; input: UpdateEventInput }) =>
          updateEvent(eventId, input),
        onSuccess: (_, { eventId }) => {
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.event(eventId) });
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.events() });
        },
      }),
    useDelete: () =>
      useMutation({
        mutationFn: deleteEvent,
        onSuccess: (_, eventId) => {
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.event(eventId) });
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.events() });
        },
      }),
  };

  const availability = {
    useQuery: () =>
      useQuery({
        queryKey: CALENDAR_KEYS.availability(),
        queryFn: fetchAvailability,
      }),
    useCreate: () =>
      useMutation({
        mutationFn: createAvailability,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.availability() });
          // Also invalidate slots queries as they depend on availability
          queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all });
        },
      }),
  };

  return {
    availableSlots,
    events,
    availability,
  };
}
