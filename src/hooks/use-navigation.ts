"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle start of navigation
  const startNavigation = useCallback(() => {
    // Use requestAnimationFrame to ensure the state updates in the next frame
    requestAnimationFrame(() => {
      setIsNavigating(true);
    });
  }, []);

  // Handle end of navigation
  const endNavigation = useCallback(() => {
    requestAnimationFrame(() => {
      setIsNavigating(false);
    });
  }, []);

  useEffect(() => {
    // Listen for Next.js route change start
    const handleStart = () => {
      startNavigation();
    };

    // Listen for Next.js route change complete
    const handleComplete = () => {
      endNavigation();
    };

    // Add event listeners for navigation events
    window.addEventListener("beforeunload", handleStart);
    document.addEventListener("mousemove", () => {
      if (document.querySelector("link[rel=prefetch]")) {
        startNavigation();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, [startNavigation, endNavigation]);

  // Handle pathname/searchParams changes
  useEffect(() => {
    startNavigation();

    // Use a RAF to ensure the loading state is visible
    const frame = requestAnimationFrame(() => {
      // Then use a timeout to handle the end of navigation
      const timeout = setTimeout(() => {
        endNavigation();
      }, 300);

      return () => clearTimeout(timeout);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, searchParams, startNavigation, endNavigation]);

  return isNavigating;
}
