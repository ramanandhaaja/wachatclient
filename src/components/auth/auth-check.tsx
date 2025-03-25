"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthCheck({ children, fallback }: AuthCheckProps) {
  const { status } = useSession();

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
