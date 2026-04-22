import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3sHealth AI Operator Licence",
  description:
    "Tier 1 — AI Awareness. Training, assessment, and accountability for AMS staff using AI at 3sHealth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="min-h-screen antialiased text-slate-900 bg-slate-50">{children}</body>
    </html>
  );
}
