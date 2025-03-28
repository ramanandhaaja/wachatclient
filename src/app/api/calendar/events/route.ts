import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for event creation/update
const EventSchema = z.object({
  startTime: z.string().datetime(),
  clientName: z.string().min(1),
});

// GET /api/calendar/events
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse optional date range filters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where = {
      userId: session.user.id,
      ...(startDate && endDate
        ? {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),
    };

    const events = await prisma.event.findMany({ where });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error in GET events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = EventSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { startTime, clientName } = result.data;

    // Get user's event duration
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { eventDuration: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate end time based on event duration
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + user.eventDuration);

    // Check for overlapping events
    const overlappingEvent = await prisma.event.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          {
            startTime: {
              gte: new Date(startTime),
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: new Date(startTime),
              lte: endTime,
            },
          },
        ],
      },
    });

    if (overlappingEvent) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        startTime: new Date(startTime),
        endTime,
        clientName,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error in POST events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
