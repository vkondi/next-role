/**
 * API Mode Context
 * Manages global API mode (mock vs real) state across the entire application
 */

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ApiMode = "mock" | "real";

interface ApiModeContextType {
  mode: ApiMode;
  setMode: (mode: ApiMode) => void;
}

const ApiModeContext = createContext<ApiModeContextType | undefined>(undefined);

export function ApiModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ApiMode>("mock");

  return (
    <ApiModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ApiModeContext.Provider>
  );
}

export function useApiMode() {
  const context = useContext(ApiModeContext);
  if (!context) {
    throw new Error("useApiMode must be used within ApiModeProvider");
  }
  return context;
}
