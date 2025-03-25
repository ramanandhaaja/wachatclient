import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <button className="p-2">
          {icon}
        </button>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={trend.isPositive ? "rotate-0 text-green-600" : "rotate-180 text-gray-600"}
          >
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
          </svg>
          <span className={trend.isPositive ? "text-green-600" : "text-gray-600"}>
            {trend.value}%
          </span>
        </div>
      )}
    </Card>
  );
}
