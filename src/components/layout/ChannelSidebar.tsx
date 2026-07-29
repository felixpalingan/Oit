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
  Settings,
  Compass,
  Share2,
  Check,
  Users,
} from 'lucide-react';
import { User, Message, Channel } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { createClient } from '@/utils/supabase/client';

interface ChannelSidebarProps {
  currentUser: User;
  usersList: User[];
  onlineUserIds?: Set<string>;
  activeChatUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenNewChatModal: () => void;
  lastMessagesMap: Record<string, Message>;
  unreadCountsMap: Record<string, number>;
  onKnockRoom: (roomId: string, title: string) => void;
  onJoinVoiceCall?: (channel: Channel) => void;
  onSelectChannel?: () => void;
  onOpenJoinServer?: () => void;
  onOpenMembersModal?: () => void;
  onOpenEditServerModal?: () => void;
  onOpenCreateChannelModal?: () => void;
  onOpenEditChannelModal?: (channel: Channel) => void;
}

export default function ChannelSidebar({
  currentUser,
  usersList,
  onlineUserIds = new Set(),
  activeChatUser,
  onSelectUser,
  onOpenNewChatModal,
  lastMessagesMap,
  unreadCountsMap,
  onKnockRoom,
  onJoinVoiceCall,
  onSelectChannel,
  onOpenJoinServer,
  onOpenMembersModal,
  onOpenEditServerModal,
  onOpenCreateChannelModal,
  onOpenEditChannelModal,
}: ChannelSidebarProps) {
  const {
    activeServerId,
    activeChannelId,
    activeCallRoomId,
    setActiveChannel,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const [textChannels, setTextChannels] = useState<Channel[]>([]);
  const [voiceChannels, setVoiceChannels] = useState<Channel[]>([]);
  const [serverTitle, setServerTitle] = useState('Server');

  // Supabase Realtime Server-Wide Voice Room Presence State
  const [voiceRoomMembersMap, setVoiceRoomMembersMap] = useState<Record<string, User[]>>({});

  const supabase = createClient();

  // Server-Wide Realtime Presence Listener
  useEffect(() => {
    if (!activeServerId || !currentUser) return;

    const presenceChannel = supabase.channel(`server_voice_presence:${activeServerId}`, {
      config: { presence: { key: currentUser.id } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const roomMap: Record<string, User[]> = {};

        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user && p.vcChannelId) {
              if (!roomMap[p.vcChannelId]) {
                roomMap[p.vcChannelId] = [];
              }
              if (!roomMap[p.vcChannelId].some((u) => u.id === p.user.id)) {
                roomMap[p.vcChannelId].push(p.user);
              }
            }
          });
        });

        setVoiceRoomMembersMap(roomMap);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user: {
              id: currentUser.id,
              username: currentUser.username,
              display_name: currentUser.display_name || currentUser.username,
              avatar_url: currentUser.avatar_url,
            },
            vcChannelId: activeCallRoomId || null,
          });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [activeServerId, activeCallRoomId, currentUser, supabase]);

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
        setServerTitle('Server Oit');
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

        const isValid = data.some((c: Channel) => c.id === activeChannelId);
        if (!isValid && text.length > 0) {
          setActiveChannel(text[0].id, text[0].name);
        }
      } else {
        const defaultChan: Channel = {
          id: `${activeServerId}-general`,
          server_id: activeServerId,
          name: 'general',
          type: 'text',
        };
        setTextChannels([defaultChan]);
        setVoiceChannels([]);
        if (!activeChannelId || activeChannelId !== defaultChan.id) {
          setActiveChannel(defaultChan.id, defaultChan.name);
        }
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

  const handleCopyInviteCode = () => {
    if (!activeServerId) return;
    navigator.clipboard.writeText(activeServerId);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // Filter & Sort DM Users by Most Recent Message Timestamp
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name && u.display_name.toLowerCase().includes(q))
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const timeA = lastMessagesMap[a.id] ? new Date(lastMessagesMap[a.id].created_at).getTime() : 0;
    const timeB = lastMessagesMap[b.id] ? new Date(lastMessagesMap[b.id].created_at).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return a.username.localeCompare(b.username);
  });

  const isServerMode = activeServerId !== null;

  return (
    <div className="w-64 md:w-72 h-full bg-[#161619] border-r border-zinc-800/80 flex flex-col shrink-0 select-none z-20">
      
      {/* Header Bar */}
      <div className="px-4 md:px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
          <h2 className="text-sm font-extrabold text-white truncate">
            {isServerMode ? serverTitle : 'Messages'}
          </h2>
          {isServerMode && <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
        </div>

        <div className="flex items-center gap-1">
          {isServerMode ? (
            <>
              {/* Server Members List Button */}
              <button
                onClick={onOpenMembersModal}
                title="Daftar Anggota Server"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4 text-zinc-300 hover:text-white" />
              </button>

              {/* Server Settings Button */}
              <button
                onClick={onOpenEditServerModal}
                title="Pengaturan Detail Server"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-300 hover:text-white" />
              </button>

              {/* Copy Server Invite Code Button */}
              <button
                onClick={handleCopyInviteCode}
                title="Copy Server Invite Code"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative"
              >
                {copiedInvite ? (
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                ) : (
                  <Share2 className="w-4 h-4 text-[#FF5C00]" />
                )}
              </button>

              <button
                onClick={onOpenJoinServer}
                title="Join or Explore Servers"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Compass className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>

              <button
                onClick={onOpenCreateChannelModal}
                title="Create Channel"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
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
                  onClick={onOpenCreateChannelModal}
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
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1c1c21]'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setActiveChannel(c.id, c.name);
                        if (onSelectChannel) onSelectChannel();
                      }}
                      className="flex items-center gap-2.5 truncate flex-1"
                    >
                      <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span className="truncate">{c.name}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenEditChannelModal) onOpenEditChannelModal(c);
                      }}
                      title="Edit Channel Settings"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/30 rounded-md transition-opacity"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* VOICE CHANNELS GROUP WITH REALTIME PARTICIPANTS LIST */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                <span>VOICE CHANNELS ({voiceChannels.length})</span>
                <button
                  onClick={onOpenCreateChannelModal}
                  className="hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {voiceChannels.map((c) => {
                const isActive = activeChannelId === c.id;
                const vcRoomKey = `vc_${c.id}`;
                const isVoiceActive = activeCallRoomId === vcRoomKey;
                const participants = voiceRoomMembersMap[vcRoomKey] || (isVoiceActive ? [currentUser] : []);

                return (
                  <div key={c.id} className="space-y-1">
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-all group ${
                        isActive || isVoiceActive
                          ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                          : 'text-zinc-400 hover:text-white hover:bg-[#1c1c21]'
                      }`}
                    >
                      <div
                        onClick={() => {
                          if (onSelectChannel) onSelectChannel();
                          if (c.is_private) {
                            onKnockRoom(c.id, c.name);
                          } else if (onJoinVoiceCall) {
                            onJoinVoiceCall(c);
                          }
                        }}
                        className="flex items-center gap-2.5 truncate flex-1"
                      >
                        <Volume2 className={`w-4 h-4 shrink-0 ${isActive || isVoiceActive ? 'text-white' : 'text-[#FF5C00]'}`} />
                        <span className="truncate">{c.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {c.is_private && (
                          <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenEditChannelModal) onOpenEditChannelModal(c);
                          }}
                          title="Edit Channel Settings"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/30 rounded-md transition-opacity"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Realtime Participants List */}
                    {participants.length > 0 && (
                      <div className="pl-6 pr-2 py-1 space-y-1">
                        {participants.map((p, idx) => (
                          <div
                            key={p.id || idx}
                            className="flex items-center gap-2 px-2 py-1 bg-[#121215] border border-zinc-800 rounded-lg text-[11px] font-semibold text-zinc-300"
                          >
                            <div className="w-5 h-5 rounded-full bg-[#FF5C00] text-white flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (p.username || 'U')[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="truncate">{p.display_name || p.username}</span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-auto" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* DM Mode: REAL-TIME ONLINE / OFFLINE STATUS BADGE */
          <div className="space-y-1">
            {sortedUsers.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Tidak ada kontak obrolan.</p>
            ) : (
              sortedUsers.map((u) => {
                const isSelected = activeChatUser?.id === u.id;
                const isUserOnline = onlineUserIds.has(u.id);
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
                      
                      {/* REAL-TIME ONLINE (GREEN) / OFFLINE (GRAY) BADGE */}
                      <div
                        title={isUserOnline ? 'Online' : 'Offline'}
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161619] transition-colors ${
                          isUserOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                        }`}
                      />
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

    </div>
  );
}
