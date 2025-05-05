// components/ChatWidget.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormBeforeChat } from "./FormBeforeChat";
import { useConversation } from "@/hooks/use-conversation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { preprocessText } from "@/lib/utils";

interface NameCardChatWidgetProps {
  userId: string;
}

export default function ChatWidget({ userId }: NameCardChatWidgetProps) {
  // For debug, log userId
  console.log("Chat Widget userId:", userId);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showFormInput, setShowFormInput] = useState(true);
  const [localStateMessages, setLocalStateMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error: messagesError,
  } = useConversation(sessionId || null);

  useEffect(() => {
    const storedSession = sessionStorage.getItem("userWebChatSession");
    if (storedSession) {
      const session = JSON.parse(storedSession);
      if (new Date().getTime() < session.expiresAt) {
        setSessionId(session.session_id);
        setUserName(session.user);
        setUserPhone(session.phone);
        setShowFormInput(false);

        // Load previous messages if needed
        // loadPreviousMessages(session.session_id);
      } else {
        sessionStorage.removeItem("userWebChatSession");
        setShowFormInput(true);
      }
    } else {
      setShowFormInput(true);
    }
  }, []);

  useEffect(() => {
    if (!messages || localStateMessages.length === 0) return;

    setLocalStateMessages((pending) =>
      pending.filter(
        (pendingMsg) =>
          !messages.some(
            (realMsg) =>
              realMsg.sender_type === pendingMsg.sender_type &&
              realMsg.content === pendingMsg.content &&
              // Optionally: check timestamp is close (within 60s)
              Math.abs(
                new Date(realMsg.timestamp).getTime() -
                  new Date(pendingMsg.timestamp).getTime()
              ) < 60000
          )
      )
    );
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleUserRegistered = async (
    newUserName: string,
    newUserPhone: string
  ) => {
    // Call API to find or create conversation
    const res = await fetch("/api/webhook/web-chatbot/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPhone: newUserPhone,
        userName: newUserName,
        userId: userId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      // handle error
      return;
    }
    setSessionId(data.conversationId);
    setUserName(newUserName);
    setUserPhone(newUserPhone);
    setShowFormInput(false);

    // Store in sessionStorage
    sessionStorage.setItem(
      "userWebChatSession",
      JSON.stringify({
        session_id: data.conversationId,
        user: newUserName,
        phone: newUserPhone,
        hasConversation: true,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      })
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const userMessage = input;

    //local state message object
    const localStateMessage = {
      id: tempId,
      conversation_id: sessionId,

      sender_type: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
      pending: true,
    };
    setInput("");
    setIsSending(true);
    setLocalStateMessages((prev) => [...prev, localStateMessage]);

    try {
      // Check for firstMessage flag in session storage
      const storedSession = sessionStorage.getItem("userWebChatSession");
      const isFirstMessage =
        storedSession && !JSON.parse(storedSession).hasConversation;

      const response = await fetch(
        "/api/webhook/web-chatbot/sending-existing-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            sessionId,
            userName: isFirstMessage ? userName : undefined,
            userPhone: isFirstMessage ? userPhone : undefined,
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // If this was the first message, update the session storage to indicate we now have a conversation
      if (isFirstMessage && storedSession) {
        const session = JSON.parse(storedSession);
        session.hasConversation = true;
        sessionStorage.setItem("userWebChatSession", JSON.stringify(session));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const mergedMessages = useMemo(() => {
    const realIds = new Set((messages || []).map((msg) => msg.id));
    return [
      ...(messages || []),
      ...localStateMessages.filter((msg) => !realIds.has(msg.id)),
    ];
  }, [messages, localStateMessages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [mergedMessages, isOpen]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  function getDateLabel(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();

    const dateNoTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowNoTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const diffInDays = Math.floor(
      (nowNoTime.getTime() - dateNoTime.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return format(date, "dd/MM/yyyy");
  }

  // Group messages by date label
  function groupMessagesByDate(messages: any[]) {
    const groups: { type: string; label?: string; message?: any }[] = [];
    let lastLabel: string | null = null;

    messages.forEach((msg) => {
      const label = getDateLabel(msg.timestamp || msg.last_message_time);
      if (label !== lastLabel) {
        groups.push({ type: "label", label });
        lastLabel = label;
      }
      groups.push({ type: "message", message: msg });
    });

    return groups;
  }

  // flag messages send by admin no matter what sender_type is
  const adminMessages = mergedMessages.map((msg) => ({
    ...msg,
    sender_type: msg.sender_type === "bot" ? "admin" : msg.sender_type,
  }));

  const groupedMessages = groupMessagesByDate(adminMessages);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[350px] md:w-[450px] lg:w-[500px] h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden z-40 animate-fade-in">
          <div className="flex flex-col h-full">
            {showFormInput ? (
              <FormBeforeChat onUserRegistered={handleUserRegistered} />
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
                      }
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">Admin</h2>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {groupedMessages.map((item, idx) =>
                        item.type === "label" ? (
                          <div
                            key={`label-${idx}`}
                            className="flex justify-center items-center text-gray-700 my-6 "
                          >
                            <div className=" text-sm border border-gray-200 rounded-lg px-2 py-2">
                              {item.label}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={item.message.id}
                            className={`flex ${
                              item.message.sender_type === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                item.message.sender_type === "admin"
                                  ? "bg-gray-100 text-gray-800"
                                  : item.message.sender_type === "user"
                                  ? "bg-green-100 text-gray-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.message.sender_type !== "user" && (
                                <div className="text-xs opacity-70 mb-1">
                                  {item.message.sender_type === "admin"
                                    ? "Admin"
                                    : "Bot"}
                                </div>
                              )}
                              <ReactMarkdown>
                                {preprocessText(item.message.content)}
                              </ReactMarkdown>
                              <div className="text-xs text-gray-500 text-right mt-1">
                                {formatTime(item.message.timestamp)}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {/* Loading indicator */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-lg p-3 bg-gray-100 text-gray-800">
                        <div className="text-xs opacity-70 mb-1">Admin</div>
                        <div className="flex items-center space-x-2">
                          <div className="animate-bounce">•</div>
                          <div className="animate-bounce [animation-delay:0.2s]">
                            •
                          </div>
                          <div className="animate-bounce [animation-delay:0.4s]">
                            •
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {messagesError && messages.length !== 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-lg p-3 bg-red-100 text-red-800">
                        <div className="text-xs opacity-70 mb-1">Error</div>
                        <p>
                          Maaf sedang terjadi kesalahan, coba beberapa saat lagi
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Invisible div for scrolling to bottom */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="mt-auto">
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-gray-200 p-4 flex items-center gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      className="flex-1"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isSending || !input.trim()}
                    >
                      {isSending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-green-500"></span>
                      ) : (
                        <Send size={16} />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
