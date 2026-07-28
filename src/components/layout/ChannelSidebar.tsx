'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Hash,
  Volume2,
  Lock,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { User, Message, Channel } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { createClient } from '@/utils/supabase/client';
import CreateChannelModal from '@/components/modals/CreateChannelModal';

interface ChannelSidebarProps {
  currentUser: User;
  usersList: User[];
  activeChatUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenNewChatModal: () => void;
  lastMessagesMap: Record<string, Message>;
  unreadCountsMap: Record<string, number>;
  onKnockRoom: (roomId: string, title: string) => void;
  onJoinVoiceCall?: (channel: Channel) => void;
}

export default function ChannelSidebar({
  currentUser,
  usersList,
  activeChatUser,
  onSelectUser,
  onOpenNewChatModal,
  lastMessagesMap,
  unreadCountsMap,
  onKnockRoom,
  onJoinVoiceCall,
}: ChannelSidebarProps) {
  const {
    activeServerId,
    activeChannelId,
    setActiveChannel,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);

  const [textChannels, setTextChannels] = useState<Channel[]>([]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([]);
  const [serverTitle, setServerTitle] = useState('Design Team');

  const supabase = createClient();

  const fetchChannels = async () => {
    if (!activeServerId) return;

    try {
      const { data: srv } = await supabase
        .from('servers')
        .select('*')
        .eq('id', activeServerId)
        .single();

      if (srv) {
        setServerTitle(srv.name);
      } else {
        setServerTitle(activeServerId === 'design-team' ? 'Design Team' : 'Server Oit');
      }

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', activeServerId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const text = data.filter((c: Channel) => c.type === 'text');
        const voice = data.filter((c: Channel) => c.type === 'voice');
        setTextChannels(text as Channel[]);
        setVoiceChannels(voice as Channel[]);
      } else {
        setTextChannels([
          { id: 'ui-ux-sync', server_id: activeServerId, name: 'ui-ux-sync', type: 'text' },
          { id: 'general', server_id: activeServerId, name: 'general', type: 'text' },
          { id: 'announcements', server_id: activeServerId, name: 'announcements', type: 'text' },
        ]);
        setVoiceChannels([
          { id: 'lounge-voice', server_id: activeServerId, name: 'Lounge Voice', type: 'voice' },
          { id: 'secret-room', server_id: activeServerId, name: 'Secret Room', type: 'voice', is_private: true },
        ]);
      }
    } catch (err) {
      console.error('Fetch channels error:', err);
    }
  };

  useEffect(() => {
    if (activeServerId) {
      fetchChannels();

      const channelSub = supabase
        .channel(`public:channels:${activeServerId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'channels', filter: `server_id=eq.${activeServerId}` },
          () => {
            fetchChannels();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channelSub);
      };
    }
  }, [activeServerId, supabase]);

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name && u.display_name.toLowerCase().includes(q))
    );
  });

  const isServerMode = activeServerId !== null;

  return (
    <div className="w-64 md:w-72 h-full bg-[#161619] border-r border-zinc-800/80 flex flex-col shrink-0 select-none z-20">
      
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-white truncate max-w-[170px]">
            {isServerMode ? serverTitle : 'Messages'}
          </h2>
          {isServerMode && <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </div>

        <div className="flex items-center gap-1">
          {isServerMode ? (
            <button
              onClick={() => setShowCreateChannelModal(true)}
              title="Create Channel"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={onOpenNewChatModal}
              title="New Chat"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* DM Mode Search & Tabs */}
      {!isServerMode && (
        <div className="px-4 pt-3 pb-2 space-y-3 border-b border-zinc-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-3 py-2 bg-[#121215] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
          </div>

          <div className="flex p-1 bg-[#121215] rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'direct'
                  ? 'bg-[#1c1c21] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'groups'
                  ? 'bg-[#1c1c21] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Groups
            </button>
          </div>
        </div>
      )}

      {/* Main Stream Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        
        {isServerMode ? (
          <>
            {/* TEXT CHANNELS GROUP */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                <span>TEXT CHANNELS ({textChannels.length})</span>
                <button
                  onClick={() => setShowCreateChannelModal(true)}
                  className="hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {textChannels.map((c) => {
                const isActive = activeChannelId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChannel(c.id, c.name)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1c1c21]'
                    }`}
                  >
                    <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span className="truncate">{c.name}</span>
                  </div>
                );
              })}
            </div>

            {/* VOICE CHANNELS GROUP (Issue 3 Fix: Triggers LiveKit Voice Call) */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                <span>VOICE CHANNELS ({voiceChannels.length})</span>
                <button
                  onClick={() => setShowCreateChannelModal(true)}
                  className="hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {voiceChannels.map((c) => {
                const isActive = activeChannelId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (c.is_private) {
                        onKnockRoom(c.id, c.name);
                      } else if (onJoinVoiceCall) {
                        onJoinVoiceCall(c);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1c1c21]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Volume2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#FF5C00]'}`} />
                      <span className="truncate">{c.name}</span>
                    </div>

                    {c.is_private && (
                      <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* DM Mode */
          <div className="space-y-1">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Tidak ada kontak obrolan.</p>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = activeChatUser?.id === u.id;
                const lastMsg = lastMessagesMap[u.id];
                const unreadCount = unreadCountsMap[u.id] || 0;
                const previewText = lastMsg
                  ? lastMsg.content || (lastMsg.attachment_url ? 'Sent an attachment' : '')
                  : 'Start a conversation';

                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#1c1c21] border border-zinc-800 text-white shadow-sm'
                        : 'hover:bg-[#1c1c21]/60 text-zinc-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00]">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.username[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#161619]" />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {u.display_name || u.username}
                        </h4>
                        {lastMsg && (
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                          {previewText}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-[#FF5C00] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {showCreateChannelModal && activeServerId && (
        <CreateChannelModal
          serverId={activeServerId}
          onClose={() => setShowCreateChannelModal(false)}
          onChannelCreated={() => {
            fetchChannels();
          }}
        />
      )}

    </div>
  );
}
