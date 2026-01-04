/**
 * API Mode Toggle Component
 * Allows users to switch between mock and real API
 */

"use client";

import { useApiMode } from "@/lib/context/ApiModeContext";
import { Settings } from "lucide-react";

export function ApiModeToggle() {
  const { mode, setMode } = useApiMode();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">API Mode:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("mock")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === "mock"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Mock
            </button>
            <button
              onClick={() => setMode("real")}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                mode === "real"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Real API
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {mode === "mock"
            ? "Using mock data for testing"
            : "Using Deepseek API for real analysis"}
        </p>
      </div>
    </div>
  );
}
