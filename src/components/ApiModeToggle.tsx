/**
 * API Mode Toggle Component
 * Collapsible floating button for switching between mock and real API
 */

"use client";

import { useState } from "react";
import { useApiMode } from "@/lib/context/ApiModeContext";
import { Settings, X } from "lucide-react";

export function ApiModeToggle() {
  const { mode, setMode } = useApiMode();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Invisible overlay to close panel when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-40">
        {/* Expanded Panel - positioned above button */}
        {isOpen && (
          <div
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200 w-56"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">API Mode:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("mock")}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                      mode === "mock"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Mock
                  </button>
                  <button
                    onClick={() => setMode("real")}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                      mode === "real"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Real API
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {mode === "mock"
                  ? "Using mock data for testing"
                  : "Using Deepseek API for real analysis"}
              </p>
            </div>
          </div>
        )}

        {/* Floating Button - stays in same position */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-all hover:scale-110 active:scale-95"
          title={isOpen ? "Close settings" : "API mode settings"}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  );
}
