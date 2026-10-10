'use client';

import React, { useState } from 'react';
import { Lock, Key, LogIn, Hand } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

interface SecurityCheckModalProps {
  roomId?: string;
  roomTitle: string;
  onSuccess: () => void;
  onRequestKnock?: () => void;
  onClose: () => void;
}

export default function SecurityCheckModal({
  roomId,
  roomTitle,
  onSuccess,
  onRequestKnock,
  onClose,
}: SecurityCheckModalProps) {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Password wajib diisi untuk verifikasi.');
      return;
    }

    if (roomId) {
      setIsVerifying(true);
      setErrorMsg('');
      try {
        const { data: isValid, error } = await supabase.rpc('verify_channel_password', {
          p_channel_id: roomId,
          p_password: password.trim(),
        });

        if (error) {
          console.error('Password verification error:', error);
          setErrorMsg('Gagal memverifikasi password ke server. Pastikan database RLS telah diperbarui.');
          setIsVerifying(false);
          return;
        }

        if (isValid === false) {
          setErrorMsg('Password channel salah. Akses ditolak.');
          setIsVerifying(false);
          return;
        }
      } catch (err: any) {
        console.error('Verify channel password exception:', err);
        setErrorMsg('Terjadi kesalahan verifikasi: ' + (err?.message || 'Server error'));
        setIsVerifying(false);
        return;
      } finally {
        setIsVerifying(false);
      }
    }

    // Access granted
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* Glassmorphism Security Card matching image_1.png */}
      <div className="w-full max-w-md bg-[#161619]/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 text-white relative">
        
        {/* Lock Icon Badge */}
        <div className="w-14 h-14 bg-zinc-800/90 border border-zinc-700/80 rounded-2xl flex items-center justify-center text-[#FF5C00] shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Security Check
          </h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs">
            This channel requires a password to enter. Knock to verify access to <span className="text-[#FF5C00] font-bold">{roomTitle}</span>.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {errorMsg && (
            <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>
          )}

          <div className="relative">
            <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter password"
              className="w-full pl-11 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-[#FF5C00] hover:bg-[#ff701a] disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#FF5C00]/25 transition-all active:scale-[0.98]"
          >
            <span>{isVerifying ? 'Verifying...' : 'Unlock & Enter Channel'}</span>
            <LogIn className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {onRequestKnock && (
          <div className="w-full pt-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px bg-zinc-800 flex-1" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Don't have password?</span>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>

            <button
              type="button"
              onClick={onRequestKnock}
              className="w-full py-2.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Hand className="w-4 h-4 text-[#FF5C00]" />
              <span>Request Access (Door Knock)</span>
            </button>
          </div>
        )}

        {/* Secondary Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel & Return
        </button>

      </div>

    </div>
  );
}
