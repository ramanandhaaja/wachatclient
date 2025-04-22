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

  useEffect(() => {
    // Function to inject or re-inject the style
    const injectStyle = () => {
      let style = document.getElementById('elevenlabs-hide-branding-style') as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = 'elevenlabs-hide-branding-style';
        document.head.appendChild(style);
      }
      style.innerHTML = `
        .elevenlabs-convai-powered, 
        .elevenlabs-convai-widget-powered, 
        .elevenlabs-convai-widget-footer, 
        ._poweredBy_1f9vw_251,
        a[href*="elevenlabs.io"], 
        div[style*="Powered by ElevenLabs"], 
        div:has(> a[href*="elevenlabs.io"]) {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          pointer-events: none !important;
        }
        /* Remove box-shadow and filter from likely widget containers */
        .elevenlabs-convai-widget, 
        .elevenlabs-convai-inline, 
        .elevenlabs-convai-widget-root, 
        .elevenlabs-convai-root, 
        [class*="shadow"], 
        [style*="box-shadow"],
        [style*="filter"] {
          box-shadow: none !important;
          filter: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }
      `;
    };

    // Initial injection
    injectStyle();

    // Interval to re-inject style and remove the element
    const interval = setInterval(() => {
      injectStyle();
      // Remove the element from the DOM if it exists
      document.querySelectorAll('._poweredBy_1f9vw_251').forEach(el => el.remove());
    }, 300);

    return () => {
      clearInterval(interval);
      const style = document.getElementById('elevenlabs-hide-branding-style');
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
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
