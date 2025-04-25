import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ views: 0 });

  const cards = await prisma.nameCard.findMany({
    where: { userId },
    select: { id: true },
  });
  const cardIds = cards.map(card => card.id);

  const views = await prisma.analyticsEvent.count({
    where: {
      eventType: "card_view",
      cardId: { in: cardIds },
    },
  });

  return NextResponse.json({ views });
}
