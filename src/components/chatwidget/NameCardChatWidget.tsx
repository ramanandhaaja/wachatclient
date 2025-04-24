// components/ChatWidget.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useConversation } from "@/hooks/use-conversation";
import { Send, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormBeforeChat } from "./FormBeforeChat";

// Match your DB schema
interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  timestamp: string;
  is_read: boolean;
  metadata: any;
}

// For UI display purposes, we use a simplified version
interface ChatMessage {
  id: string;
  sender_type: string;
  content: string;
  timestamp: string;
}

export default function NameCardChatWidget() {
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
      body: JSON.stringify({ userPhone: newUserPhone, userName: newUserName }),
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

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        className="w-full mt-6 gap-2 z-[9999]"
        onClick={() => {
          console.log("Floating chat button clicked", {
            isOpen,
            showFormInput,
            sessionId,
          });
          toggleChat();
        }}
      >
        {/* Debug state */}
        {process.env.NODE_ENV === "development" && (
          <div style={{ display: "none" }}>
            {JSON.stringify({ isOpen, showFormInput, sessionId })}
          </div>
        )}
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Chat with me!
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[420px] md:w-[420px] lg:w-[420px] h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden z-[9999] animate-fade-in">
          {/* Close Button */}
          <button
            type="button"
            aria-label="Close chat"
            className="absolute top-3 right-3 z-10 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
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
                      {mergedMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_type === "admin"
                                ? "bg-gray-100 text-gray-800"
                                : message.sender_type === "user"
                                ? "bg-green-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {message.sender_type !== "user" && (
                              <div className="text-xs opacity-70 mb-1">
                                {message.sender_type === "admin"
                                  ? "Admin"
                                  : "Bot"}
                              </div>
                            )}
                            <p>{message.content}</p>
                            <div className="text-xs text-gray-500 text-right mt-1">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
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
                  {messagesError && messages && messages.length !== 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-lg p-3 bg-red-100 text-red-800">
                        <div className="text-xs opacity-70 mb-1">Error</div>
                        <p>Maaf sedang terjadi kesalahan, coba beberapa saat lagi</p>
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
