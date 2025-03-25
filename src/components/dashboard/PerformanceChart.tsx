import React from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface PerformanceData {
  avatar: string;
  percentage: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Performance</h3>
        <div className="flex items-center gap-2">
          <span>QA team</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-6">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="h-32 w-16 bg-pink-100 rounded-lg relative">
              <div 
                className="absolute bottom-0 w-full bg-pink-300 rounded-lg"
                style={{ height: `${item.percentage}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-600">{item.percentage}%</div>
            <Image src={item.avatar} alt="Team member" width={32} height={32} className="rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}
