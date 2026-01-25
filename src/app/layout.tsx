/**
 * Global styles for the application
 */

import type { Metadata } from 'next';
import { SettingsProvider } from '@/lib/context/SettingsContext';
import { ResumeProvider } from '@/lib/context/ResumeContext';
import Footer from '@/components/Footer';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://my-next-role.vercel.app';
const siteName = 'NextRole';
const siteDescription =
  'AI-powered career strategy copilot that analyzes your resume, generates personalized career paths, identifies skill gaps, and creates actionable month-by-month roadmaps for your next role.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NextRole - AI Career Strategy Copilot',
    template: '%s | NextRole',
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  generator: 'Next.js',
  keywords: [
    'career planning',
    'AI career coach',
    'resume analysis',
    'skill gap analysis',
    'career roadmap',
    'career development',
    'career path',
    'job search',
    'professional development',
    'career strategy',
  ],
  referrer: 'origin-when-cross-origin',
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: 'NextRole - AI Career Strategy Copilot',
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
        alt: 'NextRole Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextRole - AI Career Strategy Copilot',
    description: siteDescription,
    images: [`${siteUrl}/android-chrome-512x512.png`],
    creator: '@nextrole',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="wjsrKQApqIPyzuQgutkwO2lvykBJkxNPjFEmTx9qXFg" />
      </head>
      <body className="bg-slate-50 text-slate-900 flex flex-col">
        <SettingsProvider>
          <ResumeProvider>
            <div className="flex-1">{children}</div>
            <Footer />
          </ResumeProvider>
        </SettingsProvider>

        {/* Cloudflare Web Analytics - Only load if token exists */}
        {token && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${token}"}`}
          ></script>
        )}
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}
