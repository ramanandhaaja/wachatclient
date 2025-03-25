"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { TimeSlots } from '@/components/calendar/TimeSlots';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'12h' | '24h'>('12h');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="flex flex h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Left Panel */}
      <div className="w-2/3 p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 bg-purple-100 rounded-xl">
            <AvatarImage src="/avatars/01.png" />
            <AvatarFallback>PR</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">30 Min Meeting</h2>
            <div className="flex items-center gap-4 text-gray-600 mt-1">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                30m
              </span>
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Cal Video
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-medium">
            {months[currentDate.getMonth()]} <span className="text-gray-400">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* Right Panel */}
      <div className="w-1/3 border-l p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })} {selectedDate.getDate()}
            </h2>
          </div>
          <div className="flex gap-0.5 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('12h')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                viewMode === '12h' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              12h
            </button>
            <button
              onClick={() => setViewMode('24h')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                viewMode === '24h' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              24h
            </button>
          </div>
        </div>

        <TimeSlots viewMode={viewMode} />
      </div>
    </div>
  );
}