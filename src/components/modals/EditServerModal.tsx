'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Upload, Trash2, Save, Lock, ShieldCheck, History, User } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'settings' | 'audit_logs'>('settings');
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

  // Ticket 12: Fetch Audit Logs
  useEffect(() => {
    if (activeTab !== 'audit_logs') return;

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
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Pengaturan Server — {serverName}
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

        {/* Modal Navigation Tabs (Settings vs Audit Logs) */}
        <div className="flex p-1 bg-[#121215] rounded-2xl border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Detail Server</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_logs')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'audit_logs'
                ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Log Moderasi</span>
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-semibold text-center">{errorMsg}</p>
        )}

        {/* TAB 1: SERVER SETTINGS */}
        {activeTab === 'settings' ? (
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
          /* TAB 2: TICKET 12 AUDIT LOG DASHBOARD */
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C00] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
              RIWAYAT AUDIT MODERASI & AKTIVITAS SERVER
            </h4>

            <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {loadingLogs ? (
                <p className="text-xs text-zinc-500 text-center py-8">Memuat riwayat audit log...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Belum ada riwayat aktivitas moderasi tercatat.</p>
              ) : (
                auditLogs.map((log) => {
                  const actor = log.actor_profile;
                  const actorName = actor ? (actor.display_name || actor.username) : 'System';

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-[#1c1c21] border border-zinc-800/80 rounded-2xl flex items-start gap-3 text-xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#FF5C00] shrink-0 mt-0.5">
                        {actor?.avatar_url ? (
                          <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (actorName || 'S')[0].toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white truncate">{actorName}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-zinc-300 leading-relaxed font-normal">
                          {log.details || log.action_type}
                        </p>

                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#121215] border border-zinc-800 text-[9px] font-extrabold text-[#FF5C00]">
                          {log.action_type}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

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
        )}

      </div>
    </div>
  );
}
