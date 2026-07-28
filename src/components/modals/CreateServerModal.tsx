'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Hash, Volume2, Lock, Image as ImageIcon } from 'lucide-react';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface CreateServerModalProps {
  currentUser: User;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateServerModal({
  currentUser,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const [serverName, setServerName] = useState("Alex's Server");
  const [channelName, setChannelName] = useState('general');
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [isPrivate, setIsPrivate] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { setActiveServer, setActiveChannel } = useAppStore();

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `server_icons/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;

    setLoading(true);
    setErrorMsg('');

    const cleanChanName = channelName.trim().toLowerCase().replace(/\s+/g, '-') || 'general';
    const fallbackServerId = `srv-${Date.now()}`;
    const fallbackChannelId = `chan-${Date.now()}`;

    try {
      // 1. Insert into servers table with icon_url and is_private flag
      const { data: newServer } = await supabase
        .from('servers')
        .insert([
          {
            name: serverName.trim(),
            icon_url: iconUrl,
            owner_id: currentUser.id,
            is_private: isPrivate,
          },
        ])
        .select()
        .single();

      const createdServerId = newServer?.id || fallbackServerId;

      if (newServer) {
        // 2. Insert into server_members table
        await supabase.from('server_members').insert([
          {
            server_id: newServer.id,
            user_id: currentUser.id,
            role: 'owner',
          },
        ]);
      }

      // 3. Insert initial channel into channels table
      const { data: newChannel } = await supabase
        .from('channels')
        .insert([
          {
            server_id: createdServerId,
            name: cleanChanName,
            type: channelType,
            is_private: isPrivate,
          },
        ])
        .select()
        .single();

      const createdChannelId = newChannel?.id || fallbackChannelId;
      const createdChannelName = newChannel?.name || cleanChanName;

      // 4. Update Zustand state immediately
      setActiveServer(createdServerId);
      setActiveChannel(createdChannelId, createdChannelName);

      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      console.warn('Supabase create server notice:', err);
      setActiveServer(fallbackServerId);
      setActiveChannel(fallbackChannelId, cleanChanName);
      if (onCreated) onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* Create Server Container */}
      <div className="w-full max-w-lg bg-[#161619] border border-zinc-800 rounded-3xl p-7 shadow-2xl flex flex-col space-y-6 text-white relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <h3 className="text-lg font-black text-white tracking-tight">
            Create a Server
          </h3>
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

        <p className="text-xs text-zinc-400 text-center leading-relaxed">
          Your server is where you and your friends hang out. Make yours and start talking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
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

          {/* Server Name */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              SERVER NAME
            </label>
            <input
              type="text"
              required
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
            <p className="text-[10px] text-zinc-500 mt-1.5">
              By creating a server, you agree to Oit's Community Guidelines.
            </p>
          </div>

          {/* Initial Channel Section */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-4">
            <h4 className="text-xs font-black text-white tracking-wide">
              Initial Channel
            </h4>

            {/* Channel Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setChannelType('text')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  channelType === 'text'
                    ? 'bg-[#FF5C00]/10 border-[#FF5C00] text-white shadow-md'
                    : 'bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hash className={`w-5 h-5 ${channelType === 'text' ? 'text-[#FF5C00]' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold text-white">Text Channel</span>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed">
                  Post messages, images, links, and emojis.
                </p>
              </div>

              <div
                onClick={() => setChannelType('voice')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  channelType === 'voice'
                    ? 'bg-[#FF5C00]/10 border-[#FF5C00] text-white shadow-md'
                    : 'bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Volume2 className={`w-5 h-5 ${channelType === 'voice' ? 'text-[#FF5C00]' : 'text-zinc-400'}`} />
                  <span className="text-xs font-bold text-white">Voice Channel</span>
                </div>
                <p className="text-[10px] opacity-80 leading-relaxed">
                  Hang out together with voice, video, and screen share.
                </p>
              </div>
            </div>

            {/* Channel Name Input */}
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
                  className="w-full pl-8 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
                />
              </div>
            </div>

            {/* Private Server & Channel Toggle */}
            <div className="p-4 bg-[#1c1c21] border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#FF5C00]" />
                <div>
                  <h5 className="text-xs font-bold text-white">Private Server & Channel</h5>
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

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-zinc-400 hover:text-white px-4 py-2.5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-[#FF5C00]/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Server...' : 'Create Server'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
