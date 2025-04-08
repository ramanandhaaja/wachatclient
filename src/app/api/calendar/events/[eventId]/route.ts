import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for event update
const UpdateEventSchema = z.object({
  startTime: z.string().datetime().optional(),
  clientInfo: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
  }).optional(),
  serviceType: z.string().min(1).optional(),
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/calendar/events/[eventId]
export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        userId: session.user.id,
      },
      include: {
        client: true
      } as any
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
  { params }: { params: { eventId: string } }
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

    const { startTime, clientInfo, serviceType, providerId, providerName, notes } = result.data;

    // Get the existing event
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        userId: session.user.id,
      },
      include: {
        client: true
      } as any
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
          id: { not: params.eventId }, // Exclude current event
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

    // Update client information if provided
    if (clientInfo && existingEvent.client) {
      await prisma.client.update({
        where: {
          id: (existingEvent as any).client.id
        },
        data: {
          ...(clientInfo.name && { name: clientInfo.name }),
          ...(clientInfo.phone && { phone: clientInfo.phone }),
          ...(clientInfo.email !== undefined && { email: clientInfo.email }),
        }
      });
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: params.eventId,
        userId: session.user.id,
      },
      data: {
        ...(startTime && {
          startTime: new Date(startTime),
          endTime,
        }),
        ...(serviceType && { serviceType }),
        ...(providerId !== undefined && { providerId }),
        ...(providerName !== undefined && { providerName }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        client: true
      } as any
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
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the event
    await prisma.event.delete({
      where: {
        id: params.eventId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
