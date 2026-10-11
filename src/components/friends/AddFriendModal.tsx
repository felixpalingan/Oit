'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { X, Search, QrCode, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useModalA11y } from '@/hooks/useModalA11y';

interface AddFriendModalProps {
  currentUserId: string;
  onClose: () => void;
  onFriendAdded?: () => void;
  onStartChat?: (user: UserProfile) => void;
}

export default function AddFriendModal({ currentUserId, onClose, onFriendAdded, onStartChat }: AddFriendModalProps) {
  useModalA11y(true, onClose);

  const [activeMode, setActiveMode] = useState<'search' | 'scan'>('search');
  const [searchUsername, setSearchUsername] = useState('');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  // Search user by username
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setSearching(true);
    setErrorMsg('');
    setFoundUser(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', searchUsername.trim().toLowerCase())
        .neq('id', currentUserId)
        .single();

      if (error || !data) {
        setErrorMsg('No user found with that username.');
      } else {
        setFoundUser(data as UserProfile);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to search for user.');
    } finally {
      setSearching(false);
    }
  };

  // Start chat with user
  const handleStartChat = (user: UserProfile) => {
    if (onStartChat) {
      onStartChat(user);
    }
    if (onFriendAdded) {
      onFriendAdded();
    }
    onClose();
  };

  // QR Scanner Initialization
  useEffect(() => {
    if (activeMode === 'scan') {
      const scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false
      );

      scanner.render(
        async (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.type === 'oit_user' && data.username) {
              scanner.clear();
              setSearchUsername(data.username);
              setActiveMode('search');
              // Auto search
              const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.id)
                .single();
              if (user) {
                setFoundUser(user as UserProfile);
              }
            }
          } catch (e) {
            console.log('Scanned text is not valid Oit JSON:', decodedText, e);
          }
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [activeMode, supabase]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-friend-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f0f11] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 relative"
      >
        
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="add-friend-title" className="text-lg font-bold text-white mb-4">Add New Friend</h2>

        {/* Switch mode */}
        <div role="tablist" aria-label="Friend Finder Modes" className="flex gap-2 p-1 bg-[#18181b] rounded-xl mb-6">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'search'}
            onClick={() => setActiveMode('search')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none ${
              activeMode === 'search'
                ? 'bg-[#ff6b00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" aria-hidden="true" /> Search Username
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'scan'}
            onClick={() => setActiveMode('scan')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none ${
              activeMode === 'scan'
                ? 'bg-[#ff6b00] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" aria-hidden="true" /> Scan QR Code
          </button>
        </div>

        {activeMode === 'search' ? (
          <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter exact username..."
                aria-label="Username to search"
                className="flex-1 px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#ff6b00] focus-visible:ring-2 focus-visible:ring-[#ff6b00]"
              />
              <button
                type="submit"
                disabled={searching}
                className="btn-orange px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {errorMsg && (
              <p role="alert" className="text-xs text-red-400 mb-4">{errorMsg}</p>
            )}

            {foundUser && (
              <div className="p-4 bg-[#18181b] border border-zinc-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-[#ff6b00] flex items-center justify-center font-bold text-[#ff6b00] overflow-hidden">
                    {foundUser.avatar_url ? (
                      <img src={foundUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      foundUser.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {foundUser.display_name || foundUser.username}
                    </h4>
                    <p className="text-xs text-zinc-400">@{foundUser.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartChat(foundUser)}
                  aria-label={`Start chat with ${foundUser.display_name || foundUser.username}`}
                  className="btn-orange px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#ff6b00] outline-none shadow-md shadow-[#ff6b00]/20"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" /> Chat
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div id="reader" className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-black"></div>
            <p className="text-xs text-zinc-400 mt-3 text-center">
              Point your camera at your friend's unique QR Code to connect automatically.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
