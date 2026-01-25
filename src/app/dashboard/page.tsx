import type { Metadata } from 'next';
import DashboardContent from './dashboard-content';

export const metadata: Metadata = {
  title: 'Career Dashboard - NextRole',
  description:
    'View your AI-generated career paths, skill gap analysis, and month-by-month roadmap to achieve your next career milestone.',
  openGraph: {
    title: 'Career Dashboard - NextRole',
    description:
      'View your AI-generated career paths, skill gap analysis, and month-by-month roadmap to achieve your next career milestone.',
  },
  alternates: {
    canonical: '/dashboard',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return <DashboardContent />;
}
