/**
 * Resume Context
 * Manages resume profile state across the application
 * Profile is NOT persisted - lost on page reload (by design)
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { ResumeProfile } from '@/lib/types';

interface ResumeContextType {
  resumeProfile: ResumeProfile | null;
  setResumeProfile: (profile: ResumeProfile | null) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(
    null
  );

  return (
    <ResumeContext.Provider value={{ resumeProfile, setResumeProfile }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
}
