'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Volume2, Maximize2 } from 'lucide-react';
import { User } from '@/types';

interface FloatingPodProps {
  currentUser: User;
  onExpand: () => void;
}

export default function FloatingPod({ currentUser, onExpand }: FloatingPodProps) {
  const { activeCallTargetUser } = useAppStore();

  const displayAvatar =
    activeCallTargetUser?.avatar_url ||
    currentUser.avatar_url ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

  return (
    <div
      onClick={onExpand}
      title="Click to expand active call"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 cursor-pointer group animate-in zoom-in-95 duration-200 select-none"
    >
      <div className="relative">
        {/* Animated Pulse Ring */}
        <div className="absolute -inset-1 rounded-full bg-[#FF5C00]/40 animate-ping opacity-75" />

        {/* Circular Avatar Pod with Orange Border */}
        <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-[#FF5C00] overflow-hidden shadow-2xl shadow-[#FF5C00]/40 relative z-10 flex items-center justify-center">
          <img src={displayAvatar} alt="Live Call" className="w-full h-full object-cover" />
          
          {/* Hover Overlay Icon */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <Maximize2 className="w-5 h-5 text-[#FF5C00]" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute -bottom-1 -right-1 bg-[#FF5C00] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-20 border border-black">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
