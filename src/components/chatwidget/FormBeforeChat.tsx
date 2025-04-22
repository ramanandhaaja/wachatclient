import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormBeforeChatProps {
  onUserRegistered: (name: string, phone: string) => Promise<void>;
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
      // Notify parent component that user registration is complete
      await onUserRegistered(userName, userPhone);
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
