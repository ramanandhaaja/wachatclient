import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  // 1. Delete conversation
  const { error: convError } = await supabase
    .from("conversations")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  // // 2. Delete all messages for this conversation
  // const { error: msgError } = await supabase
  //   .from("messages")
  //   .update()
  //   .eq("conversation_id", conversationId);

  // if (msgError) {
  //   return NextResponse.json({ error: msgError.message }, { status: 500 });
  // }

  return NextResponse.json({ success: true });
}
