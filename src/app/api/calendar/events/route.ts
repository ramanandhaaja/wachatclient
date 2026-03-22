import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getWIBDayOfWeek, isWithinAvailability, findOverlappingEvent } from "@/lib/calendar-utils";

const EventSchema = z.object({
  startTime: z.string().datetime(),
  clientInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
  }),
  serviceType: z.string().min(1),
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where = {
      userId: user.id,
      ...(startDate && endDate
        ? {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),
    };

    const events = await prisma.event.findMany({
      where,
      include: { client: true },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error in GET events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = EventSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { startTime, clientInfo, serviceType, providerId, providerName, notes } = result.data;
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

    const overlappingEvent = await findOverlappingEvent(authUser.id, new Date(startTime), endTime);

    if (overlappingEvent) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 409 }
      );
    }

    let client = await prisma.client.findFirst({
      where: { phone: clientInfo.phone, userId: authUser.id },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email,
          userId: authUser.id,
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        startTime: new Date(startTime),
        endTime,
        serviceType,
        providerId,
        providerName,
        notes,
        userId: authUser.id,
        clientId: client.id,
      },
      include: { client: true },
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
