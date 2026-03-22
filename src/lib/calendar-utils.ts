import { prisma } from "@/lib/prisma";

const WIB_OFFSET_HOURS = 7;

/**
 * Convert HH:mm time string to total minutes.
 */
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/**
 * Convert a WIB time (HH:mm) on a given date string (YYYY-MM-DD) to a UTC Date.
 * Availability times are stored as WIB (GMT+7).
 */
export function wibTimeToUTC(dateStr: string, timeStr: string): Date {
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(
    `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000+07:00`
  );
}

/**
 * Convert a UTC Date to WIB minutes-of-day (0-1439).
 * Handles the day rollover correctly (e.g., UTC 18:00 = WIB 01:00 next day = 60 minutes).
 */
export function utcDateToWIBMinutes(date: Date): number {
  const wibHour = (date.getUTCHours() + WIB_OFFSET_HOURS) % 24;
  const wibMinute = date.getUTCMinutes();
  return wibHour * 60 + wibMinute;
}

/**
 * Get the day-of-week in WIB context for a UTC Date.
 */
export function getWIBDayOfWeek(date: Date): number {
  const utcHours = date.getUTCHours();
  const wibDate = new Date(date);
  wibDate.setUTCHours(utcHours + WIB_OFFSET_HOURS);
  return wibDate.getUTCDay();
}

/**
 * Validate that an event time falls within any of the given availability windows.
 * Times are compared in WIB context.
 */
export function isWithinAvailability(
  eventDate: Date,
  eventDuration: number,
  availabilityWindows: { startTime: string; endTime: string }[]
): boolean {
  const eventMinutes = utcDateToWIBMinutes(eventDate);
  return availabilityWindows.some((avail) => {
    const availStart = timeToMinutes(avail.startTime);
    const availEnd = timeToMinutes(avail.endTime);
    return eventMinutes >= availStart && eventMinutes + eventDuration <= availEnd;
  });
}

/**
 * Get the day-of-week in WIB context for a date string (YYYY-MM-DD).
 */
export function getWIBDayOfWeekFromDateStr(dateStr: string): number {
  const wibDate = new Date(`${dateStr}T12:00:00.000+07:00`);
  return wibDate.getDay();
}

/**
 * Generate available time slots for a given date, filtering out booked events.
 * Combines availability window generation and overlap filtering into one function.
 */
export async function getAvailableSlots(
  userId: string,
  dateStr: string,
  eventDuration: number
): Promise<{ start: Date; end: Date }[]> {
  const dayOfWeek = getWIBDayOfWeekFromDateStr(dateStr);

  const availabilityWindows = await prisma.availability.findMany({
    where: { userId, dayOfWeek },
    orderBy: { startTime: "asc" },
    select: { startTime: true, endTime: true },
  });

  if (availabilityWindows.length === 0) {
    return [];
  }

  const allSlots: { start: Date; end: Date }[] = [];

  for (const avail of availabilityWindows) {
    const windowStart = wibTimeToUTC(dateStr, avail.startTime);
    const windowEnd = wibTimeToUTC(dateStr, avail.endTime);

    let current = new Date(windowStart);
    while (current < windowEnd) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + eventDuration);

      if (slotEnd <= windowEnd) {
        allSlots.push({ start: new Date(current), end: slotEnd });
      }
      current = slotEnd;
    }
  }

  if (allSlots.length === 0) {
    return [];
  }

  const dayStartUTC = wibTimeToUTC(dateStr, "00:00");
  const dayEndUTC = wibTimeToUTC(dateStr, "23:59");

  const bookedEvents = await prisma.event.findMany({
    where: {
      userId,
      startTime: { gte: dayStartUTC, lte: dayEndUTC },
    },
    select: { startTime: true, endTime: true },
  });

  return allSlots.filter((slot) =>
    !bookedEvents.some(
      (event) => slot.start < event.endTime && slot.end > event.startTime
    )
  );
}

/**
 * Check for overlapping events. Correctly catches all overlap cases including
 * when an existing event fully encompasses the new event.
 */
export async function findOverlappingEvent(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
) {
  return prisma.event.findFirst({
    where: {
      userId,
      ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
}
