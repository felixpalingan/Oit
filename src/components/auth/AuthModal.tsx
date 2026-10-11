'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LogIn, UserPlus, Flame, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: () => void;
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const email = `${username.toLowerCase().trim()}@oit.app`;

    try {
      if (isRegister) {
        // Register using Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              display_name: displayName.trim() || username.trim(),
            },
          },
        });

        if (error) throw error;
        if (data.user) {
          onSuccess();
        }
      } else {
        // Login using Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          onSuccess();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
      setErrorMsg(msg.includes('Invalid login') ? 'Incorrect username or password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md bg-[#0f0f11] border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-orange-950/20 text-zinc-100"
      >
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff6b00] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/30 mb-3" aria-hidden="true">
            <Flame className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 id="auth-modal-title" className="text-3xl font-black tracking-tight text-white">
            Oit<span className="text-[#ff6b00]">.</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegister ? 'Create your new Oit account' : 'Sign in to your Oit account'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div role="alert" className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="auth-username-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Username
            </label>
            <input
              id="auth-username-input"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex123"
              className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00] focus-visible:ring-2 focus-visible:ring-[#ff6b00] transition-colors"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-display-name-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Display Name
              </label>
              <input
                id="auth-display-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00] focus-visible:ring-2 focus-visible:ring-[#ff6b00] transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-password-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="auth-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00] focus-visible:ring-2 focus-visible:ring-[#ff6b00] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-orange flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 mt-6 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" aria-hidden="true" /> Sign Up for Oit
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" aria-hidden="true" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {isRegister ? 'Already have an Oit account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="text-[#ff6b00] hover:underline font-semibold focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none rounded p-0.5"
          >
            {isRegister ? 'Sign in here' : 'Sign up now'}
          </button>
        </div>

      </div>
    </div>
  );
}
