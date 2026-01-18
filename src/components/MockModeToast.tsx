"use client";

import { useState } from "react";
import Toast from "./Toast";

export default function MockModeToast() {
  const [showToast, setShowToast] = useState(true);

  const handleClose = () => {
    setShowToast(false);
  };

  if (!showToast) {
    return null;
  }

  return (
    <Toast
      type="info"
      title="Mock Mode Enabled"
      message="You're currently viewing mock data. To see real AI analysis, switch to API mode using the toggle in the bottom right corner."
      onClose={handleClose}
    />
  );
}
