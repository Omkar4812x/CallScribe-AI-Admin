import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "CallScribe AI — AI-Powered Call Summaries",
  description:
    "Turn your Zoom and Meet transcripts into concise summaries, action items, and follow-up emails — instantly.",
  keywords: ["call summary", "AI transcription", "meeting notes", "action items"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
