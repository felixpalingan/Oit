'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

export interface ToastItem {
  id: string;
  type?: 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastNotificationProps {
  toast: ToastItem | null;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function ToastNotification({
  toast,
  onClose,
  autoCloseDuration = 5000,
}: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [toast, onClose, autoCloseDuration]);

  if (!toast) return null;

  const isWarning = toast.type === 'warning' || toast.title.toLowerCase().includes('large');

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-sm w-full select-none animate-in slide-in-from-top-3 duration-200">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 text-white ${
          isWarning
            ? 'bg-[#1c1416]/95 border-red-500/50 shadow-red-950/40'
            : 'bg-[#18181c]/95 border-zinc-700 shadow-black/80'
        }`}
      >
        {/* Icon Circle */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isWarning
              ? 'bg-red-950/80 text-red-400 border border-red-800/80'
              : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
          }`}
        >
          {isWarning ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 text-zinc-200" />}
        </div>

        {/* Content Details matching Images 1 & 2 */}
        <div className="flex-1 overflow-hidden pr-1">
          <h4
            className={`text-xs font-black tracking-tight leading-tight mb-0.5 ${
              isWarning ? 'text-red-400 uppercase tracking-wider' : 'text-white'
            }`}
          >
            {toast.title}
          </h4>
          <p
            className={`text-[11px] leading-relaxed ${
              isWarning ? 'text-red-200/90' : 'text-zinc-300'
            }`}
          >
            {toast.message}
          </p>
        </div>

        {/* X Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Notifikasi"
          className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
