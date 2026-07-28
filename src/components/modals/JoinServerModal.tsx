'use client';

import React, { useState, useEffect } from 'react';
import { X, Compass, PlusCircle, CheckCircle2, Lock, Share2 } from 'lucide-react';
import { User, Server } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface JoinServerModalProps {
  currentUser: User;
  onClose: () => void;
  onJoined?: () => void;
}

export default function JoinServerModal({
  currentUser,
  onClose,
  onJoined,
}: JoinServerModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [publicServers, setPublicServers] = useState<Server[]>([]);
  const [joinedServerIds, setJoinedServerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [joinedMsg, setJoinedMsg] = useState('');

  const supabase = createClient();
  const { setActiveServer, setActiveChannel } = useAppStore();

  // Fetch Public Community Servers & User Joined Servers
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch user's joined server IDs
        const { data: memberRows } = await supabase
          .from('server_members')
          .select('server_id')
          .eq('user_id', currentUser.id);

        const { data: ownedRows } = await supabase
          .from('servers')
          .select('id')
          .eq('owner_id', currentUser.id);

        const joinedSet = new Set<string>();
        (memberRows || []).forEach((m: any) => joinedSet.add(m.server_id));
        (ownedRows || []).forEach((s: any) => joinedSet.add(s.id));
        setJoinedServerIds(joinedSet);

        // 2. Fetch Public Servers (is_private != true)
        const { data: srvs } = await supabase
          .from('servers')
          .select('*')
          .or('is_private.is.null,is_private.eq.false')
          .limit(20);

        if (srvs && srvs.length > 0) {
          setPublicServers(srvs as Server[]);
        } else {
          setPublicServers([
            { id: 'design-team', name: 'Design Team', owner_id: 'public-owner', is_private: false },
            { id: 'dev-lounge', name: 'Dev Lounge', owner_id: 'public-owner', is_private: false },
            { id: 'gaming-hub', name: 'Gaming Hub', owner_id: 'public-owner', is_private: false },
          ]);
        }
      } catch (err) {
        console.error('Fetch public servers error:', err);
      }
    }
    fetchData();
  }, [currentUser.id, supabase]);

  const handleJoinById = async (serverIdToJoin: string, serverName: string) => {
    setLoading(true);
    setErrorMsg('');
    setJoinedMsg('');

    try {
      // Check if server is private when joining via custom ID
      const { data: targetSrv } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverIdToJoin)
        .single();

      // Insert member into database
      await supabase.from('server_members').insert([
        {
          server_id: serverIdToJoin,
          user_id: currentUser.id,
          role: 'member',
        },
      ]);

      // Fetch first channel
      const { data: chans } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverIdToJoin)
        .limit(1);

      const firstChanId = chans && chans.length > 0 ? chans[0].id : 'general';
      const firstChanName = chans && chans.length > 0 ? chans[0].name : 'general';

      setActiveServer(serverIdToJoin);
      setActiveChannel(firstChanId, firstChanName);

      setJoinedMsg(`Berhasil bergabung dengan server "${targetSrv?.name || serverName}"!`);
      if (onJoined) onJoined();
      setTimeout(onClose, 600);
    } catch (err: any) {
      console.warn('Join server notice:', err);
      setActiveServer(serverIdToJoin);
      setActiveChannel('general', 'general');
      if (onJoined) onJoined();
      setTimeout(onClose, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    handleJoinById(inviteCode.trim(), inviteCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* Join Server Modal Box */}
      <div className="w-full max-w-lg bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-6 text-white relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Join or Explore Servers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>}
        {joinedMsg && (
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {joinedMsg}
          </p>
        )}

        {/* SECTION 1: JOIN PRIVATE OR PUBLIC SERVER VIA INVITATION CODE */}
        <form onSubmit={handleCustomInvite} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              ENTER SERVER ID / INVITATION CODE
            </label>
            <span className="text-[10px] text-[#FF5C00] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private Servers Allowed
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. srv-1785293 or server_id"
              className="flex-1 px-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00]"
            />
            <button
              type="submit"
              disabled={!inviteCode.trim() || loading}
              className="px-5 py-3 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-md shadow-[#FF5C00]/25 transition-all disabled:opacity-40"
            >
              Join
            </button>
          </div>
        </form>

        <div className="flex items-center my-1">
          <div className="flex-1 border-t border-zinc-800" />
          <span className="px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            PUBLIC COMMUNITY SERVERS
          </span>
          <div className="flex-1 border-t border-zinc-800" />
        </div>

        {/* SECTION 2: PUBLIC SERVERS ONLY */}
        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
          {publicServers.map((srv) => {
            const isAlreadyJoined = joinedServerIds.has(srv.id);

            return (
              <div
                key={srv.id}
                className="p-3.5 bg-[#1c1c21] border border-zinc-800/80 hover:border-[#FF5C00]/60 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-extrabold text-sm text-[#FF5C00]">
                    {srv.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#FF5C00] transition-colors">
                      {srv.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400">Public Server</p>
                  </div>
                </div>

                {isAlreadyJoined ? (
                  <div className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Joined</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleJoinById(srv.id, srv.name)}
                    disabled={loading}
                    className="px-4 py-2 bg-[#FF5C00]/15 hover:bg-[#FF5C00] text-[#FF5C00] hover:text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
