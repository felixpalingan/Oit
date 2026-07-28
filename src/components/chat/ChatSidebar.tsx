'use client';

import React, { useState } from 'react';
import { UserProfile, Room, Friend } from '@/types';
import { MessageSquare, Users, UserPlus, Flame, LogOut, Plus, Search, Settings, Phone } from 'lucide-react';

interface ChatSidebarProps {
  currentProfile: UserProfile;
  rooms: Room[];
  friends: Friend[];
  activeRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onOpenProfile: () => void;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  onStartDirectCall: (friendProfile: UserProfile) => void;
  onLogout: () => void;
}

export default function ChatSidebar({
  currentProfile,
  rooms,
  friends,
  activeRoom,
  onSelectRoom,
  onOpenProfile,
  onOpenAddFriend,
  onOpenCreateGroup,
  onStartDirectCall,
  onLogout,
}: ChatSidebarProps) {
  const [tab, setTab] = useState<'chats' | 'friends'>('chats');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((r) =>
    (r.name || 'Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter((f) =>
    (f.profile?.display_name || f.profile?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-[#09090b] border-r border-zinc-800 flex flex-col shrink-0">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="relative w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#ff6b00] overflow-hidden flex items-center justify-center font-bold text-[#ff6b00] shrink-0 hover:opacity-90 transition-opacity shadow-md shadow-orange-950/30"
          >
            {currentProfile.avatar_url ? (
              <img src={currentProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              currentProfile.username[0]?.toUpperCase()
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </button>

          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-white truncate">
              {currentProfile.display_name || currentProfile.username}
            </h3>
            <span className="text-xs text-[#ff6b00] font-mono truncate block">
              @{currentProfile.username}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAddFriend}
            title="Tambah Teman"
            className="p-2 text-zinc-400 hover:text-[#ff6b00] hover:bg-zinc-800/80 rounded-xl transition-colors"
          >
            <UserPlus className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenCreateGroup}
            title="Buat Grup"
            className="p-2 text-zinc-400 hover:text-[#ff6b00] hover:bg-zinc-800/80 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-3 flex gap-2">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === 'chats'
              ? 'bg-[#18181b] text-[#ff6b00] border border-[#ff6b00]/30 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Chats ({rooms.length})
        </button>

        <button
          onClick={() => setTab('friends')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            tab === 'friends'
              ? 'bg-[#18181b] text-[#ff6b00] border border-[#ff6b00]/30 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Teman ({friends.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tab === 'chats' ? 'Cari obrolan...' : 'Cari teman...'}
            className="w-full pl-9 pr-4 py-2.5 bg-[#141417] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]"
          />
        </div>
      </div>

      {/* List Stream */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {tab === 'chats' ? (
          filteredRooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Flame className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Belum ada obrolan.</p>
              <button
                onClick={onOpenAddFriend}
                className="mt-3 text-xs text-[#ff6b00] font-semibold hover:underline"
              >
                + Tambah Teman & Mulai Chat
              </button>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#18181b] border-l-4 border-[#ff6b00] shadow-md'
                      : 'hover:bg-[#141417] text-zinc-300'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[#ff6b00] shrink-0 overflow-hidden">
                    {room.avatar_url ? (
                      <img src={room.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (room.name || 'Chat')[0]?.toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">
                        {room.name || 'Personal Chat'}
                      </h4>
                      {room.last_message && (
                        <span className="text-[10px] text-zinc-500">
                          {new Date(room.last_message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {room.last_message?.content || (room.type === 'group' ? 'Ruang obrolan grup' : 'Mulai obrolan...')}
                    </p>
                  </div>
                </div>
              );
            })
          )
        ) : (
          filteredFriends.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Belum ada daftar teman.</p>
              <button
                onClick={onOpenAddFriend}
                className="mt-3 text-xs text-[#ff6b00] font-semibold hover:underline"
              >
                + Cari atau Scan QR Teman
              </button>
            </div>
          ) : (
            filteredFriends.map((f) => {
              const profile = f.profile;
              if (!profile) return null;
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#141417] transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#ff6b00] flex items-center justify-center font-bold text-[#ff6b00] shrink-0 overflow-hidden">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile.username[0]?.toUpperCase()
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">
                        {profile.display_name || profile.username}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">@{profile.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartDirectCall(profile)}
                    title="Panggil Teman Ini"
                    className="p-2 text-[#ff6b00] hover:bg-[#ff6b00]/20 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )
        )}
      </div>

    </div>
  );
}
