'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredTool } from '@langchain/core/tools';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ConversationSummaryMemory } from 'langchain/memory';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { z } from 'zod';

// Create a mock database for available time slots
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type TimeSlot = string;

const availableSlots: Record<DayOfWeek, TimeSlot[]> = {
  'Monday': ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
  'Tuesday': ['11:00 AM', '1:00 PM', '5:00 PM'],
  'Wednesday': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
  'Thursday': ['9:00 AM', '1:00 PM', '4:00 PM', '5:00 PM'],
  'Friday': ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM'],
  'Saturday': ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
  'Sunday': [],
};

const reservations: any[] = [];

// Tool to check slot availability
class CheckAvailabilityTool extends StructuredTool {
  name = "check_availability";
  description = "Check which time slots are available for a specific day";
  schema = z.object({
    day: z.string().describe("The day to check availability for (e.g., Monday, Tuesday)"),
  });

  async _call({ day }: z.infer<typeof this.schema>) {
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() as DayOfWeek;
    
    if (!(formattedDay in availableSlots)) {
      return `I couldn't find information for ${day}. Please specify a valid day of the week.`;
    }
    
    if (availableSlots[formattedDay].length === 0) {
      return `I'm sorry, we are closed on ${formattedDay}.`;
    }
    
    return `Available slots for ${formattedDay}: ${availableSlots[formattedDay].join(', ')}`;
  }
}

// Tool to make a reservation
class MakeReservationTool extends StructuredTool {
  name = "make_reservation";
  description = "Make a barbershop reservation";
  schema = z.object({
    name: z.string().describe("Customer name"),
    day: z.string().describe("Day of the week (e.g., Monday, Tuesday)"),
    time: z.string().describe("Time slot (e.g., 9:00 AM, 2:00 PM)"),
    service: z.string().optional().describe("Haircut service requested"),
  });

  async _call({ name, day, time, service }: z.infer<typeof this.schema>) {
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() as DayOfWeek;
    
    if (!(formattedDay in availableSlots)) {
      return `I couldn't find information for ${day}. Please specify a valid day of the week.`;
    }
    
    if (!availableSlots[formattedDay].includes(time)) {
      return `I'm sorry, the time slot ${time} is not available on ${formattedDay}. Please check available slots first.`;
    }
    
    // Remove the time slot from availability
    const index = availableSlots[formattedDay].indexOf(time);
    availableSlots[formattedDay].splice(index, 1);
    
    // Add the reservation to the list
    const reservationId = reservations.length + 1;
    const reservation = {
      id: reservationId,
      name,
      day: formattedDay,
      time,
      service: service || 'Regular haircut', // Default service
      createdAt: new Date().toISOString(),
    };
    
    reservations.push(reservation);
    
    return `Reservation confirmed! Details:
- Reservation ID: ${reservationId}
- Name: ${name}
- Day: ${formattedDay}
- Time: ${time}
- Service: ${service || 'Regular haircut'}

We look forward to seeing you! Please arrive 5 minutes before your appointment time.`;
  }
}

// Create the chat prompt template
const systemTemplate = `You are a helpful assistant for WhatsBot AI.
Your job is to help businesses manage their WhatsApp customer interactions.

You can help with:
- Setting up WhatsApp business profiles
- Managing customer conversations
- Creating automated responses
- Setting up chat workflows
- Viewing analytics and insights

Please be professional and helpful at all times.`;

// Shared session memories storage for server-side
const sessionMemories: Record<string, ConversationSummaryMemory> = {};

// Setup the chat agent
async function setupChatAgent() {
  const tools = [new CheckAvailabilityTool(), new MakeReservationTool()];

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
    ["ai", "I'll help you with that request using my available tools."],
    ["human", "Here's the chat history: {chat_history}"],
  ]);
  
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
  });

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  return AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: true,
  });
}

// Process a message and return the response (server-side function)
export async function processMessage(sessionId: string, message: string): Promise<string> {
  try {
    // Initialize or retrieve memory for this session
    if (!sessionMemories[sessionId]) {
      sessionMemories[sessionId] = new ConversationSummaryMemory({
        memoryKey: "chat_history",
        llm: new ChatOpenAI({ temperature: 0 }),
        returnMessages: true,
      });
    }

    // Setup the agent
    const executor = await setupChatAgent();

    // Get chat history from memory
    const history = await sessionMemories[sessionId].loadMemoryVariables({});

    // Process the message with history
    const result = await executor.invoke({
      input: message,
      chat_history: (history.chat_history || []) as BaseMessage[],
    });

    // Save the conversation to memory
    await sessionMemories[sessionId].saveContext(
      { input: message } as Record<string, unknown>,
      { output: result.output } as Record<string, unknown>
    );

    return result.output as string;
  } catch (err) {
    console.error('Error processing message:', err);
    return "I apologize, but I'm having trouble processing your message right now. Please try again later.";
  }
}

// React hook for client-side use
export function useOpenAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session when component mounts
  useEffect(() => {
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  // Handle sending messages to the chat
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await processMessage(sessionId, message);
      setLoading(false);
      return response;
    } catch (err) {
      console.error('Error processing message:', err);
      setError('An error occurred while processing your message.');
      setLoading(false);
      return null;
    }
  }, [sessionId]);

  // Clean up memory when component unmounts
  useEffect(() => {
    return () => {
      if (sessionId && sessionMemories[sessionId]) {
        delete sessionMemories[sessionId];
      }
    };
  }, [sessionId]);

  return {
    loading,
    error,
    sessionId,
    sendMessage,
  };
}
