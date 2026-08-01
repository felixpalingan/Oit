'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Upload, Trash2, Save, Lock, ShieldAlert, Edit, Clock, Filter } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { AuditLog, User as UserType } from '@/types';

interface EditServerModalProps {
  serverId: string;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function EditServerModal({
  serverId,
  onClose,
  onUpdated,
  onDeleted,
}: EditServerModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'audit_log'>('general');
  const [serverName, setServerName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Ticket 12 Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { setActiveServer, setActiveChannel } = useAppStore();

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    async function fetchServerDetails() {
      try {
        const { data: srv } = await supabase
          .from('servers')
          .select('*')
          .eq('id', serverId)
          .single();

        if (srv) {
          setServerName(srv.name || '');
          setIconUrl(srv.icon_url || null);
          setIsPrivate(srv.is_private || false);
        }
      } catch (err) {
        console.error('Fetch server details error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServerDetails();
  }, [serverId, supabase]);

  // Ticket 12: Fetch & Realtime Listen Audit Logs
  useEffect(() => {
    if (activeTab !== 'audit_log') return;

    async function fetchAuditLogs() {
      setLoadingLogs(true);
      try {
        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('server_id', serverId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (logsData && logsData.length > 0) {
          const actorIds = Array.from(new Set(logsData.map((l: any) => l.actor_id).filter(Boolean)));
          const { data: actors } = await supabase
            .from('users')
            .select('*')
            .in('id', actorIds);

          const actorsMap: Record<string, UserType> = {};
          (actors || []).forEach((a: UserType) => {
            actorsMap[a.id] = a;
          });

          const items: AuditLog[] = logsData.map((l: any) => ({
            ...l,
            actor_profile: actorsMap[l.actor_id],
          }));

          setAuditLogs(items);
        } else {
          setAuditLogs([]);
        }
      } catch (err) {
        console.error('Fetch audit logs error:', err);
      } finally {
        setLoadingLogs(false);
      }
    }

    fetchAuditLogs();

    // REALTIME LISTEN TO NEW AUDIT LOGS
    const channel = supabase
      .channel(`realtime_audit:${serverId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `server_id=eq.${serverId}` },
        async (payload) => {
          const newLog = payload.new as AuditLog;
          const { data: actor } = await supabase
            .from('users')
            .select('*')
            .eq('id', newLog.actor_id)
            .single();

          setAuditLogs((prev) => [
            {
              ...newLog,
              actor_profile: actor || undefined,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, serverId, supabase]);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `server_icons/${serverId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
        if (data?.publicUrl) {
          setIconUrl(data.publicUrl);
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = () => setIconUrl(reader.result as string);
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Server icon upload error:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;

    setSaving(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('servers')
        .update({
          name: serverName.trim(),
          icon_url: iconUrl,
          is_private: isPrivate,
        })
        .eq('id', serverId);

      if (error) throw error;

      if (onUpdated) onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Update server error:', err);
      setErrorMsg(err.message || 'Gagal mengubah detail server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus server "${serverName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setSaving(true);
    try {
      await supabase.from('servers').delete().eq('id', serverId);
      setActiveServer(null);
      setActiveChannel(null);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Delete server error:', err);
      setErrorMsg('Gagal menghapus server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#161619] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col space-y-5 text-white relative z-10"
      >
        
        {/* Top Header matching Image 4 */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            Server Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Underlined Tabs matching Image 4 */}
        <div className="flex items-center gap-6 border-b border-zinc-800/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`text-xs font-black uppercase tracking-wider transition-all relative pb-2 ${
              activeTab === 'general'
                ? 'text-[#FF5C00]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>GENERAL</span>
            {activeTab === 'general' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5C00] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_log')}
            className={`text-xs font-black uppercase tracking-wider transition-all relative pb-2 ${
              activeTab === 'audit_log'
                ? 'text-[#FF5C00]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>AUDIT LOG</span>
            {activeTab === 'audit_log' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5C00] rounded-full" />
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-semibold text-center">{errorMsg}</p>
        )}

        {/* TAB 1: GENERAL SERVER SETTINGS */}
        {activeTab === 'general' ? (
          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Upload Server Icon Area */}
            <div className="flex justify-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleIconUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 bg-[#1c1c21] border-2 border-dashed border-zinc-700 hover:border-[#FF5C00] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden"
              >
                {iconUrl ? (
                  <>
                    <img src={iconUrl} alt="Server Icon" className="w-full h-full object-cover rounded-2xl" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                      Change Icon
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#FF5C00] mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white">
                      UPLOAD ICON
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Server Name Input */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                SERVER NAME
              </label>
              <input
                type="text"
                required
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
            </div>

            {/* Private Server Toggle */}
            <div className="p-4 bg-[#1c1c21] border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#FF5C00]" />
                <div>
                  <h5 className="text-xs font-bold text-white">Private Server</h5>
                  <p className="text-[10px] text-zinc-400">
                    Hide from public discovery. Require Invite Code to join.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-[#FF5C00] cursor-pointer"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleDeleteServer}
                className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Server</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#26262a] hover:bg-[#303036] text-zinc-200 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-[#FF5C00]/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Simpan...' : 'Simpan'}</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* TAB 2: AUDIT LOG DASHBOARD matching Image 4 EXACTLY */
          <div className="space-y-4">
            
            {/* Title & Filter Bar matching Image 4 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Audit Log
                </h4>
                <p className="text-[11px] text-zinc-400">
                  A chronological record of all administrative actions.
                </p>
              </div>

              <button
                type="button"
                className="px-3 py-1.5 bg-[#1c1c21] hover:bg-[#25252b] border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span>Filter</span>
              </button>
            </div>

            {/* Audit Log Card List matching Image 4 */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {loadingLogs ? (
                <p className="text-xs text-zinc-500 text-center py-8">Loading audit logs...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">No administrative audit records found.</p>
              ) : (
                auditLogs.map((log) => {
                  const isBan = log.action_type === 'BAN_MEMBER' || log.action_type === 'KICK_MEMBER';
                  const isMute = log.action_type === 'MUTE_MEMBER';

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 bg-[#1c1c21] border border-zinc-800/90 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        {/* Circular Icon Container matching Image 4 */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isBan
                              ? 'bg-[#FF5C00]/20 text-[#FF5C00]'
                              : isMute
                              ? 'bg-amber-950/60 text-amber-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {isBan ? (
                            <ShieldAlert className="w-4 h-4" />
                          ) : isMute ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white leading-tight">
                            {log.details || log.action_type}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Done Button matching Image 4 */}
            <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#24242a] hover:bg-[#303038] text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
