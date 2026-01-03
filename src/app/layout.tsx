/**
 * Global styles for the application
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextRole - Your Next Role, Planned with Clarity",
  description:
    "A career strategy copilot that analyzes your resume, simulates career paths, and generates actionable career roadmaps.",
  icons: {
    icon: "/favicon.ico",
  },
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
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
