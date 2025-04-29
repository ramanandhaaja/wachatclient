import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// If you use an AI function, import it here
import { processMessage } from "@/lib/server-chat-openai/process-message";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;
    const userId = body.userId;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // 1. Store user message
    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: sessionId,
      sender_type: "user",
      content: message,
      timestamp: new Date().toISOString(),
      is_read: false,
      metadata: {},
    });

    if (userMessageError) {
      console.error("Error storing user message:", userMessageError);
      return NextResponse.json(
        { error: "Failed to store message" },
        { status: 500 }
      );
    }

    // 2. Update conversation with last message
    await supabase
      .from("conversations")
      .update({
        last_message: message,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // 3. Generate AI/admin response (uncomment and use your own function)
    const aiResponse = await processMessage(sessionId, message, userId);

    // 4. Store AI/admin response
    const { error: aiMessageError } = await supabase.from("messages").insert({
      conversation_id: sessionId,
      sender_type: "bot",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      is_read: false,
      metadata: { is_ai_response: true },
    });
    if (aiMessageError) {
      console.error("Error storing AI response:", aiMessageError);
      return NextResponse.json(
        { error: "Failed to store AI response" },
        { status: 500 }
      );
    }

    // 5. Update conversation with AI's last message
    await supabase
      .from("conversations")
      .update({
        last_message: aiResponse,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // // 6. Fetch all messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", sessionId)
      .order("timestamp", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: aiResponse,
      messages,
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
