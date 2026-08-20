'use client';

import React from 'react';
import { Hand } from 'lucide-react';
import { KnockRequest } from '@/store/useAppStore';

interface KnockNotificationProps {
  knock: KnockRequest;
  onApprove: (knock: KnockRequest) => void;
  onDeny: (knock: KnockRequest) => void;
}

export default function KnockNotification({
  knock,
  onApprove,
  onDeny,
}: KnockNotificationProps) {
  return (
    <div className="absolute top-5 right-5 z-50 w-80 bg-[#161619]/95 backdrop-blur-md border border-[#FF5C00]/40 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in slide-in-from-top-4 duration-300 select-none">
      <div className="flex items-start gap-3">
        {/* Hand Icon Badge */}
        <div className="w-10 h-10 bg-zinc-800/90 border border-zinc-700/80 rounded-xl flex items-center justify-center text-[#FF5C00] shrink-0 mt-0.5 shadow-md">
          <Hand className="w-5 h-5" />
        </div>

        {/* Text Details */}
        <div className="flex-1 overflow-hidden">
          <h4 className="text-xs font-extrabold text-white tracking-wide">
            Knock Knock
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-snug">
            <span className="font-bold text-white">{knock.userName}</span> wants to enter{' '}
            <span className="text-[#FF5C00] font-bold">{knock.targetRoomTitle}</span>
          </p>
        </div>
      </div>

      {/* Approve / Deny Action Buttons */}
      <div className="flex items-center gap-2.5 mt-4 pt-1">
        <button
          onClick={() => onApprove(knock)}
          aria-label="Approve access request"
          className="flex-1 py-2.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF5C00]/20 transition-all active:scale-[0.98] min-h-[40px]"
        >
          Approve
        </button>

        <button
          onClick={() => onDeny(knock)}
          aria-label="Deny access request"
          className="flex-1 py-2.5 bg-[#26262a] hover:bg-[#303036] text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700/60 transition-all active:scale-[0.98] min-h-[40px]"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
