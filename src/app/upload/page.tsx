/**
 * Resume Upload Page
 * Allows users to upload and preview their resume data
 */

import dynamic from "next/dynamic";

const UploadPageContent = dynamic(() => import("./page-content"), {
  ssr: false,
});

export default function UploadPage() {
  return <UploadPageContent />;
}
