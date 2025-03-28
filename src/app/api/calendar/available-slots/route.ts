import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for query parameters
const QuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const result = QuerySchema.safeParse({
      date: searchParams.get("date"),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const date = new Date(result.data.date);
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)

    // Get user's event duration and availability
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { eventDuration: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get availability for the day
    const availability = await prisma.availability.findFirst({
      where: {
        userId: session.user.id,
        dayOfWeek,
      },
    });

    if (!availability) {
      return NextResponse.json({ slots: [] }); // No availability for this day
    }

    // Generate all possible slots
    const slots: { start: Date; end: Date }[] = [];
    const [startHour, startMinute] = availability.startTime.split(":").map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);

    // Generate slots based on event duration
    let currentSlot = startDate;
    while (currentSlot < endDate) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + user.eventDuration);

      if (slotEnd <= endDate) {
        slots.push({
          start: new Date(currentSlot),
          end: slotEnd,
        });
      }

      currentSlot = slotEnd;
    }

    // Get booked events for the day
    const bookedEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lt: new Date(date.setDate(date.getDate() + 1)),
        },
      },
    });

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => {
      return !bookedEvents.some(
        (event) =>
          (slot.start >= event.startTime && slot.start < event.endTime) ||
          (slot.end > event.startTime && slot.end <= event.endTime)
      );
    });

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error in available-slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
