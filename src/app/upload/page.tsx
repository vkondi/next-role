/**
 * Resume Upload Page
 * Allows users to upload and preview their resume data
 */

import type { Metadata } from 'next';
import UploadPageContent from './page-content';

export const metadata: Metadata = {
  title: 'Upload Resume - NextRole',
  description:
    'Upload your resume to get AI-powered career analysis, strategic path recommendations, and personalized roadmaps for your next role.',
  openGraph: {
    title: 'Upload Resume - NextRole',
    description:
      'Upload your resume to get AI-powered career analysis, strategic path recommendations, and personalized roadmaps for your next role.',
  },
};

export default function UploadPage() {
  return <UploadPageContent />;
}
