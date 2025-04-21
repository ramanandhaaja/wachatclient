import React, { useEffect } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";

// Use dynamic to avoid SSR issues with custom elements
export const ElevenLabsConvaiInline: React.FC = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const widget = document.querySelector("elevenlabs-convai") as HTMLElement | null;
      if (widget) {
        widget.style.position = "static";
        widget.style.bottom = "auto";
        widget.style.right = "auto";
        widget.style.left = "auto";
        widget.style.top = "auto";
        widget.style.width = "100%";
        widget.style.maxWidth = "400px";
        widget.style.margin = "0 auto";
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* @ts-ignore - Custom element handled in d.ts file but Vercel might still complain */}
      <elevenlabs-convai
        agent-id="mYBbjVrZtaABCei4JmhH"
        mode="inline"
      >
      {/* @ts-ignore - Custom element handled in d.ts file but Vercel might still complain */}
      </elevenlabs-convai>
      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="afterInteractive"
        async
      />
    </>  
  );
};
