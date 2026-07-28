'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { X, QrCode, User, Save, Camera } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: (updated: UserProfile) => void;
}

export default function ProfileModal({ profile, onClose, onUpdate }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'qr'>('profile');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        onUpdate(data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Gagal mengupdate profil.');
    } finally {
      setSaving(false);
    }
  };

  const qrPayload = JSON.stringify({
    type: 'oit_user',
    username: profile.username,
    id: profile.id,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0f0f11] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-[#18181b] rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#ff6b00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Edit Profil
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-[#ff6b00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" /> QR Code Unik
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 rounded-full bg-zinc-800 border-2 border-[#ff6b00] overflow-hidden flex items-center justify-center shadow-lg shadow-orange-950/40">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#ff6b00]">
                    {profile.username[0]?.toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-[#ff6b00] font-mono mt-2">@{profile.username}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Bio Singkat
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan tentang Anda..."
                className="w-full px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                URL Foto Profil
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-orange flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl mt-6"
            >
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl shadow-orange-950/40 border-4 border-[#ff6b00]">
              <QRCodeSVG
                value={qrPayload}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">@{profile.username}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Minta teman Anda untuk meng-scan QR Code ini langsung di aplikasi Oit untuk berteman instan!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
