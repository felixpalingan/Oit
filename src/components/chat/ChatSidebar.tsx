'use client';

import React, { useState } from 'react';
import { User, Message } from '@/types';
import { MessageSquare, Users, Phone, Plus, CheckCheck, Check, Image as ImageIcon, FileText } from 'lucide-react';

interface ChatSidebarProps {
  currentUser: User;
  usersList: User[];
  activeChatUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenNewChatModal: () => void;
  searchQuery: string;
  lastMessagesMap?: Record<string, Message>;
  unreadCountsMap?: Record<string, number>;
}

export default function ChatSidebar({
  currentUser,
  usersList,
  activeChatUser,
  onSelectUser,
  onOpenNewChatModal,
  searchQuery,
  lastMessagesMap = {},
  unreadCountsMap = {},
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'calls'>('chats');

  // Sample placeholder contacts matching user design image if database list is empty
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

  const formatMessagePreview = (msg?: Message) => {
    if (!msg) return 'Mulai percakapan Oit...';
    if (msg.attachment_url || msg.file_name) {
      const isImg = (msg.attachment_url || msg.file_name || '').match(/\.(png|jpe?g|webp|gif)$/i);
      return isImg ? '📷 Foto' : `📄 ${msg.file_name || 'Dokumen'}`;
    }
    return msg.content || 'Pesan baru';
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '10:42 AM';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
          const lastMsg = lastMessagesMap[user.id];
          const unreadCount = unreadCountsMap[user.id] || 0;
          const isSender = lastMsg?.sender_id === currentUser.id;

          return (
            <div
              key={user.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectUser(user)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectUser(user);
                }
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-[#FF5C00] ${
                isActive
                  ? 'bg-[#222228] border border-[#FF5C00]/50 shadow-md shadow-[#FF5C00]/5 text-white'
                  : 'hover:bg-[#1c1c21] text-zinc-300 border border-transparent'
              }`}
            >
              {/* Avatar + Online Indicator */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-[#FF5C00]">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.username}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
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
                    {formatTimestamp(lastMsg?.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 truncate flex-1 pr-2">
                    {isSender && (
                      <CheckCheck
                        className={`w-3.5 h-3.5 shrink-0 ${
                          lastMsg?.is_read ? 'text-[#FF5C00]' : 'text-zinc-500'
                        }`}
                      />
                    )}
                    <span className="truncate">{formatMessagePreview(lastMsg)}</span>
                  </div>

                  {/* Unread Count Badge */}
                  {unreadCount > 0 && (
                    <span className="w-4 h-4 bg-[#FF5C00] text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Button: New Chat */}
      <div className="p-3 bg-[#121215] border-t border-zinc-800/80">
        <button
          type="button"
          onClick={onOpenNewChatModal}
          aria-label="Start New Chat"
          className="w-full bg-[#FF5C00] hover:bg-[#ff701a] text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/20 transition-all active:scale-[0.99] min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Chat</span>
        </button>
      </div>

    </aside>
  );
}
