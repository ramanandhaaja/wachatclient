import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameCardSchema } from "@/lib/schemas/namecard";

export const dynamic = 'force-dynamic';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await prisma.nameCard.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!card) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("[NAMECARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = nameCardSchema.parse(body);

    const card = await prisma.nameCard.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: validatedData,
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("[NAMECARD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.nameCard.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NAMECARD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}