"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useNavigation } from "@/hooks/use-navigation";
import LoadingPage from "@/components/ui/loadingPage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isNavigating = useNavigation();

  // Listen for a custom event from the Sidebar component
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebar-toggle" as any, handleSidebarToggle);

    return () => {
      window.removeEventListener("sidebar-toggle" as any, handleSidebarToggle);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "256px" }}
      >
        <div className="container py-4 px-6">
          {isNavigating && (
            <div
              className="absolute inset-0 z-50 bg-gray-50/80 backdrop-blur-sm"
              style={{
                transition: "opacity 0.2s ease-in-out",
                opacity: isNavigating ? 1 : 0,
              }}
            >
              <LoadingPage />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
