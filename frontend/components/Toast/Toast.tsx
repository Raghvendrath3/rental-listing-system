'use client';

import { Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }[toast.type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[toast.type];

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
  }[toast.type];

  return (
    <div
      className={`${bgColor} border rounded-lg px-4 py-3 mb-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <span className={`${iconColor} font-bold text-lg flex-shrink-0 mt-0.5`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className={`${textColor} text-sm font-medium`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${textColor} hover:opacity-70 flex-shrink-0 text-lg font-bold`}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
