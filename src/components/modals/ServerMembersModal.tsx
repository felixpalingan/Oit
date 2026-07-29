'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Crown } from 'lucide-react';
import { User as UserType } from '@/types';
import { createClient } from '@/utils/supabase/client';

interface ServerMembersModalProps {
  serverId: string;
  serverName: string;
  onlineUserIds?: Set<string>;
  onClose: () => void;
  onOpenUserProfile?: (user: UserType) => void;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: UserType;
}

export default function ServerMembersModal({
  serverId,
  serverName,
  onlineUserIds = new Set(),
  onClose,
  onOpenUserProfile,
}: ServerMembersModalProps) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data: memberRows } = await supabase
          .from('server_members')
          .select('*')
          .eq('server_id', serverId);

        if (memberRows && memberRows.length > 0) {
          const userIds = memberRows.map((m: any) => m.user_id);
          const { data: usersData } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);

          const usersMap: Record<string, UserType> = {};
          (usersData || []).forEach((u: UserType) => {
            usersMap[u.id] = u;
          });

          const items: MemberItem[] = memberRows.map((m: any) => ({
            ...m,
            user: usersMap[m.user_id] || {
              id: m.user_id,
              username: 'Member',
              display_name: 'Member',
              avatar_url: null,
            },
          }));

          setMembers(items);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('Fetch server members error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [serverId, supabase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      <div className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 text-white relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-base font-black text-white truncate max-w-[240px]">
              Daftar Anggota — {serverName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
          {loading ? (
            <p className="text-xs text-zinc-500 text-center py-6">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">Tidak ada anggota terdaftar.</p>
          ) : (
            members.map((m) => {
              const isUserOnline = onlineUserIds.has(m.user_id);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (onOpenUserProfile) {
                      onOpenUserProfile(m.user);
                    }
                  }}
                  className="p-3 bg-[#1c1c21] border border-zinc-800/80 hover:border-[#FF5C00] rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00] group-hover:border-[#FF5C00] transition-colors">
                        {m.user.avatar_url ? (
                          <img src={m.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (m.user.username || 'U')[0]?.toUpperCase()
                        )}
                      </div>
                      <div
                        title={isUserOnline ? 'Online' : 'Offline'}
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1c1c21] transition-colors ${
                          isUserOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                        }`}
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#FF5C00] flex items-center gap-1.5 transition-colors">
                        <span>{m.user.display_name || m.user.username}</span>
                        {m.role === 'owner' && (
                          <span title="Server Owner">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>@{m.user.username}</span>
                        <span>•</span>
                        <span className={isUserOnline ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                          {isUserOnline ? 'Online' : 'Offline'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                      m.role === 'owner'
                        ? 'bg-amber-950/60 border border-amber-800 text-amber-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs"
          >
            Tutup
          </button>
        </div>

      </div>

    </div>
  );
}
