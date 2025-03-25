import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface ActivityData {
  day: string;
  value: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Activity</h3>
          <span className="bg-[#E3FFA8] text-sm px-2 py-1 rounded">5%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>QA team</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="value" fill="#E4E4FB" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-4">
        {data.map((item, index) => (
          <div key={index} className="text-sm text-gray-600">
            {item.day}
          </div>
        ))}
      </div>
    </Card>
  );
}
