'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Crown, Shield, ShieldAlert, VolumeX, UserX, Ban, MoreVertical, Check } from 'lucide-react';
import { User as UserType } from '@/types';
import { createClient } from '@/utils/supabase/client';

interface ServerMembersModalProps {
  serverId: string;
  serverName: string;
  currentUser: UserType;
  onlineUserIds?: Set<string>;
  onClose: () => void;
  onOpenUserProfile?: (user: UserType) => void;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  muted_until?: string | null;
  joined_at: string;
  user: UserType;
}

export default function ServerMembersModal({
  serverId,
  serverName,
  currentUser,
  onlineUserIds = new Set(),
  onClose,
  onOpenUserProfile,
}: ServerMembersModalProps) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'moderator' | 'member'>('member');
  
  const supabase = createClient();

  const roleWeights: Record<string, number> = {
    owner: 4,
    admin: 3,
    moderator: 2,
    member: 1,
  };

  const fetchMembers = async () => {
    try {
      const { data: memberRows } = await supabase
        .from('server_members')
        .select('*')
        .eq('server_id', serverId);

      if (memberRows && memberRows.length > 0) {
        const myRow = memberRows.find((m: any) => m.user_id === currentUser.id);
        if (myRow) {
          setCurrentUserRole(myRow.role as any);
        }

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
  };

  useEffect(() => {
    fetchMembers();
  }, [serverId, currentUser.id, supabase]);

  // Helper: Log Action to Audit Logs Table
  const logAuditAction = async (actionType: string, targetId: string, details: string) => {
    try {
      await supabase.from('audit_logs').insert({
        server_id: serverId,
        actor_id: currentUser.id,
        action_type: actionType,
        target_id: targetId,
        details,
      });
    } catch (err) {
      console.warn('Audit log write error:', err);
    }
  };

  // Ticket 10: Change Role Action
  const handleChangeRole = async (targetMember: MemberItem, newRole: 'admin' | 'moderator' | 'member') => {
    setActiveMenuMemberId(null);
    try {
      await supabase
        .from('server_members')
        .update({ role: newRole })
        .eq('id', targetMember.id);

      await logAuditAction('UPDATE_ROLE', targetMember.user_id, `Mengubah role @${targetMember.user.username} menjadi ${newRole.toUpperCase()}`);
      fetchMembers();
    } catch (err) {
      console.error('Change role error:', err);
    }
  };

  // Ticket 11: Mute 10 Mins Action
  const handleMute10Mins = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    const mutedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    try {
      await supabase
        .from('server_members')
        .update({ muted_until: mutedUntil })
        .eq('id', targetMember.id);

      await logAuditAction('MUTE_MEMBER', targetMember.user_id, `Bungkam sementara @${targetMember.user.username} selama 10 menit.`);
      fetchMembers();
    } catch (err) {
      console.error('Mute member error:', err);
    }
  };

  // Ticket 11: Kick Member Action
  const handleKickMember = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    if (!confirm(`Apakah Anda yakin ingin mengeluarkn (KICK) @${targetMember.user.username} dari server?`)) return;

    try {
      await supabase
        .from('server_members')
        .delete()
        .eq('id', targetMember.id);

      await logAuditAction('KICK_MEMBER', targetMember.user_id, `Mengeluarkan (KICK) @${targetMember.user.username} dari server.`);
      fetchMembers();
    } catch (err) {
      console.error('Kick member error:', err);
    }
  };

  // Ticket 11: Ban Member Action
  const handleBanMember = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    if (!confirm(`Apakah Anda yakin ingin melarang (BAN) @${targetMember.user.username} dari server secara permanen?`)) return;

    try {
      await supabase.from('server_bans').insert({
        server_id: serverId,
        user_id: targetMember.user_id,
        banned_by: currentUser.id,
        reason: 'Pelanggaran aturan moderasi server',
      });

      await supabase
        .from('server_members')
        .delete()
        .eq('id', targetMember.id);

      await logAuditAction('BAN_MEMBER', targetMember.user_id, `Melarang (BAN) @${targetMember.user.username} dari server.`);
      fetchMembers();
    } catch (err) {
      console.error('Ban member error:', err);
    }
  };

  const myWeight = roleWeights[currentUserRole] || 1;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 text-white relative z-10"
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-base font-black text-white truncate max-w-[240px]">
              Daftar Anggota — {serverName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar relative">
          {loading ? (
            <p className="text-xs text-zinc-500 text-center py-6">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">Tidak ada anggota terdaftar.</p>
          ) : (
            members.map((m) => {
              const isUserOnline = onlineUserIds.has(m.user_id);
              const targetWeight = roleWeights[m.role] || 1;
              const canModerate = myWeight > targetWeight && m.user_id !== currentUser.id;
              const isMuted = m.muted_until ? new Date(m.muted_until).getTime() > Date.now() : false;

              return (
                <div
                  key={m.id}
                  className="p-3 bg-[#1c1c21] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl flex items-center justify-between relative transition-all group"
                >
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(m.user)}
                    className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden"
                  >
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

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#FF5C00] flex items-center gap-1.5 transition-colors truncate">
                        <span className="truncate">{m.user.display_name || m.user.username}</span>
                        {m.role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {m.role === 'admin' && <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {m.role === 'moderator' && <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>@{m.user.username}</span>
                        {isMuted && <span className="text-red-400 font-bold ml-1">(Bungkam)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role Badge */}
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        m.role === 'owner'
                          ? 'bg-amber-950/70 border border-amber-800 text-amber-400'
                          : m.role === 'admin'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                          : m.role === 'moderator'
                          ? 'bg-purple-950/70 border border-purple-800 text-purple-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {m.role}
                    </span>

                    {/* Moderation Context Menu Trigger */}
                    {canModerate && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuMemberId(activeMenuMemberId === m.id ? null : m.id);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Moderation Action Dropdown */}
                        {activeMenuMemberId === m.id && (
                          <div className="absolute right-0 top-8 w-44 bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 animate-in zoom-in-95 duration-100">
                            
                            <div className="px-2 py-1 text-[9px] font-extrabold text-[#FF5C00] uppercase tracking-wider">
                              Aksi Moderasi
                            </div>

                            {/* Ubah Role Options */}
                            {currentUserRole === 'owner' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleChangeRole(m, 'admin')}
                                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-950/40 rounded-xl flex items-center gap-2"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>Jadikan Admin</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleChangeRole(m, 'moderator')}
                                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-purple-400 hover:bg-purple-950/40 rounded-xl flex items-center gap-2"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>Jadikan Moderator</span>
                                </button>
                              </>
                            )}

                            {/* Mute 10 Mins */}
                            <button
                              type="button"
                              onClick={() => handleMute10Mins(m)}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-950/40 rounded-xl flex items-center gap-2"
                            >
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Mute 10 Menit</span>
                            </button>

                            {/* Kick Member */}
                            <button
                              type="button"
                              onClick={() => handleKickMember(m)}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-orange-400 hover:bg-orange-950/40 rounded-xl flex items-center gap-2"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Kick Member</span>
                            </button>

                            {/* Ban Member */}
                            <button
                              type="button"
                              onClick={() => handleBanMember(m)}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-950/40 rounded-xl flex items-center gap-2"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ban Permanen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
