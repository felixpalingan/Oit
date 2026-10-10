import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-zinc-100 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Central Brand Spinner */}
      <div className="relative flex flex-col items-center">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Animated Spinner Ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-[#FF5C00]/20 border-t-[#FF5C00] animate-spin" />
          
          {/* Oit Logo */}
          <img
            src="/oit_logo.png"
            alt="Oit"
            className="w-16 h-16 rounded-2xl object-cover shadow-2xl shadow-[#FF5C00]/30 border border-zinc-800"
          />
        </div>

        {/* Loading Text */}
        <h2 className="text-sm font-black tracking-widest uppercase text-white mb-1.5">
          Oit
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] animate-ping" />
          <span>Synchronizing workspace...</span>
        </div>
      </div>
    </div>
  );
}
