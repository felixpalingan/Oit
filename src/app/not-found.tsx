'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 text-white select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative z-10 space-y-5">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-2xl border-2 border-[#FF5C00]/20 border-t-[#FF5C00] animate-spin" />
          <img
            src="/oit_logo.png"
            alt="Oit"
            className="w-14 h-14 rounded-xl object-cover shadow-xl border border-zinc-800"
          />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C00] bg-[#FF5C00]/10 px-2.5 py-1 rounded-full border border-[#FF5C00]/20">
            404 NOT FOUND
          </span>
          <h2 className="text-base font-extrabold text-white mt-3">
            Room or Page Not Found
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            The channel or resource you requested is unavailable. Redirecting to workspace...
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.replace('/')}
          className="w-full py-2.5 px-4 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Return to Workspace Now</span>
        </button>
      </div>
    </div>
  );
}
