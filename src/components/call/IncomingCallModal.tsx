'use client';

import React, { useEffect } from 'react';
import { User } from '@/types';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallModalProps {
  caller: User;
  isVideo?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({
  caller,
  isVideo = true,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  const callerName = caller.display_name || caller.username;

  // Ringtone Generator & Browser Push Notification
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let ringInterval: NodeJS.Timeout | null = null;

    // Trigger Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`📞 Panggilan Masuk Oit`, {
          body: `${callerName} sedang memanggil panggilan ${isVideo ? 'Video' : 'Suara'}...`,
          icon: caller.avatar_url || '/oit_logo.png',
        });
      } catch (err) {
        console.warn('Call Notification error:', err);
      }
    }

    // Play Ringtone via Web Audio API
    function playRingtoneChime() {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playTones = () => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          
          const now = audioCtx.currentTime;
          
          // Tone 1: E5 (659Hz)
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(659, now);
          gain1.gain.setValueAtTime(0.15, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.start(now);
          osc1.stop(now + 0.4);

          // Tone 2: A5 (880Hz)
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now + 0.25);
          gain2.gain.setValueAtTime(0.2, now + 0.25);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start(now + 0.25);
          osc2.stop(now + 0.7);
        };

        playTones();
        ringInterval = setInterval(playTones, 1600);
      } catch (err) {
        console.warn('Ringtone error:', err);
      }
    }

    playRingtoneChime();

    return () => {
      if (ringInterval) clearInterval(ringInterval);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [callerName, caller.avatar_url, isVideo]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#161619] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 text-white">
        
        {/* Animated Ringing Avatar Container */}
        <div className="relative my-2">
          <div className="absolute -inset-3 rounded-full bg-[#FF5C00]/40 animate-ping opacity-75" />
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-[#FF5C00] overflow-hidden flex items-center justify-center font-extrabold text-2xl text-[#FF5C00] relative z-10 shadow-xl">
            {caller.avatar_url ? (
              <img src={caller.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (caller.username || 'U')[0]?.toUpperCase()
            )}
          </div>
        </div>

        {/* Incoming Call Details */}
        <div>
          <h3 className="text-lg font-black text-white">
            {callerName}
          </h3>
          <p className="text-xs text-[#FF5C00] font-semibold mt-1 flex items-center justify-center gap-1.5">
            {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            <span>Memanggil Panggilan {isVideo ? 'Video' : 'Suara'} Oit...</span>
          </p>
        </div>

        {/* Action Buttons: Decline vs Accept */}
        <div className="flex items-center justify-center gap-4 w-full pt-2">
          {/* Decline Button */}
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Tolak</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.97] animate-bounce cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Terima</span>
          </button>
        </div>

      </div>
    </div>
  );
}
