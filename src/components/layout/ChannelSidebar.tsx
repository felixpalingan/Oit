'use client';

import React, { useState } from 'react';
import { User, Message } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, Plus, Hash, Megaphone, Volume2, Lock } from 'lucide-react';

interface ChannelSidebarProps {
  currentUser: User;
  usersList: User[];
  activeChatUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenNewChatModal: () => void;
  lastMessagesMap?: Record<string, Message>;
  unreadCountsMap?: Record<string, number>;
  onKnockRoom?: (roomName: string, title: string) => void;
}

export default function ChannelSidebar({
  currentUser,
  usersList,
  activeChatUser,
  onSelectUser,
  onOpenNewChatModal,
  lastMessagesMap = {},
  unreadCountsMap = {},
  onKnockRoom,
}: ChannelSidebarProps) {
  const { activeChannelId, setActiveChannel } = useAppStore();

  const channelsList = [
    { id: 'ui-ux-sync', name: 'ui-ux-sync', icon: Hash, locked: false },
    { id: 'general', name: 'general', icon: Hash, locked: false },
    { id: 'announcements', name: 'announcements', icon: Megaphone, locked: false },
    { id: 'secret-room', name: 'Secret Room', icon: Lock, locked: true },
  ];

  const defaultUsers: User[] = [
    { id: 'sample-1', username: 'Sarah (26)', display_name: 'Sarah (26)', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'sample-2', username: 'Kenji (31)', display_name: 'Kenji (31)', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  ];

  const displayUsers = usersList.length > 0 ? usersList : defaultUsers;

  return (
    <aside className="w-60 md:w-64 h-full bg-[#161619] border-r border-zinc-800/80 flex flex-col shrink-0 select-none">
      
      {/* Top Header: Team Server Dropdown */}
      <div className="px-4 py-3.5 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-[#18181c] transition-colors">
        <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
          <span>Design Team</span>
        </h2>
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* CHANNELS Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase">
            <span>CHANNELS</span>
            <button
              onClick={() => alert('Buat Channel Baru')}
              title="Add Channel"
              className="hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {channelsList.map((ch) => {
              const IconComp = ch.icon;
              const isActive = activeChannelId === ch.id && !activeChatUser;

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    if (ch.locked && onKnockRoom) {
                      onKnockRoom(ch.id, ch.name);
                    } else {
                      setActiveChannel(ch.id, ch.name);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#222228] text-white shadow-sm border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1c21]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconComp className={`w-4 h-4 shrink-0 ${ch.locked ? 'text-[#FF5C00]' : 'text-zinc-500'}`} />
                    <span className="truncate">{ch.name}</span>
                  </div>

                  {ch.locked && (
                    <span className="text-[9px] font-bold bg-[#FF5C00]/20 text-[#FF5C00] px-1.5 py-0.5 rounded border border-[#FF5C00]/40">
                      Knock
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DIRECT MESSAGES Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase">
            <span>DIRECT MESSAGES</span>
            <button
              onClick={onOpenNewChatModal}
              title="New DM"
              className="hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {displayUsers.map((user) => {
              const isActive = activeChatUser?.id === user.id;
              const unreadCount = unreadCountsMap[user.id] || 0;

              return (
                <div
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#222228] text-white shadow-sm border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1c21]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00]">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.username[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#161619]" />
                  </div>

                  <span className="text-xs font-semibold truncate flex-1">
                    {user.display_name || user.username}
                  </span>

                  {unreadCount > 0 && (
                    <span className="w-4 h-4 bg-[#FF5C00] text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </aside>
  );
}
