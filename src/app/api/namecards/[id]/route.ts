import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { nameCardSchema } from "@/lib/schemas/namecard";

export const dynamic = 'force-dynamic';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  request: Request,
  { params }: any
) {
  const { id } = params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await prisma.nameCard.findUnique({
      where: {
        id: id,
        userId: user.id,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(
  request: Request,
  { params }: any
) {
  const { id } = params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = nameCardSchema.parse(body);

    const card = await prisma.nameCard.update({
      where: {
        id: id,
        userId: user.id,
      },
      data: validatedData,
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("[NAMECARD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(
  request: Request,
  { params }: any
) {
  const { id } = params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.nameCard.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NAMECARD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}