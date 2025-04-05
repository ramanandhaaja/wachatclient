import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for event update
const UpdateEventSchema = z.object({
  startTime: z.string().datetime().optional(),
  clientName: z.string().min(1).optional(),
});

// GET /api/calendar/events/[eventId]
/*
export async function GET(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: context.params.eventId,
        userId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in GET event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/calendar/events/[eventId]
export async function PUT(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const result = UpdateEventSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { startTime, clientName } = result.data;

    // Get the existing event
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: context.params.eventId,
        userId: session.user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let endTime = existingEvent.endTime;
    if (startTime) {
      // Get user's event duration
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { eventDuration: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Calculate new end time
      endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + user.eventDuration);

      // Check for overlapping events
      const overlappingEvent = await prisma.event.findFirst({
        where: {
          userId: session.user.id,
          id: { not: context.params.eventId }, // Exclude current event
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
        return NextResponse.json({ error: "Time slot is already booked" }, { status: 409 });
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: context.params.eventId,
        userId: session.user.id,
      },
      data: {
        ...(startTime && {
          startTime: new Date(startTime),
          endTime,
        }),
        ...(clientName && { clientName }),
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error in PUT event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/calendar/events/[eventId]
export async function DELETE(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the event
    await prisma.event.delete({
      where: {
        id: context.params.eventId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}*/
