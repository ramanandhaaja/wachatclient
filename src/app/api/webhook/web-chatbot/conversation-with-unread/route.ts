import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const source = searchParams.get("source");
  const showArchived = searchParams.get("show_archived") === "true";

  // 1. Fetch all conversations for the user (and source if provided)
  let query = supabase.from("conversations").select("*").eq("user_id", userId);

  if (source) {
    query = query.eq("source", source);
  }

  if (!showArchived) {
    query = query.eq("status", "active");
  }

  const { data: conversations, error: convError } = await query;

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  // 2. Fetch all messages for these conversations (just id, conversation_id, is_read, sender_type, timestamp)
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("id,conversation_id,is_read,sender_type,timestamp")
    .in(
      "conversation_id",
      conversations.map((c) => c.id)
    );

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // 3. Find the latest message for each conversation
  const latestByConv: Record<string, any> = {};
  for (const msg of messages) {
    if (
      !latestByConv[msg.conversation_id] ||
      new Date(msg.timestamp) >
        new Date(latestByConv[msg.conversation_id].timestamp)
    ) {
      latestByConv[msg.conversation_id] = msg;
    }
  }

  // 4. Attach unread info to each conversation
  const enriched = conversations.map((conv) => {
    const latest = latestByConv[conv.id];
    return {
      ...conv,
      last_message_is_read: latest?.is_read,
      last_message_sender_type: latest?.sender_type,
    };
  });

  const sortedConversations = enriched.sort((a, b) => {
    const dateA = new Date(a.updated_at);
    const dateB = new Date(b.updated_at);
    return dateB.getTime() - dateA.getTime();
  });

  return NextResponse.json(sortedConversations);
}
