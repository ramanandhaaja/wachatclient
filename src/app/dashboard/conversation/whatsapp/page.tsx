"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWhatsAppOfficial } from "@/hooks/use-whatsapp-official";
import { useConversation, useConversations, type Conversation, type Message } from "@/hooks/use-conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
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
  User,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from "lucide-react";



export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const { sendMessage, isSending } = useWhatsAppOfficial();
  
  // Load conversations using react-query hook
  const { 
    conversations, 
    isLoading: loadingConversations, 
    error: conversationsError 
  } = useConversations('whatsapp');

  // Load active conversation and messages
  const {
    messages: conversationMessages,
    isLoading: messagesLoading,
    error: messagesError
  } = useConversation(activeConversation?.id ?? null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to bottom when messages load or change
  useEffect(() => {
    if (!messagesLoading && conversationMessages?.length) {
      scrollToBottom();
    }
  }, [messagesLoading, conversationMessages, scrollToBottom]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    
    // Clear the input field
    setMessageText("");
    
    try {
      // Send the message via the official WhatsApp Cloud API
      sendMessage({
        phoneNumber: activeConversation.user_phone,
        message: messageText,
        previewUrl: false,
        conversationId: activeConversation.id
      }, {
        onSuccess: (data) => {
          console.log('Message sent successfully:', data);
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error notification to user
    }
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
          {conversations?.map((conversation) => (
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : messagesError ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  Error loading messages: {messagesError instanceof Error ? messagesError.message : 'Unknown error'}
                </div>
              ) : conversationMessages && conversationMessages.map((message: Message) => (
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
                    <div className="flex items-center justify-end gap-1 text-xs mt-1 opacity-70">
                      {(message.sender_type === 'admin' || message.sender_type === 'bot') && (
                        <span className="inline-block">
                          {message.metadata?.delivery_status === 'pending' && (
                            <Clock className="h-3 w-3 text-gray-400" />
                          )}
                          {message.metadata?.delivery_status === 'sent' && (
                            <CheckCheck className="h-3 w-3 text-green-500" />
                          )}
                          {message.metadata?.delivery_status === 'failed' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{message.metadata?.error || 'Failed to send message'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                      )}
                      <span>{formatMessageTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                disabled={!messageText.trim() || isSending}
                onClick={handleSendMessage}
              >
                {isSending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-green-500"></span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
                <p className="text-sm">{conversationMessages?.length || 0}</p>
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
