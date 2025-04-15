import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameCardSchema } from "@/lib/schemas/namecard";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cards = await prisma.nameCard.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("[NAMECARDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = nameCardSchema.parse(body);

    const card = await prisma.nameCard.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("[NAMECARDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
