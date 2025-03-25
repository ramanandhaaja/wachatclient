"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Phone, 
  Calendar, 
  ChevronDown,
  Search,
  Paperclip,
  Send,
  Download,
  X,
  Bot,
  User
} from "lucide-react";
import { format } from "date-fns";
import { WhatsAppStatusPanel } from "./WhatsAppStatusPanel";

interface Message {
  id: number;
  content: string;
  sender_type: 'user' | 'admin' | 'bot';
  timestamp: string;
}

interface Conversation {
  id: number;
  user_name: string;
  user_phone: string;
  last_message?: string;
  last_message_time?: string;
  status: 'active' | 'inactive' | 'pending';
  is_bot_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_admin_id?: string;
}

export default function ChatPage() {
  const [messageText, setMessageText] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock data
  const conversations: Conversation[] = [
    {
      id: 1,
      user_name: 'John Doe',
      user_phone: '+1234567890',
      last_message: 'Hello there!',
      last_message_time: new Date().toISOString(),
      status: 'active',
      is_bot_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Mock messages
  const activeMessages = useMemo<Message[]>(() => [
    {
      id: 1,
      content: 'Hi there!',
      sender_type: 'user',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      content: 'Hello! How can I help you today?',
      sender_type: 'admin',
      timestamp: new Date().toISOString()
    }
  ], []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);
  
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    setMessageText("");
    // In a real app, this is where you would send the message
  };
  
  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (e) {
      return timestamp;
    }
  };
  
  const formatLastActive = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Left sidebar - Contact list */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Chats</h2>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <WhatsAppStatusPanel />
        
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {`${conversations.length} Conversations`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Newest</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeConversation?.id === conversation.id ? "bg-gray-50" : ""
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.user_name || conversation.user_phone}`} />
                  <AvatarFallback>{(conversation.user_name || conversation.user_phone).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${
                      activeConversation?.id === conversation.id ? "text-blue-600" : ""
                    }`}>
                      {conversation.user_name || conversation.user_phone}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {conversation.last_message_time 
                        ? formatMessageTime(conversation.last_message_time) 
                        : formatMessageTime(conversation.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    {conversation.is_bot_active ? (
                      <Bot className="h-3 w-3 text-blue-500 mr-1" />
                    ) : (
                      <User className="h-3 w-3 text-green-500 mr-1" />
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
                {conversation.status === 'pending' && (
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                    !
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Middle - Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeConversation.user_name || activeConversation.user_phone}`} />
                  <AvatarFallback>{(activeConversation.user_name || activeConversation.user_phone).charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{activeConversation.user_name || activeConversation.user_phone}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activeConversation.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-xs text-gray-500">
                      {activeConversation.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet</div>
              ) : (
                activeMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_type === 'user' 
                          ? 'bg-gray-100 text-gray-800' 
                          : message.sender_type === 'admin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {message.sender_type !== 'user' && (
                        <div className="text-xs opacity-70 mb-1">
                          {message.sender_type === 'admin' ? 'Admin' : 'Bot'}
                        </div>
                      )}
                      <p>{message.content}</p>
                      <div className="text-xs text-right mt-1 opacity-70">
                        {formatMessageTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input 
                placeholder="Type a message..." 
                className="flex-1"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                disabled={!messageText.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar - Contact details */}
      {showDetails && activeConversation && (
        <div className="w-64 border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold">Contact Details</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowDetails(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeConversation.user_name || activeConversation.user_phone}`} />
                <AvatarFallback>{(activeConversation.user_name || activeConversation.user_phone).charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mt-2">{activeConversation.user_name || 'Unknown'}</h3>
              <p className="text-sm text-gray-500">{activeConversation.user_phone}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-500">Status</h4>
                <p className="text-sm">{activeConversation.status}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">First Contact</h4>
                <p className="text-sm">{formatLastActive(activeConversation.created_at)}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Last Active</h4>
                <p className="text-sm">{formatLastActive(activeConversation.updated_at)}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Assigned To</h4>
                <p className="text-sm">
                  {activeConversation.assigned_admin_id 
                    ? 'Admin' 
                    : activeConversation.is_bot_active 
                      ? 'AI Bot' 
                      : 'Unassigned'}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Total Messages</h4>
                <p className="text-sm">{activeMessages.length}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </Button>
              
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
