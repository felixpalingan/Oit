'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Phone, Video, ShieldCheck } from 'lucide-react';
import { User as UserType } from '@/types';
import { createClient } from '@/utils/supabase/client';

interface UserProfileCardModalProps {
  targetUser: UserType;
  isOnline?: boolean;
  onClose: () => void;
  onSendMessage?: () => void;
  onStartCall?: (isVideo: boolean) => void;
}

export default function UserProfileCardModal({
  targetUser,
  isOnline = false,
  onClose,
  onSendMessage,
  onStartCall,
}: UserProfileCardModalProps) {
  const [userProfile, setUserProfile] = useState<UserType>(targetUser);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchFullProfile() {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetUser.id)
          .single();

        if (data) {
          setUserProfile(data as UserType);
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFullProfile();
  }, [targetUser.id, supabase]);

  const bioText = userProfile.bio || 'Navigating the digital ether.';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200"
    >
      
      {/* Profile Card Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 text-white relative overflow-hidden z-10"
      >
        
        {/* Banner Top Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#FF5C00]/30 via-purple-900/30 to-[#FF5C00]/20 border-b border-zinc-800/80" />

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 text-zinc-300 hover:text-white rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-colors cursor-pointer active:scale-95 border border-white/10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Avatar & Online Badge */}
        <div className="relative pt-6 flex flex-col items-center z-10">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-[#161619] overflow-hidden flex items-center justify-center font-extrabold text-2xl text-[#FF5C00] shadow-xl">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (userProfile.username || 'U')[0]?.toUpperCase()
              )}
            </div>

            <div
              title={isOnline ? 'Online' : 'Offline'}
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#161619] shadow-md transition-colors ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
              }`}
            />
          </div>

          <h3 className="text-lg font-black text-white leading-tight">
            {userProfile.display_name || userProfile.username}
          </h3>

          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            @{userProfile.username}
          </p>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified User</span>
          </div>
        </div>

        {/* ABOUT ME SECTION */}
        <div className="p-4 bg-[#1c1c21] border border-zinc-800/80 rounded-2xl space-y-2 z-10">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C00] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            ABOUT ME
          </h4>
          <p className="text-xs text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap">
            {bioText}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 z-10">
          {onSendMessage && (
            <button
              type="button"
              onClick={() => {
                onSendMessage();
                onClose();
              }}
              className="flex-1 py-3 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          )}

          {onStartCall && (
            <>
              <button
                type="button"
                onClick={() => {
                  onStartCall(false);
                  onClose();
                }}
                title="Voice Call"
                className="p-3 bg-[#26262a] hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold rounded-2xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onStartCall(true);
                  onClose();
                }}
                title="Video Call"
                className="p-3 bg-[#26262a] hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold rounded-2xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
