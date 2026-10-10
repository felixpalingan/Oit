'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors to console
    console.error('Oit Runtime Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 text-zinc-100 select-none relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Error Card */}
      <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative z-10 space-y-6">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Header Texts */}
        <div className="space-y-2">
          <h1 className="text-xl font-black text-white tracking-tight">
            Unexpected Client Interruption
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Oit encountered an unexpected issue while rendering this workspace. Your session data remains safe.
          </p>
        </div>

        {/* Error Details Snippet */}
        {error?.message && (
          <div className="w-full p-3 bg-[#18181c] border border-zinc-800/80 rounded-xl text-left overflow-x-auto max-h-24">
            <p className="text-[11px] font-mono text-red-300 break-words leading-tight">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[9px] font-mono text-zinc-500 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Recovery Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Reload & Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Return to Workspace Root</span>
          </button>
        </div>
      </div>
    </div>
  );
}
