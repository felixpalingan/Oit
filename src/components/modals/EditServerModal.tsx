'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Upload, Trash2, Save, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';

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
  const [serverName, setServerName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      // Base64 Fallback
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      <div className="w-full max-w-lg bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-6 text-white relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-lg font-black text-white tracking-tight">
              Edit Server Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 font-semibold text-center">{errorMsg}</p>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
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
              className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Server</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#26262a] hover:bg-[#303036] text-zinc-200 font-extrabold rounded-2xl text-xs transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-[#FF5C00]/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Simpan...' : 'Simpan'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
