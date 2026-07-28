'use client';

import React from 'react';
import { User } from '@/types';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallModalProps {
  caller: User;
  isVideo?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({
  caller,
  isVideo = true,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 text-white">
        
        {/* Animated Ringing Avatar Container */}
        <div className="relative my-2">
          <div className="absolute -inset-3 rounded-full bg-[#FF5C00]/30 animate-ping opacity-75" />
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-[#FF5C00] overflow-hidden flex items-center justify-center font-extrabold text-2xl text-[#FF5C00] relative z-10 shadow-xl">
            {caller.avatar_url ? (
              <img src={caller.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              caller.username[0]?.toUpperCase()
            )}
          </div>
        </div>

        {/* Incoming Call Details */}
        <div>
          <h3 className="text-lg font-black text-white">
            {caller.display_name || caller.username}
          </h3>
          <p className="text-xs text-[#FF5C00] font-semibold mt-1 flex items-center justify-center gap-1.5">
            {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            <span>Memanggil Panggilan {isVideo ? 'Video' : 'Suara'} Oit...</span>
          </p>
        </div>

        {/* Action Buttons: Decline (Red) vs Accept (Green) */}
        <div className="flex items-center justify-center gap-6 w-full pt-2">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Tolak</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.97] animate-bounce"
          >
            <Phone className="w-4 h-4" />
            <span>Terima</span>
          </button>
        </div>

      </div>
    </div>
  );
}
