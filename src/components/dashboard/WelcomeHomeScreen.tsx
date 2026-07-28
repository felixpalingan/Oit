'use client';

import React, { useState } from 'react';
import { UserPlus, LogIn, Users, Sparkles, ArrowRight, Waves } from 'lucide-react';
import { User } from '@/types';

interface WelcomeHomeScreenProps {
  currentUser: User;
  onOpenCreateServer: () => void;
  onOpenJoinServer: () => void;
  onOpenAddFriend: () => void;
}

export default function WelcomeHomeScreen({
  currentUser,
  onOpenCreateServer,
  onOpenJoinServer,
  onOpenAddFriend,
}: WelcomeHomeScreenProps) {
  const [friendUsername, setFriendUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleFriendSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsername.trim()) return;
    onOpenAddFriend();
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    onOpenJoinServer();
  };

  return (
    <div className="flex-1 h-full bg-[#121215] flex flex-col items-center justify-center p-6 text-white select-none overflow-y-auto relative">
      
      {/* Glow Effect */}
      <div className="absolute top-1/4 w-96 h-96 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Title & Subtitle */}
      <div className="text-center max-w-xl mb-10 z-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5C00]/15 border border-[#FF5C00]/30 text-[#FF5C00] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Selamat datang, @{currentUser.username}!</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Selamat datang di Oit!
        </h1>

        <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">
          It looks a little quiet here. Let's get you connected and set up your communication hub.
        </p>
      </div>

      {/* 3 Interactive Guide Action Cards matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10 mb-12">
        
        {/* CARD 1: CARI TEMAN */}
        <div className="bg-[#161619] border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-4 group-hover:text-[#FF5C00] transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1.5">
              Cari Teman
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect with people you know by searching for their unique Oit username.
            </p>
          </div>

          <form onSubmit={handleFriendSearch} className="relative">
            <input
              type="text"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              placeholder="Enter username..."
              className="w-full pl-4 pr-10 py-3 bg-[#121215] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* CARD 2: JOIN SERVER */}
        <div className="bg-[#161619] border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-4 group-hover:text-[#FF5C00] transition-colors">
              <LogIn className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1.5">
              Join Server
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Have an invite code? Enter it here to instantly join a community.
            </p>
          </div>

          <form onSubmit={handleQuickJoin} className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite link or code"
              className="flex-1 px-3 py-3 bg-[#121215] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <button
              type="submit"
              onClick={onOpenJoinServer}
              className="px-4 py-3 bg-[#26262a] hover:bg-[#FF5C00] text-zinc-200 hover:text-white font-bold rounded-2xl text-xs transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        {/* CARD 3: BIKIN KOMUNITAS (HIGHLIGHTED ORANGE CARD) */}
        <div className="bg-gradient-to-b from-[#241712] to-[#161619] border border-[#FF5C00]/40 hover:border-[#FF5C00] rounded-3xl p-6 shadow-2xl shadow-[#FF5C00]/10 flex flex-col justify-between space-y-5 transition-all group relative overflow-hidden">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF5C00] text-white flex items-center justify-center mb-4 shadow-lg shadow-[#FF5C00]/30">
              <Users className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1.5">
              Bikin Komunitas
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Start fresh. Create your own server for gaming, studying, or just hanging out.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateServer}
            className="w-full py-3.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-[#FF5C00]/30 transition-all active:scale-[0.98]"
          >
            Create Server
          </button>
        </div>

      </div>

      {/* Bottom Waiting Container */}
      <div className="w-full max-w-md bg-[#161619]/60 border border-dashed border-zinc-800 rounded-3xl py-8 px-6 flex flex-col items-center justify-center text-center space-y-2 z-10">
        <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500 mb-1">
          <Waves className="w-5 h-5 text-zinc-400" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          WAITING FOR CONNECTIONS
        </span>
      </div>

    </div>
  );
}
