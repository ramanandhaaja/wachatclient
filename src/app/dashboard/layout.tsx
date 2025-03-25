"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for a custom event from the Sidebar component
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '256px' }}
      >
        <div className="container py-4 px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
