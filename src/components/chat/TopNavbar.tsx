'use client';

import React from 'react';
import { User } from '@/types';
import { Search, QrCode, Settings, LogOut } from 'lucide-react';

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
      
      {/* Left: Branding with Real Oit Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/oit_logo.png"
          alt="Oit Logo"
          className="w-9 h-9 rounded-xl object-cover shadow-md border border-zinc-800"
        />
        <h1 className="text-2xl font-extrabold text-[#FF5C00] tracking-tight">
          Oit
        </h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            aria-label="Search chats"
            className="w-full pl-10 pr-4 py-2 bg-[#1c1c21] border border-zinc-800/90 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus-visible:ring-2 focus-visible:ring-[#FF5C00] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenQR}
          title="QR Code Scanner & Code"
          aria-label="QR Code Scanner & Code"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
        >
          <QrCode className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          onClick={() => alert('Settings Oit')}
          title="Settings"
          aria-label="Settings"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
          <div
            title={`@${currentUser.username}`}
            aria-label={`Current user: @${currentUser.username}`}
            className="w-9 h-9 rounded-full bg-zinc-800 border border-[#FF5C00] flex items-center justify-center font-bold text-[#FF5C00] overflow-hidden shadow-md"
          >
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={`Avatar for ${currentUser.username}`} className="w-full h-full object-cover" />
            ) : (
              currentUser.username[0]?.toUpperCase() || 'U'
            )}
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            aria-label="Log out"
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

    </header>
  );
}
