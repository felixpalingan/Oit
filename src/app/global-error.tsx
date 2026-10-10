'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              System Root Failure
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              A fatal error occurred within the root shell of Oit.
            </p>
          </div>

          {error?.message && (
            <div className="w-full p-3 bg-[#18181c] border border-zinc-800 rounded-xl text-left overflow-x-auto max-h-24">
              <p className="text-[11px] font-mono text-red-300 break-words leading-tight">
                {error.message}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Restart Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
