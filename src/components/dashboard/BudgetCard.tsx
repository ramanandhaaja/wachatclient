import React from 'react';
import { Card } from '@/components/ui/card';

interface BudgetCardProps {
  amount: number;
  unused: number;
  used: number;
  reserved: number;
}

export function BudgetCard({ amount, unused, used, reserved }: BudgetCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-600">Budget usage</h3>
        <button className="p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9c0 4.97 4.03 9 9 9"/>
            <path d="M12 3v2"/>
            <path d="M12 19v2"/>
            <path d="m3 12 2 0"/>
            <path d="m19 12 2 0"/>
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold">${amount.toLocaleString()}</h2>
      </div>

      <div className="flex h-2 mb-4 rounded-full overflow-hidden">
        <div className="bg-[#E4E4FB]" style={{ width: `${unused}%` }} />
        <div className="bg-[#B4B4F9]" style={{ width: `${used}%` }} />
        <div className="bg-[#1C1C1C]" style={{ width: `${reserved}%` }} />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E4E4FB]"></span>
          <span>Unused</span>
          <span className="font-medium">{unused}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#B4B4F9]"></span>
          <span>Used</span>
          <span className="font-medium">{used}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1C1C1C]"></span>
          <span>Reserved</span>
          <span className="font-medium">{reserved}%</span>
        </div>
      </div>
    </Card>
  );
}
