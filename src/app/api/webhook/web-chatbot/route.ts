import { NextResponse, NextRequest } from "next/server";
import { processMessage } from "@/lib/server-chat-openai/process-message";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Fetch conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (conversationError) {
      console.error("Error fetching conversation:", conversationError);
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      );
    }

    // Fetch all messages for this conversation
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
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId, userName, userPhone } = body;

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

    // Check if conversation exists
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", sessionId)
      .single();

    // If no conversation exists and we have user details, create one
    if (!conversation && userName && userPhone) {
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          id: sessionId, // Use the provided sessionId as the conversation id
          user_id: sessionId,
          user_name: userName,
          user_phone: userPhone,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_bot_active: true,
          source: 'web'
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }

      conversation = newConversation;
    }

    // Store user message
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

    // Update conversation with last message
    await supabase
      .from("conversations")
      .update({
        last_message: message,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Process message with AI
    const aiResponse = await processMessage(sessionId, message);

    // Store AI response
    const { error: aiMessageError } = await supabase.from("messages").insert({
      conversation_id: sessionId,
      sender_type: "admin",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      is_read: false,
      metadata: {
        is_ai_response: true,
      },
    });

    if (aiMessageError) {
      console.error("Error storing AI response:", aiMessageError);
      return NextResponse.json(
        { error: "Failed to store AI response" },
        { status: 500 }
      );
    }

    // Update conversation with AI's last message
    await supabase
      .from("conversations")
      .update({
        last_message: aiResponse,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Fetch all messages for this conversation
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
      conversation,
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
