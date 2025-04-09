// components/ChatWidget.tsx
'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react'; // optional icon

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
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

      {/* Chat Iframe Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden z-40 animate-fade-in">
          <iframe
            src="https://yourchatbot.com" // replace with your chatbot URL
            className="w-full h-full border-none rounded-2xl"
            title="Chat Widget"
          />
        </div>
      )}
    </>
  );
}