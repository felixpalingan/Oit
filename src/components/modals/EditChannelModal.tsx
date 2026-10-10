'use client';

import React, { useState } from 'react';
import { X, Edit2, Trash2, Hash, Volume2, Lock, Key } from 'lucide-react';
import { Channel } from '@/types';
import { createClient } from '@/utils/supabase/client';

interface EditChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onUpdated: (updatedName: string) => void;
  onDeleted: () => void;
}

export default function EditChannelModal({
  channel,
  onClose,
  onUpdated,
  onDeleted,
}: EditChannelModalProps) {
  const [channelName, setChannelName] = useState(channel.name);
  const [isPrivate, setIsPrivate] = useState(Boolean(channel.is_private));
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    if (isPrivate && !channel.is_private && !newPassword.trim()) {
      setErrorMsg('Password wajib diisi jika channel diubah menjadi Private.');
      return;
    }

    if (isPrivate && newPassword.trim() && newPassword.trim().length < 3) {
      setErrorMsg('Password channel minimal 3 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const cleanName = channelName.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const updatePayload: Record<string, any> = {
        name: cleanName,
        is_private: isPrivate,
      };

      if (isPrivate && newPassword.trim()) {
        updatePayload.password = newPassword.trim();
      } else if (!isPrivate) {
        updatePayload.password = null;
      }

      const { error } = await supabase
        .from('channels')
        .update(updatePayload)
        .eq('id', channel.id);

      if (error) throw error;

      onUpdated(cleanName);
      onClose();
    } catch (err: any) {
      console.warn('Update channel error:', err);
      setErrorMsg(err.message || 'Failed to update channel.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete channel #${channel.name}?`)) return;

    setLoading(true);
    try {
      await supabase.from('channels').delete().eq('id', channel.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      console.warn('Delete channel error:', err);
      onDeleted();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* Edit Channel Modal Box */}
      <div className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-5 text-white relative">
        
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            {channel.type === 'voice' ? <Volume2 className="w-5 h-5 text-[#FF5C00]" /> : <Hash className="w-5 h-5 text-[#FF5C00]" />}
            <h3 className="text-lg font-black text-white tracking-tight">
              Edit Channel Overview
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

        <form onSubmit={handleUpdate} className="space-y-4">
          
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              CHANNEL NAME
            </label>
            <div className="relative">
              <span className="text-zinc-500 absolute left-4 top-3 text-xs font-bold">#</span>
              <input
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors"
              />
            </div>
          </div>

          {/* Toggle Private Password Channel */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#1c1c21] border border-zinc-800/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-[#FF5C00]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Private Password Channel</h5>
                  <p className="text-[10px] text-zinc-400">Require password to enter this channel</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5C00]"></div>
              </label>
            </div>

            {isPrivate && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {channel.is_private ? 'CHANGE PASSWORD (OPTIONAL)' : 'SET CHANNEL PASSWORD'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={channel.is_private ? 'Leave blank to keep existing password' : 'Enter new password'}
                    className="w-full pl-11 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="py-2.5 px-4 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Channel</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#FF5C00]/25 transition-all disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
