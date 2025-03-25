"use client";

import { useSession } from "next-auth/react";
import { ClipboardList, Clock, Star } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { EfficiencyChart } from "@/components/dashboard/EfficiencyChart";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { BudgetCard } from "@/components/dashboard/BudgetCard";

export default function Dashboard() {
  const { status } = useSession();

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-8">Please sign in to access the dashboard.</div>;
  }

  const performanceData = [
    { avatar: "/avatars/01.png", percentage: 19 },
    { avatar: "/avatars/02.png", percentage: 65 },
    { avatar: "/avatars/03.png", percentage: 87 },
    { avatar: "/avatars/04.png", percentage: 34 },
  ];

  const efficiencyData = Array.from({ length: 20 }, (_, i) => ({
    value: 50 + Math.sin(i / 3) * 25
  }));

  const activityData = [
    { day: "Mon", value: 30 },
    { day: "Tue", value: 20 },
    { day: "Wed", value: 35 },
    { day: "Thu", value: 25 },
    { day: "Fri", value: 32 },
    { day: "Sat", value: 28 },
    { day: "Sun", value: 15 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="py-2 px-4 bg-[#1C1C1C] text-white rounded-lg">Upgrade plan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Completed tasks"
          value="85%"
          icon={<ClipboardList size={24} />}
        />
        <StatsCard
          title="Customer rating"
          value="4.8"
          icon={<Star size={24} />}
        />
        <StatsCard
          title="Avg. time"
          value="3.5h"
          icon={<Clock size={24} />}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart data={performanceData} />
        <BudgetCard
          amount={50734}
          unused={50}
          used={30}
          reserved={20}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EfficiencyChart data={efficiencyData} />
        <ActivityChart data={activityData} />
      </div>
    </div>
  );
}
