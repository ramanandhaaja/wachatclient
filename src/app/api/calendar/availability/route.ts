import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const AvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availability = await prisma.availability.findMany({
      where: { userId: session.user.id },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error in GET availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const result = AvailabilitySchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { dayOfWeek, startTime, endTime } = result.data;

    // Validate that start time is before end time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Find existing availability
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        userId: session.user.id,
        dayOfWeek,
      },
    });

    // Create or update availability
    const availability = existingAvailability
      ? await prisma.availability.update({
          where: { id: existingAvailability.id },
          data: { startTime, endTime },
        })
      : await prisma.availability.create({
          data: {
            userId: session.user.id,
            dayOfWeek,
            startTime,
            endTime,
          },
        });


    return NextResponse.json({ availability }, { status: 201 });
  } catch (error) {
    console.error("Error in POST availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
