'use client';

import React, { useState } from 'react';
import { Friend, UserProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { X, Users, Plus, Check } from 'lucide-react';

interface CreateGroupModalProps {
  currentProfile: UserProfile;
  friends: Friend[];
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({
  currentProfile,
  friends,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const supabase = createClient();

  const toggleSelectFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriendIds.length === 0) return;

    setCreating(true);
    try {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          type: 'group',
          name: groupName.trim(),
          created_by: currentProfile.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      if (room) {
        // Add creator as admin
        const members = [
          { room_id: room.id, user_id: currentProfile.id, role: 'admin' },
          ...selectedFriendIds.map((fId) => ({
            room_id: room.id,
            user_id: fId,
            role: 'member',
          })),
        ];

        await supabase.from('room_members').insert(members);
        onGroupCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0f0f11] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#ff6b00]" /> Buat Ruang Grup Baru
        </h2>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Nama Grup
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="cth: Tim Oit Squad"
              className="w-full px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Pilih Anggota Teman ({selectedFriendIds.length} dipilih)
            </label>

            <div className="max-h-48 overflow-y-auto space-y-2 border border-zinc-800 rounded-xl p-2 bg-[#141417]">
              {friends.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Belum ada daftar teman untuk ditambahkan.</p>
              ) : (
                friends.map((f) => {
                  const p = f.profile;
                  if (!p) return null;
                  const isSelected = selectedFriendIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleSelectFriend(p.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-[#ff6b00]/20 border border-[#ff6b00]' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-[#ff6b00] flex items-center justify-center text-xs font-bold text-[#ff6b00]">
                          {p.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.display_name || p.username}</p>
                          <p className="text-[10px] text-zinc-400">@{p.username}</p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-[#ff6b00]" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !groupName.trim() || selectedFriendIds.length === 0}
            className="w-full btn-orange flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl mt-4 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> {creating ? 'Membuat...' : 'Buat Grup Oit'}
          </button>
        </form>

      </div>
    </div>
  );
}
