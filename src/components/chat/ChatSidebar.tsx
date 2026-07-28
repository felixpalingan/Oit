'use client';

import React, { useState } from 'react';
import { User, Message } from '@/types';
import { MessageSquare, Users, Phone, Plus, CheckCheck, Check } from 'lucide-react';

interface ChatSidebarProps {
  currentUser: User;
  usersList: User[];
  activeChatUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenNewChatModal: () => void;
  searchQuery: string;
}

export default function ChatSidebar({
  currentUser,
  usersList,
  activeChatUser,
  onSelectUser,
  onOpenNewChatModal,
  searchQuery,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'calls'>('chats');

  // Sample placeholder contacts matching the user's design image if list is empty
  const defaultContacts: User[] = [
    { id: 'sample-1', username: 'Sarah (26)', display_name: 'Sarah (26)', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'sample-2', username: 'Kenji (31)', display_name: 'Kenji (31)', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'sample-3', username: 'Maria (40)', display_name: 'Maria (40)', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 'sample-4', username: 'David (34)', display_name: 'David (34)', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  ];

  const displayList = usersList.length > 0 ? usersList : defaultContacts;

  const filteredUsers = displayList.filter((u) =>
    (u.display_name || u.username).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-84 h-full bg-[#161619] border-r border-zinc-800/80 flex flex-col shrink-0 select-none">
      
      {/* Top Sidebar Navigation Tabs */}
      <div className="p-2.5 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between gap-1">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chats'
              ? 'bg-[#222227] text-white border border-[#FF5C00]/40 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#FF5C00]" />
          <span>Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'contacts'
              ? 'bg-[#222227] text-white border border-[#FF5C00]/40 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-zinc-400" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'calls'
              ? 'bg-[#222227] text-white border border-[#FF5C00]/40 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4 text-zinc-400" />
          <span>Calls</span>
        </button>
      </div>

      {/* Chat Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredUsers.map((user) => {
          const isActive = activeChatUser?.id === user.id;

          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#222228] border-l-4 border-[#FF5C00] shadow-md'
                  : 'hover:bg-[#1c1c21] text-zinc-300'
              }`}
            >
              {/* Avatar + Online Indicator */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-[#FF5C00]">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.username[0]?.toUpperCase()
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161619]" />
              </div>

              {/* Info & Message Preview */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">
                    {user.display_name || user.username}
                  </h4>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    10:42 AM
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400 truncate">
                  <CheckCheck className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                  <span className="truncate">
                    {user.username === 'Sarah (26)' ? 'Sounds perfect! See you then.' : 'Mulai percakapan Oit...'}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Button: New Chat */}
      <div className="p-3 bg-[#121215] border-t border-zinc-800/80">
        <button
          onClick={onOpenNewChatModal}
          className="w-full bg-[#ff8a65] hover:bg-[#ff7a52] text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#ff8a65]/20 transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Chat</span>
        </button>
      </div>

    </aside>
  );
}
