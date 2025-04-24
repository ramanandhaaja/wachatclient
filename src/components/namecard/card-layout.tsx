"use client";

import { type ReactNode } from "react";

interface CardLayoutProps {
  children: ReactNode;
}

export function CardLayout({ children }: CardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="py-4 px-4">
        <div className="container max-w-md mx-auto">
          {children}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Created with{" "}
              <a
                href={process.env.NEXT_PUBLIC_APP_URL}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Cardify
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
