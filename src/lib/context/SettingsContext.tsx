"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ApiMode = "mock" | "real";
export type AIProvider = "deepseek" | "gemini";

interface SettingsContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  aiProvider: AIProvider;
  setAIProvider: (provider: AIProvider) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiMode, setApiMode] = useState<ApiMode>("real");
  const [aiProvider, setAIProvider] = useState<AIProvider>("deepseek");

  return (
    <SettingsContext.Provider value={{ apiMode, setApiMode, aiProvider, setAIProvider }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

export function useApiMode() {
  const { apiMode, setApiMode } = useSettings();
  return { mode: apiMode, setMode: setApiMode };
}

export function useAIProvider() {
  const { aiProvider, setAIProvider } = useSettings();
  return { provider: aiProvider, setProvider: setAIProvider };
}
