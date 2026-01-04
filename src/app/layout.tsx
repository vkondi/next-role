/**
 * Global styles for the application
 */

import type { Metadata } from "next";
import { ResumeProvider } from "@/lib/context/ResumeContext";
import { ApiModeProvider } from "@/lib/context/ApiModeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextRole - Your Next Role, Planned with Clarity",
  description:
    "A career strategy copilot that analyzes your resume, simulates career paths, and generates actionable career roadmaps.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-slate-50 text-slate-900">
        <ApiModeProvider>
          <ResumeProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </ResumeProvider>
        </ApiModeProvider>
      </body>
    </html>
  );
}
