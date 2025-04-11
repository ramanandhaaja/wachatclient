// components/ChatWidget.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-message",
      sender_type: "admin",
      content:
        "Halo! Selamat datang di chatbot kami! Ada yang bisa saya bantu?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showFormInput, setShowFormInput] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        loadPreviousMessages(session.session_id);
      } else {
        sessionStorage.removeItem("userWebChatSession");
        setShowFormInput(true);
      }
    } else {
      setShowFormInput(true);
    }
  }, []);

  const loadPreviousMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/webhook/web-chatbot?sessionId=${sessionId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        // Map database messages to chat messages
        const formattedMessages = data.messages.map((msg: DbMessage) => ({
          id: msg.id,
          sender_type: msg.sender_type,
          content: msg.content,
          timestamp: msg.timestamp,
        }));

        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Error loading previous messages:", error);
      setMessagesError("Failed to load previous messages");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleUserRegistered = (
    newSessionId: string,
    newUserName: string,
    newUserPhone: string
  ) => {
    setSessionId(newSessionId);
    setUserName(newUserName);
    setUserPhone(newUserPhone);
    setShowFormInput(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setIsSending(true);

    // Generate a temporary ID for the user message
    const tempUserId = `temp-${Date.now()}`;

    // Add user message to chat immediately
    setMessages((prev) => [
      ...prev,
      {
        id: tempUserId,
        sender_type: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch("/api/webhook/web-chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          userName,
          userPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          id:
            data.messages?.find(
              (m: DbMessage) =>
                m.sender_type === "admin" && m.content === data.response
            )?.id || `admin-${Date.now()}`,
          sender_type: "admin",
          content: data.response,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender_type: "admin",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
        <div className="fixed bottom-20 right-4 w-[350px] md:w-[450px] lg:w-[550px] h-[650px] bg-white rounded-2xl shadow-xl overflow-hidden z-40 animate-fade-in">
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
                      {messages.map((message) => (
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
                  {messagesError && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-lg p-3 bg-red-100 text-red-800">
                        <div className="text-xs opacity-70 mb-1">Error</div>
                        <p>{messagesError}</p>
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
