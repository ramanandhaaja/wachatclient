import React, { useEffect } from "react";
import Script from "next/script";

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

/* eslint-disable react/jsx-no-undef */
  return (
    <>
    
      <elevenlabs-convai
        agent-id="mYBbjVrZtaABCei4JmhH"
        mode="inline"
      ></elevenlabs-convai>
      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="afterInteractive"
        async
      />
    </>
  );
/* eslint-enable react/jsx-no-undef */
};
