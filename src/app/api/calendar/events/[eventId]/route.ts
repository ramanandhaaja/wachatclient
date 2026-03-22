import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getWIBDayOfWeek, isWithinAvailability, findOverlappingEvent } from "@/lib/calendar-utils";

const UpdateEventSchema = z.object({
  startTime: z.string().datetime().optional(),
  serviceType: z.string().min(1).optional(),
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: user.id },
      include: { client: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in GET event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const existingEvent = await prisma.event.findFirst({
      where: { id: eventId, userId: authUser.id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const json = await req.json();
    const result = UpdateEventSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    const { startTime, serviceType, providerId, providerName, notes } = result.data;

    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (providerId !== undefined) updateData.providerId = providerId;
    if (providerName !== undefined) updateData.providerName = providerName;
    if (notes !== undefined) updateData.notes = notes;

    if (startTime) {
      const eventDate = new Date(startTime);
      const dayOfWeek = getWIBDayOfWeek(eventDate);

      const [dbUser, availabilityWindows] = await Promise.all([
        prisma.user.findUnique({
          where: { id: authUser.id },
          select: { eventDuration: true },
        }),
        prisma.availability.findMany({
          where: { userId: authUser.id, dayOfWeek },
        }),
      ]);

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (availabilityWindows.length === 0) {
        return NextResponse.json(
          { error: "No availability set for this day" },
          { status: 400 }
        );
      }

      if (!isWithinAvailability(eventDate, dbUser.eventDuration, availabilityWindows)) {
        return NextResponse.json(
          { error: "Selected time is outside available hours" },
          { status: 400 }
        );
      }

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + dbUser.eventDuration);

      const overlappingEvent = await findOverlappingEvent(
        authUser.id, new Date(startTime), endTime, eventId
      );

      if (overlappingEvent) {
        return NextResponse.json(
          { error: "Time slot is already booked" },
          { status: 409 }
        );
      }

      updateData.startTime = new Date(startTime);
      updateData.endTime = endTime;
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: { client: true },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error in PUT event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const { count } = await prisma.event.deleteMany({
      where: { id: eventId, userId: user.id },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
