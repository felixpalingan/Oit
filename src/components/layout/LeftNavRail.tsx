'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, Users, Settings, Plus, Hash } from 'lucide-react';
import { User } from '@/types';

interface LeftNavRailProps {
  currentUser: User;
  onOpenProfile: () => void;
  onOpenNewChat: () => void;
  onOpenCreateServer?: () => void;
}

export default function LeftNavRail({
  currentUser,
  onOpenProfile,
  onOpenNewChat,
  onOpenCreateServer,
}: LeftNavRailProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'calls' | 'friends'>('chat');
  const [selectedServer, setSelectedServer] = useState<string | null>('design-team');

  const demoServers = [
    { id: 'design-team', name: 'Design Team', icon: '🎨' },
    { id: 'dev-lounge', name: 'Dev Lounge', icon: '💻' },
  ];

  return (
    <div className="w-16 h-full bg-[#0a0a0c] border-r border-zinc-800/60 flex flex-col items-center justify-between py-4 shrink-0 select-none z-30">
      
      {/* Top Section: Oit Logo & Server Icons List */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        
        {/* Oit Logo */}
        <div
          onClick={() => setSelectedServer(null)}
          title="Direct Messages & Oit Home"
          className="w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-[#121215] border border-zinc-800 shadow-md"
        >
          <img
            src="/oit_logo.png"
            alt="Oit"
            className="w-9 h-9 rounded-xl object-cover"
          />
        </div>

        <div className="w-8 h-[1px] bg-zinc-800/80 my-1" />

        {/* Server Icons List */}
        <div className="flex flex-col items-center gap-3 w-full">
          {demoServers.map((srv) => (
            <div
              key={srv.id}
              onClick={() => setSelectedServer(srv.id)}
              title={srv.name}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer font-bold text-base transition-all ${
                selectedServer === srv.id
                  ? 'bg-[#FF5C00] text-white rounded-xl shadow-lg shadow-[#FF5C00]/30'
                  : 'bg-[#161619] text-zinc-400 hover:text-white hover:rounded-xl hover:bg-[#202025]'
              }`}
            >
              <span>{srv.icon}</span>
            </div>
          ))}

          {/* Add Server Button + */}
          <button
            onClick={onOpenCreateServer}
            title="Create a Server"
            className="w-11 h-11 rounded-full bg-[#161619] hover:bg-[#FF5C00] text-zinc-400 hover:text-white flex items-center justify-center transition-all shadow-md group"
          >
            <Plus className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
          </button>
        </div>

      </div>

      {/* Bottom Section: Settings & User Profile Avatar */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onOpenProfile}
          title="User Settings"
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
