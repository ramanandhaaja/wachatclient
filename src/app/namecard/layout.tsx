import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Name Card",
    template: "%s | Name Card",
  },
  description: "View and share digital name cards",
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
