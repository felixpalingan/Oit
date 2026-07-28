'use client';

import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
  Users,
  Settings,
  PhoneOff,
  Minus,
  X,
  Volume2,
  PhoneCall,
} from 'lucide-react';
import { User } from '@/types';

interface VideoRoomProps {
  roomName: string;
  currentUser: User;
  chatUser?: User | null;
  isVideo?: boolean;
  onLeave: () => void;
}

export default function VideoRoom({
  roomName,
  currentUser,
  chatUser,
  isVideo = true,
  onLeave,
}: VideoRoomProps) {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState(0);

  // Format call duration MM:SS
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch LiveKit Token
  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`/api/livekit?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(currentUser.username)}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          setWsUrl(data.wsUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://oit-8dwd1ca4.livekit.cloud');
        }
      } catch (err) {
        console.error('Failed to get LiveKit token:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [roomName, currentUser.username]);

  const targetName = chatUser ? (chatUser.display_name || chatUser.username) : 'Panggilan Oit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 select-none">
      
      {/* Main Video Call Modal Container */}
      <div className="w-full max-w-4xl bg-[#161619] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-[#FF5C00]">
              {isVideo ? <Video className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight truncate max-w-xs">
                {isVideo ? `Video Call: ${targetName}` : `Voice Call: ${targetName}`}
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLeave}
              title="Minimize"
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onLeave}
              title="Close"
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Audio Canvas Container */}
        <div className="relative w-full h-[460px] bg-gradient-to-b from-[#1a1a1e] to-[#09090b] flex items-center justify-center overflow-hidden">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Menghubungkan Panggilan Oit LiveKit...</p>
            </div>
          ) : token ? (
            /* Clean LiveKit Player Grid without duplicate double control bar */
            <LiveKitRoom
              video={isVideo}
              audio={true}
              token={token}
              serverUrl={wsUrl}
              data-lk-theme="default"
              onDisconnected={onLeave}
              className="w-full h-full flex flex-col"
            >
              <div className="flex-1 relative overflow-hidden">
                <VideoConference />
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            /* Voice Call Avatar Screen Fallback */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-zinc-800 border-4 border-[#FF5C00] flex items-center justify-center font-bold text-3xl text-[#FF5C00] overflow-hidden shadow-2xl shadow-[#FF5C00]/20 animate-pulse">
                  {chatUser?.avatar_url ? (
                    <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    targetName[0]?.toUpperCase()
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#161619] flex items-center justify-center">
                  <Volume2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-white">{targetName}</h4>
                <p className="text-xs text-emerald-400 mt-0.5 font-mono">Panggilan Suara Aktif</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
