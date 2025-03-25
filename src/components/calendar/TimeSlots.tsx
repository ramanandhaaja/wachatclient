import React from 'react';

interface TimeSlotsProps {
  viewMode: '12h' | '24h';
}

export function TimeSlots({ viewMode }: TimeSlotsProps) {
  const format12Hour = (hour: number, minute: number) => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const format24Hour = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const slots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return viewMode === '12h' ? format12Hour(hour, minute) : format24Hour(hour, minute);
  });

  return (
    <div className="flex-1 space-y-2.5 overflow-y-auto h-[calc(100vh-160px)] pr-3 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
      {slots.map((time) => (
        <button
          key={time}
          className="w-full py-3.5 ml-1 mt-3 text-base font-medium text-gray-600 rounded-2xl ring-2 ring-gray-200/50 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          {time}
        </button>
      ))}
    </div>
  );
}