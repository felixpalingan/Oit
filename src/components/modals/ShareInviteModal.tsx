'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link, Hash } from 'lucide-react';
import { useModalA11y } from '@/hooks/useModalA11y';

interface ShareInviteModalProps {
  serverId: string;
  serverName: string;
  onClose: () => void;
}

export default function ShareInviteModal({
  serverId,
  serverName,
  onClose,
}: ShareInviteModalProps) {
  useModalA11y(true, onClose);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/invite/${serverId}`
    : `https://oit.app/invite/${serverId}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(serverId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
    >
      
      {/* Share Invite Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-invite-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-6 text-white relative"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF5C00]" aria-hidden="true" />
            <h3 id="share-invite-title" className="text-lg font-black text-white tracking-tight">
              Invite Friends to Server
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Identity Badge */}
        <div className="flex items-center gap-3.5 p-3.5 bg-[#1c1c21] border border-zinc-800 rounded-2xl">
          <div className="w-11 h-11 rounded-2xl bg-[#FF5C00] text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-[#FF5C00]/30 shrink-0">
            {serverName[0]?.toUpperCase() || 'S'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-extrabold text-white truncate">{serverName}</h4>
            <p className="text-[11px] text-zinc-400 font-mono">Server ID: {serverId}</p>
          </div>
        </div>

        {/* 1. SERVER ID CODE COPY */}
        <div className="space-y-2">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
            SERVER INVITE CODE
          </span>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-[#121215] border border-zinc-800 rounded-2xl text-xs font-mono text-[#FF5C00] truncate flex items-center gap-2 select-all">
              <Hash className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <span className="truncate font-bold">{serverId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy server invite code"
              className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none ${
                copiedCode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#FF5C00] hover:bg-[#ff701a] text-white shadow-lg shadow-[#FF5C00]/25'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* 2. FULL INVITE LINK COPY */}
        <div className="space-y-2">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
            FULL INVITATION LINK
          </span>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-[#121215] border border-zinc-800 rounded-2xl text-xs text-zinc-300 truncate flex items-center gap-2 select-all">
              <Link className="w-4 h-4 text-zinc-500 shrink-0" aria-hidden="true" />
              <span className="truncate">{inviteLink}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Copy full invitation link"
              className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#1c1c21] hover:bg-zinc-800 border border-zinc-700 text-white'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            Send this link or code to anyone so they can join <span className="text-white font-bold">{serverName}</span>.
          </p>
        </div>

      </div>

    </div>
  );
}
