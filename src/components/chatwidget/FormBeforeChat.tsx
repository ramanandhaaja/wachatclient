import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormBeforeChatProps {
  onUserRegistered: (sessionId: string, name: string, phone: string) => void;
}

export function FormBeforeChat({ onUserRegistered }: FormBeforeChatProps) {
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      // Send initial message to create conversation
      const response = await fetch("/api/webhook/web-chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello, I'm starting a new conversation.",
          sessionId,
          userName,
          userPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize conversation");
      }

      // Store session in sessionStorage
      const sessionData = {
        session_id: sessionId,
        user: userName,
        phone: userPhone,
        loginTime: new Date().toISOString(),
        expiresAt: new Date().getTime() + 30 * 60 * 1000, // 30 minutes from now
      };
      sessionStorage.setItem("userWebChatSession", JSON.stringify(sessionData));

      // Notify parent component that user registration is complete
      onUserRegistered(sessionId, userName, userPhone);
    } catch (error) {
      console.error("Error initializing conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome! Before we start, please provide your name and phone
              number.
            </h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="Enter your phone number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={!userName.trim() || !userPhone.trim() || isLoading}
          >
            {isLoading ? "Loading..." : "Start Chat"}
          </Button>
        </div>
      </form>
    </div>
  );
}
