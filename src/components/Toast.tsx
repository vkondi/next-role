'use client';

import { X } from 'lucide-react';

interface ToastProps {
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

export default function Toast({ type, title, message, onClose }: ToastProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`border rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4 ${styles.container}`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm sm:text-base ${styles.title}`}>
          {title}
        </p>
        <p className={`text-xs sm:text-sm mt-1 ${styles.message}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 mt-0.5 p-1 hover:bg-white/50 rounded transition-colors ${styles.icon}`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
