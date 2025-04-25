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
      // Get browser/device info
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
      let deviceType = "unknown";
      if (userAgent) {
        if (/mobile/i.test(userAgent)) deviceType = "mobile";
        else if (/tablet/i.test(userAgent)) deviceType = "tablet";
        else deviceType = "desktop";
      }
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "card_view",
          cardId,
          userId,
          eventData: {
            userAgent,
            deviceType,
          },
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
