// This file defines custom elements for TypeScript

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "agent-id"?: string;
        "mode"?: string;
      };
    }
  }
}

// This export is needed to make this a module
export {};
