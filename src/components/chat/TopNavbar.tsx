'use client';

import React from 'react';
import { User } from '@/types';
import { Search, QrCode, Settings, PhoneCall, LogOut } from 'lucide-react';

interface TopNavbarProps {
  currentUser: User;
  onOpenQR: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function TopNavbar({
  currentUser,
  onOpenQR,
  onLogout,
  searchQuery,
  setSearchQuery,
}: TopNavbarProps) {
  return (
    <header className="w-full bg-[#121215] border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between z-20 shrink-0 select-none">
      
      {/* Left: Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 shadow-md">
          <div className="flex items-center gap-0.5 bg-[#FF5C00] text-white px-1.5 py-0.5 rounded-lg text-[11px] font-black tracking-tight">
            <PhoneCall className="w-3 h-3 fill-current" />
            <span>QOit</span>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-[#FF5C00] tracking-tight">
          Oit
        </h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-[#1c1c21] border border-zinc-800/90 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenQR}
          title="QR Code Scanner & Code"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
        >
          <QrCode className="w-5 h-5" />
        </button>

        <button
          onClick={() => alert('Settings Oit')}
          title="Settings"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div
            title={`@${currentUser.username}`}
            className="w-9 h-9 rounded-full bg-zinc-800 border border-[#FF5C00] flex items-center justify-center font-bold text-[#FF5C00] overflow-hidden shadow-md"
          >
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              currentUser.username[0]?.toUpperCase() || 'U'
            )}
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </header>
  );
}
