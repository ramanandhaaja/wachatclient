import React from 'react';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  monthEvents?: Array<{ startTime: Date }>;
  eventsLoading?: boolean;
}

export function CalendarGrid({ currentDate, selectedDate, onDateSelect, monthEvents, eventsLoading }: CalendarGridProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentDate.getMonth() &&
           selectedDate.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const getEventsForDay = (day: number) => {
    if (!monthEvents) return [];
    return monthEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(newDate);
  };

  return (
    <div className="w-full">
      <div>
        <div className="pl-4 grid grid-cols-7 gap-3 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="flex justify-center py-2 text-sm text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          <div className="col-span-7 pl-4 overflow-y-auto grid grid-cols-7 gap-3 content-start justify-items-center">
          {Array(firstDayOfMonth).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="h-16" />
          ))}
          {days.map((day) => {
            const isSelectedDay = isSelected(day);
            const isTodayDay = isToday(day);
            const dayEvents = eventsLoading ? [] : getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-16 w-16 rounded-xl flex flex-col items-center justify-center relative mx-auto",
                  "hover:bg-gray-50 transition-colors",
                  "font-medium",
                  isSelectedDay && "bg-white ring-1 ring-black/5 shadow-lg",
                  isTodayDay && !isSelectedDay && "text-blue-600 font-bold",
                  hasEvents && !isSelectedDay && "bg-gray-100"
                )}
              >
                {isTodayDay && (
                  <div className="absolute top-2 w-1 h-1 rounded-full bg-current" />
                )}
                <span className="text-lg">{day}</span>
                {eventsLoading ? (
                  <div className="text-xs text-gray-500 mt-0.5 opacity-50">Loading...</div>
                ) : hasEvents && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
