'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Shield, ShieldAlert, MoreVertical, VolumeX, UserX, Ban } from 'lucide-react';
import { User as UserType } from '@/types';
import { createClient } from '@/utils/supabase/client';

interface ServerMembersSidebarProps {
  serverId: string;
  currentUser: UserType;
  onlineUserIds?: Set<string>;
  onOpenUserProfile?: (user: UserType) => void;
  refreshTrigger?: number;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  muted_until?: string | null;
  joined_at: string;
  user: UserType;
}

export default function ServerMembersSidebar({
  serverId,
  currentUser,
  onlineUserIds = new Set(),
  onOpenUserProfile,
  refreshTrigger = 0,
}: ServerMembersSidebarProps) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'moderator' | 'member'>('member');
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);

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

        // Sort: Owner first, Admin second, Moderator third, Member last
        items.sort((a, b) => (roleWeights[b.role] || 1) - (roleWeights[a.role] || 1));

        setMembers(items);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Fetch sidebar members error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel(`sidebar_members:${serverId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'server_members', filter: `server_id=eq.${serverId}` },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serverId, currentUser.id, refreshTrigger, supabase]);

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

  // Change Role Action
  const handleChangeRole = async (targetMember: MemberItem, newRole: 'admin' | 'moderator' | 'member') => {
    setActiveMenuMemberId(null);
    const myRoleTitle = currentUserRole === 'owner' ? 'Owner' : currentUserRole === 'admin' ? 'Admin' : 'Moderator';
    const targetName = targetMember.user.display_name || targetMember.user.username;

    try {
      await supabase
        .from('server_members')
        .update({ role: newRole })
        .eq('id', targetMember.id);

      await logAuditAction(
        'UPDATE_ROLE',
        targetMember.user_id,
        `${currentUser.display_name || currentUser.username} (${myRoleTitle}) changed ${targetName}'s role to ${newRole.toUpperCase()}`
      );
      fetchMembers();
    } catch (err) {
      console.error('Change role error:', err);
    }
  };

  // Mute 10 Mins Action
  const handleMute10Mins = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    const mutedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const myRoleTitle = currentUserRole === 'owner' ? 'Owner' : currentUserRole === 'admin' ? 'Admin' : 'Moderator';
    const targetName = targetMember.user.display_name || targetMember.user.username;

    try {
      await supabase
        .from('server_members')
        .update({ muted_until: mutedUntil })
        .eq('id', targetMember.id);

      await logAuditAction(
        'MUTE_MEMBER',
        targetMember.user_id,
        `${currentUser.display_name || currentUser.username} (${myRoleTitle}) muted ${targetName} for 10 minutes`
      );
      fetchMembers();
    } catch (err) {
      console.error('Mute member error:', err);
    }
  };

  // Kick Member Action
  const handleKickMember = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    const targetName = targetMember.user.display_name || targetMember.user.username;
    if (!confirm(`Apakah Anda yakin ingin mengeluarkan (KICK) @${targetMember.user.username} dari server?`)) return;

    const myRoleTitle = currentUserRole === 'owner' ? 'Owner' : currentUserRole === 'admin' ? 'Admin' : 'Moderator';

    try {
      await supabase
        .from('server_members')
        .delete()
        .eq('id', targetMember.id);

      await logAuditAction(
        'KICK_MEMBER',
        targetMember.user_id,
        `${currentUser.display_name || currentUser.username} (${myRoleTitle}) kicked ${targetName} from the server`
      );
      fetchMembers();
    } catch (err) {
      console.error('Kick member error:', err);
    }
  };

  // Ban Member Action
  const handleBanMember = async (targetMember: MemberItem) => {
    setActiveMenuMemberId(null);
    const targetName = targetMember.user.display_name || targetMember.user.username;
    if (!confirm(`Apakah Anda yakin ingin melarang (BAN) @${targetMember.user.username} dari server secara permanen?`)) return;

    const myRoleTitle = currentUserRole === 'owner' ? 'Owner' : currentUserRole === 'admin' ? 'Admin' : 'Moderator';

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

      await logAuditAction(
        'BAN_MEMBER',
        targetMember.user_id,
        `${currentUser.display_name || currentUser.username} (${myRoleTitle}) banned ${targetName}`
      );
      fetchMembers();
    } catch (err) {
      console.error('Ban member error:', err);
    }
  };

  const myWeight = roleWeights[currentUserRole] || 1;

  return (
    <div className="w-60 md:w-64 h-full bg-[#161619] border-l border-zinc-800/80 hidden lg:flex flex-col shrink-0 select-none z-20 overflow-hidden">
      
      {/* Header Bar matching Image 5: MEMBERS — 12 */}
      <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
          MEMBERS — {members.length}
        </h4>
      </div>

      {/* Members List Stream */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
        {loading ? (
          <p className="text-xs text-zinc-500 text-center py-6">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Tidak ada anggota.</p>
        ) : (
          members.map((m) => {
            const isUserOnline = onlineUserIds.has(m.user_id);
            const targetWeight = roleWeights[m.role] || 1;
            const canModerate = myWeight > targetWeight && m.user_id !== currentUser.id;
            const isMuted = m.muted_until ? new Date(m.muted_until).getTime() > Date.now() : false;

            return (
              <div
                key={m.id}
                className="p-2.5 hover:bg-[#1c1c21] rounded-2xl flex items-center justify-between relative group transition-all"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenUserProfile && onOpenUserProfile(m.user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenUserProfile && onOpenUserProfile(m.user);
                    }
                  }}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#FF5C00] rounded-xl p-1"
                >
                  {/* User Avatar Circle */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00] group-hover:border-[#FF5C00] transition-colors">
                      {m.user.avatar_url ? (
                        <img
                          src={m.user.avatar_url}
                          alt={m.user.display_name || m.user.username}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (m.user.username || 'U')[0]?.toUpperCase()
                      )}
                    </div>
                    <div
                      title={isUserOnline ? 'Online' : 'Offline'}
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161619] transition-colors ${
                        isUserOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    />
                  </div>

                  {/* User Name + Role Icon matching Image 5 */}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                        {m.user.display_name || m.user.username}
                      </span>
                      {m.role === 'owner' && <span title="Owner"><Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /></span>}
                      {m.role === 'admin' && <span title="Admin"><Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>}
                      {m.role === 'moderator' && <span title="Moderator"><ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0" /></span>}
                    </div>

                    {isMuted && (
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-wide block">
                        (BUNGKAM)
                      </span>
                    )}
                  </div>
                </div>

                {/* Moderation Context Menu Trigger */}
                {canModerate && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuMemberId(activeMenuMemberId === m.id ? null : m.id);
                      }}
                      aria-label={`Aksi Moderasi untuk @${m.user.username}`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-all cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Moderation Action Dropdown */}
                    {activeMenuMemberId === m.id && (
                      <div className="absolute right-0 top-7 w-44 bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-40 space-y-1 animate-in zoom-in-95 duration-100">
                        <div className="px-2 py-1 text-[9px] font-extrabold text-[#FF5C00] uppercase tracking-wider">
                          Aksi Moderasi
                        </div>

                        {currentUserRole === 'owner' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleChangeRole(m, 'admin')}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>Jadikan Admin</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChangeRole(m, 'moderator')}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-purple-400 hover:bg-purple-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Jadikan Moderator</span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleMute10Mins(m)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Mute 10 Menit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleKickMember(m)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-orange-400 hover:bg-orange-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Kick Member</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBanMember(m)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Ban Permanen</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
