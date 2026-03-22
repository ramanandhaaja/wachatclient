import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsEventSchema = z.object({
  eventType: z.enum(["card_view"]),
  cardId: z.string().min(1),
  userId: z.string().optional(),
  eventData: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = analyticsEventSchema.parse(body);

    await prisma.analyticsEvent.create({
      data: {
        eventType: validated.eventType,
        cardId: validated.cardId,
        userId: validated.userId,
        eventData: validated.eventData,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
