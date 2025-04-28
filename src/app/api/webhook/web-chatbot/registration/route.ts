import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPhone, userName, userId } = body;

    if (!userPhone) {
      return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    }

    // 1. Try to find existing conversation
    const { data: existing, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_phone", userPhone)
      .eq("user_id", userId)
      .eq("source", "web")
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ conversationId: existing.id, isNew: false });
    } 

    // 2. Create new conversation
    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId,
          user_phone: userPhone,
          user_name: userName,
          source: "web",
          status: "active",
        },
      ])
      .select("id")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Insert welcome message for new conversation
    await supabase.from("messages").insert({
      conversation_id: created.id,
      sender_type: "bot",
      content:
        "Halo! Selamat datang di chatbot kami! Ada yang bisa saya bantu?",
      timestamp: new Date().toISOString(),
      is_read: false,
      metadata: { is_welcome: true },
    });

    await supabase
      .from("conversations")
      .update({
        last_message:
          "Halo! Selamat datang di chatbot kami! Ada yang bisa saya bantu?",
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", created.id);

    return NextResponse.json({ conversationId: created.id, isNew: true });
  } catch (error) {
    console.error("Error in find-or-create-conversation endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
