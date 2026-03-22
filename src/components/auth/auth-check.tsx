"use client";

import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthCheck({ children, fallback }: AuthCheckProps) {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
