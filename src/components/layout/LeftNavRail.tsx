'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { User, Server } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface LeftNavRailProps {
  currentUser: User;
  onOpenProfile: () => void;
  onOpenNewChat: () => void;
  onOpenCreateServer?: () => void;
  onSelectDMHome?: () => void;
  hasUnreadMessages?: boolean;
  refreshKey?: number;
}

export default function LeftNavRail({
  currentUser,
  onOpenProfile,
  onOpenNewChat,
  onOpenCreateServer,
  onSelectDMHome,
  hasUnreadMessages = false,
  refreshKey = 0,
}: LeftNavRailProps) {
  const { activeServerId, setActiveServer, setActiveChannel } = useAppStore();
  const [servers, setServers] = useState<Server[]>([]);
  const supabase = createClient();

  const fetchServers = async () => {
    try {
      // 1. Fetch user banned server IDs
      const { data: banRows } = await supabase
        .from('server_bans')
        .select('server_id')
        .eq('user_id', currentUser.id);

      const bannedServerIds = new Set((banRows || []).map((b: any) => b.server_id));

      // 2. Fetch owned servers
      const { data: owned } = await supabase
        .from('servers')
        .select('*')
        .eq('owner_id', currentUser.id);

      // 3. Fetch joined member servers
      const { data: memberRows } = await supabase
        .from('server_members')
        .select('server_id, servers(*)')
        .eq('user_id', currentUser.id);

      const memberServers = (memberRows || []).map((m: any) => m.servers).filter(Boolean);

      const allMap = new Map<string, Server>();
      (owned || []).forEach((s: Server) => {
        if (!bannedServerIds.has(s.id)) allMap.set(s.id, s);
      });
      memberServers.forEach((s: Server) => {
        if (!bannedServerIds.has(s.id)) allMap.set(s.id, s);
      });

      setServers(Array.from(allMap.values()));
    } catch (err) {
      console.error('Fetch servers error:', err);
    }
  };

  useEffect(() => {
    fetchServers();

    const serverChannel = supabase
      .channel('public:servers_nav')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servers' },
        () => {
          fetchServers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'server_members' },
        () => {
          fetchServers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'server_bans' },
        () => {
          fetchServers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(serverChannel);
    };
  }, [currentUser.id, refreshKey, supabase]);

  const handleSelectServer = async (srvId: string | null) => {
    setActiveServer(srvId);

    if (!srvId) {
      setActiveChannel(null);
      if (onSelectDMHome) onSelectDMHome();
      return;
    }

    if (onSelectDMHome) onSelectDMHome();

    try {
      const { data: chans } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', srvId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (chans && chans.length > 0) {
        setActiveChannel(chans[0].id, chans[0].name);
      } else {
        setActiveChannel(`${srvId}-general`, 'general');
      }
    } catch (err) {
      console.error('Auto switch channel error:', err);
      setActiveChannel('general', 'general');
    }
  };

  return (
    <div className="w-16 h-full bg-[#0a0a0c] border-r border-zinc-800/60 flex flex-col items-center justify-between py-4 shrink-0 select-none z-30">
      
      {/* Top Section: Oit Logo & Server Icons List */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        
        {/* Oit Logo (DM & Landing Home Mode) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelectServer(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectServer(null);
            }
          }}
          aria-label="Oit Home & Landing Page"
          title="Oit Home & Landing Page"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all relative focus:outline-none focus:ring-2 focus:ring-[#FF5C00] ${
            activeServerId === null
              ? 'bg-[#FF5C00] border border-[#FF5C00] shadow-lg shadow-[#FF5C00]/30'
              : 'bg-[#121215] border border-zinc-800'
          }`}
        >
          <img
            src="/oit_logo.png"
            alt="Oit"
            loading="lazy"
            decoding="async"
            className="w-9 h-9 rounded-xl object-cover"
          />

          {/* Unread Message Notification Dot */}
          {hasUnreadMessages && activeServerId !== null && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF5C00] rounded-full border-2 border-[#0a0a0c] animate-pulse shadow-md" />
          )}
        </div>

        <div className="w-8 h-[1px] bg-zinc-800/80 my-1" />

        {/* Dynamic Server Icons List */}
        <div className="flex flex-col items-center gap-3 w-full max-h-[50vh] overflow-y-auto no-scrollbar">
          {servers.map((srv) => {
            const isSelected = activeServerId === srv.id;
            const initial = srv.name[0]?.toUpperCase() || 'S';

            return (
              <div
                key={srv.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectServer(srv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectServer(srv.id);
                  }
                }}
                aria-label={`Server: ${srv.name}`}
                title={srv.name}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer font-extrabold text-sm transition-all relative group focus:outline-none focus:ring-2 focus:ring-[#FF5C00] ${
                  isSelected
                    ? 'bg-[#FF5C00] text-white rounded-xl shadow-lg shadow-[#FF5C00]/30'
                    : 'bg-[#161619] text-zinc-300 hover:text-white hover:rounded-xl hover:bg-[#202025]'
                }`}
              >
                {srv.icon_url ? (
                  <img
                    src={srv.icon_url}
                    alt={srv.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{initial}</span>
                )}

                {/* Left Active Bar Indicator */}
                {isSelected && (
                  <div className="absolute -left-2 top-2 bottom-2 w-1 bg-[#FF5C00] rounded-r-full" />
                )}
              </div>
            );
          })}

          {/* Add Server Button + */}
          <button
            type="button"
            onClick={onOpenCreateServer}
            aria-label="Create a Server"
            title="Create a Server"
            className="w-11 h-11 rounded-full bg-[#161619] hover:bg-[#FF5C00] text-zinc-400 hover:text-white flex items-center justify-center transition-all shadow-md group shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <Plus className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
          </button>
        </div>

      </div>

      {/* Bottom Section: Settings & User Profile Avatar */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="User Settings"
          title="User Settings"
          className="w-11 h-11 text-zinc-500 hover:text-zinc-200 hover:bg-[#161619] rounded-2xl flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div
          role="button"
          tabIndex={0}
          onClick={onOpenProfile}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenProfile();
            }
          }}
          aria-label={`User Profile @${currentUser.username}`}
          title={`@${currentUser.username}`}
          className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#FF5C00] overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00] cursor-pointer hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
        >
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.username}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            currentUser.username[0]?.toUpperCase() || 'U'
          )}
        </div>
      </div>

    </div>
  );
}
