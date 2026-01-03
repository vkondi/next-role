/**
 * Hook for managing API mode (mock vs real)
 * Stored in browser's localStorage for persistence
 */

"use client";

import { useEffect, useState } from "react";

const API_MODE_KEY = "nextRole_apiMode";

export type ApiMode = "mock" | "real";

export function useApiMode() {
  const [mode, setMode] = useState<ApiMode>("mock");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(API_MODE_KEY) as ApiMode | null;
    if (stored && (stored === "mock" || stored === "real")) {
      setMode(stored);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  const setApiMode = (newMode: ApiMode) => {
    setMode(newMode);
    localStorage.setItem(API_MODE_KEY, newMode);
  };

  return { mode, setApiMode, isLoaded };
}
