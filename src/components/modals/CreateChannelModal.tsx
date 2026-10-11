'use client';

import React, { useState } from 'react';
import { X, Hash, Volume2, Lock, Key } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { Channel } from '@/types';
import { useModalA11y } from '@/hooks/useModalA11y';

interface CreateChannelModalProps {
  serverId: string;
  onClose: () => void;
  onChannelCreated: (channel: Channel) => void;
}

export default function CreateChannelModal({
  serverId,
  onClose,
  onChannelCreated,
}: CreateChannelModalProps) {
  useModalA11y(true, onClose);

  const [channelName, setChannelName] = useState('new-channel');
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();
  const { setActiveChannel } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    if (isPrivate && !password.trim()) {
      setErrorMsg('Password is required for private channels.');
      return;
    }

    if (isPrivate && password.trim().length < 3) {
      setErrorMsg('Channel password must be at least 3 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const cleanName = channelName.trim().toLowerCase().replace(/\s+/g, '-');
    const fallbackChannelId = `chan-${Date.now()}`;

    try {
      const payload = {
        server_id: serverId,
        name: cleanName,
        type: channelType,
        is_private: isPrivate,
        password: isPrivate && password.trim() ? password.trim() : null,
      };

      const { data, error } = await supabase
        .from('channels')
        .insert([payload])
        .select('id, server_id, name, type, is_private, created_at')
        .single();

      if (error) throw error;

      const createdChannel: Channel = {
        id: data.id,
        server_id: data.server_id,
        name: data.name,
        type: data.type as 'text' | 'voice',
        is_private: data.is_private,
      };

      setActiveChannel(createdChannel.id, createdChannel.name);
      onChannelCreated(createdChannel);
      onClose();
    } catch (err: any) {
      console.warn('Supabase create channel error:', err);
      setErrorMsg(err.message || 'Failed to create channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* Create Channel Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-channel-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-5 text-white relative"
      >
        
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <h3 id="create-channel-title" className="text-lg font-black text-white tracking-tight">
            Create Channel
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <p role="alert" className="text-xs text-red-400 font-semibold">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Channel Type Selector */}
          <div role="radiogroup" aria-label="Channel Type" className="grid grid-cols-2 gap-3">
            <div
              role="radio"
              aria-checked={channelType === 'text'}
              tabIndex={0}
              onClick={() => setChannelType('text')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setChannelType('text');
                }
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none ${
                channelType === 'text'
                  ? 'bg-[#FF5C00]/10 border-[#FF5C00] text-white shadow-md'
                  : 'bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Hash className={`w-4 h-4 ${channelType === 'text' ? 'text-[#FF5C00]' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold text-white">Text Channel</span>
              </div>
              <p className="text-[10px] opacity-80 leading-relaxed">
                Post text, media, and files.
              </p>
            </div>

            <div
              role="radio"
              aria-checked={channelType === 'voice'}
              tabIndex={0}
              onClick={() => setChannelType('voice')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setChannelType('voice');
                }
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none ${
                channelType === 'voice'
                  ? 'bg-[#FF5C00]/10 border-[#FF5C00] text-white shadow-md'
                  : 'bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className={`w-4 h-4 ${channelType === 'voice' ? 'text-[#FF5C00]' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold text-white">Voice Channel</span>
              </div>
              <p className="text-[10px] opacity-80 leading-relaxed">
                Live WebRTC audio & video.
              </p>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label htmlFor="create-channel-name-input" className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              CHANNEL NAME
            </label>
            <div className="relative">
              <span className="text-zinc-500 absolute left-4 top-3 text-xs font-bold" aria-hidden="true">#</span>
              <input
                id="create-channel-name-input"
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="new-channel"
                className="w-full pl-8 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus-visible:ring-2 focus-visible:ring-[#FF5C00] transition-colors"
              />
            </div>
          </div>

          {/* Private Channel Toggle */}
          <div className="p-4 bg-[#1c1c21] border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="create-channel-private-toggle" className="flex items-center gap-2.5 cursor-pointer flex-1 mr-3">
                <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-white">Private Password Channel</h5>
                  <p className="text-[10px] text-zinc-400">
                    Require a password to enter this channel.
                  </p>
                </div>
              </label>
              <input
                id="create-channel-private-toggle"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-[#FF5C00] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
              />
            </div>

            {isPrivate && (
              <div className="relative pt-1 animate-in fade-in duration-150">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-5 pointer-events-none" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set channel password"
                  aria-label="Set channel password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus-visible:ring-2 focus-visible:ring-[#FF5C00]"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-zinc-400 hover:text-white px-4 py-2 rounded-xl focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-[#FF5C00]/25 transition-all disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5C00] outline-none"
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
