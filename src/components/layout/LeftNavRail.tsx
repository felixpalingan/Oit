'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, Users, Settings } from 'lucide-react';
import { User } from '@/types';

interface LeftNavRailProps {
  currentUser: User;
  onOpenProfile: () => void;
  onOpenNewChat: () => void;
}

export default function LeftNavRail({
  currentUser,
  onOpenProfile,
  onOpenNewChat,
}: LeftNavRailProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'calls' | 'friends' | 'settings'>('chat');

  return (
    <div className="w-16 h-full bg-[#0a0a0c] border-r border-zinc-800/60 flex flex-col items-center justify-between py-4 shrink-0 select-none z-30">
      
      {/* Top Section: Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <img
            src="/oit_logo.png"
            alt="Oit"
            className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-[#FF5C00]/20"
          />
        </div>

        {/* Navigation Icon Stack */}
        <div className="flex flex-col items-center gap-3">
          {/* Chat Messages */}
          <button
            onClick={() => setActiveTab('chat')}
            title="Text Channels & Direct Messages"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'chat'
                ? 'bg-[#222228] text-[#FF5C00] border border-[#FF5C00]/40 shadow-md shadow-[#FF5C00]/10'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#161619]'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Voice/Video Calls */}
          <button
            onClick={() => setActiveTab('calls')}
            title="Calls & Rooms"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'calls'
                ? 'bg-[#222228] text-[#FF5C00] border border-[#FF5C00]/40 shadow-md shadow-[#FF5C00]/10'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#161619]'
            }`}
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Friends & Groups */}
          <button
            onClick={onOpenNewChat}
            title="Friends & Members"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'friends'
                ? 'bg-[#222228] text-[#FF5C00] border border-[#FF5C00]/40 shadow-md shadow-[#FF5C00]/10'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#161619]'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Settings & User Profile Avatar */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onOpenProfile}
          title="App Settings"
          className="w-11 h-11 text-zinc-500 hover:text-zinc-200 hover:bg-[#161619] rounded-2xl flex items-center justify-center transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div
          onClick={onOpenProfile}
          title={`@${currentUser.username}`}
          className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#FF5C00] overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00] cursor-pointer hover:scale-105 transition-transform shadow-md"
        >
          {currentUser.avatar_url ? (
            <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            currentUser.username[0]?.toUpperCase() || 'U'
          )}
        </div>
      </div>

    </div>
  );
}
