'use client';

import React, { useState } from 'react';
import { X, Edit2, Trash2, Hash, Volume2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setLoading(true);
    const cleanName = channelName.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      await supabase
        .from('channels')
        .update({ name: cleanName })
        .eq('id', channel.id);

      onUpdated(cleanName);
      onClose();
    } catch (err: any) {
      console.warn('Update channel error:', err);
      onUpdated(cleanName);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus channel #${channel.name}?`)) return;

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
