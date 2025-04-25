"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";


interface CardViewAnalyticsProps {
  cardId: string;
  userId?: string;
}

export function CardViewAnalytics({ cardId, userId }: CardViewAnalyticsProps) {
  const recordView = useMutation({
    mutationFn: async () => {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "card_view",
          cardId,
          userId,
        }),
      });
    },
  });

  useEffect(() => {
    recordView.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, userId]);

  return null;
}
