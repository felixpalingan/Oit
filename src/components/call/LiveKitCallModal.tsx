'use client';

import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { X, PhoneOff } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LiveKitCallModalProps {
  roomName: string;
  username: string;
  onLeave: () => void;
}

export default function LiveKitCallModal({ roomName, username, onLeave }: LiveKitCallModalProps) {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(`/api/livekit?room=${encodeURIComponent(roomName)}`, {
          headers,
          credentials: 'include',
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Failed to get LiveKit token:', errData.error || res.statusText);
          return;
        }

        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          setWsUrl(data.wsUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://demo.livekit.cloud');
        }
      } catch (err) {
        console.error('Failed to get LiveKit token:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [roomName, username]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-zinc-300">Connecting to LiveKit Cloud Call...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="bg-[#0f0f11] border border-zinc-800 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-sm text-red-400 mb-4">Failed to connect to the call room.</p>
          <button onClick={onLeave} className="btn-orange px-4 py-2 text-xs font-semibold rounded-xl">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 bg-[#0f0f11] border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff6b00] animate-ping" />
          <span className="text-sm font-bold tracking-tight">Oit Call Room: {roomName}</span>
        </div>
        <button
          onClick={onLeave}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors text-white flex items-center gap-1 text-xs font-bold"
        >
          <PhoneOff className="w-4 h-4" /> Akhiri Call
        </button>
      </div>

      {/* LiveKit Video Conference Container */}
      <div className="flex-1 relative overflow-hidden bg-[#050505] dark-livekit-theme">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={wsUrl}
          data-lk-theme="default"
          onDisconnected={onLeave}
          style={{ height: '100%' }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
