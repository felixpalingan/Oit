'use client';

import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  Video,
  Minus,
  X,
  Volume2,
  PhoneCall,
  Maximize2,
} from 'lucide-react';
import { User } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface VideoRoomProps {
  roomName: string;
  currentUser: User;
  chatUser?: User | null;
  isVideo?: boolean;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
  onLeave: () => void;
}

export default function VideoRoom({
  roomName,
  currentUser,
  chatUser,
  isVideo = true,
  isMinimized = false,
  onMinimize,
  onExpand,
  onLeave,
}: VideoRoomProps) {
  const { activeChannelName, selectedAudioDeviceId, selectedVideoDeviceId } = useAppStore();
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

  const targetName = chatUser
    ? (chatUser.display_name || chatUser.username)
    : (activeChannelName ? `# ${activeChannelName}` : 'Voice Room');
  const displayAvatar = chatUser?.avatar_url || currentUser.avatar_url;
  const initial = (chatUser?.username || currentUser.username || 'U')[0].toUpperCase();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">Menghubungkan Panggilan Oit LiveKit...</p>
        </div>
      </div>
    );
  }

  const audioOptions = selectedAudioDeviceId ? { deviceId: selectedAudioDeviceId } : true;
  const videoOptions = isVideo
    ? (selectedVideoDeviceId ? { deviceId: selectedVideoDeviceId } : true)
    : false;

  return (
    <LiveKitRoom
      video={videoOptions}
      audio={audioOptions}
      token={token}
      serverUrl={wsUrl}
      data-lk-theme="default"
      onDisconnected={onLeave}
      className="contents"
    >
      {/* LiveKit Audio Renderer stays active continuously */}
      <RoomAudioRenderer />

      {isMinimized ? (
        /* Floating Pod View while LiveKit Room stays 100% active and connected */
        <div
          onClick={onExpand}
          title="Click to expand active call"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 cursor-pointer group animate-in zoom-in-95 duration-200 select-none"
        >
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full bg-[#FF5C00]/40 animate-ping opacity-75" />

            <div className="w-14 h-14 rounded-full bg-[#161619] border-2 border-[#FF5C00] overflow-hidden shadow-2xl shadow-[#FF5C00]/40 relative z-10 flex items-center justify-center font-extrabold text-lg text-[#FF5C00]">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Live Call" className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Maximize2 className="w-5 h-5 text-[#FF5C00]" />
              </div>
            </div>

            <div className="absolute -bottom-1 -right-1 bg-[#FF5C00] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-20 border border-black">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      ) : (
        /* Full Expanded Video Call Modal View */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 select-none">
          <div className="w-full max-w-4xl bg-[#161619] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white animate-in zoom-in-95 duration-200">
            
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
                {/* MINIMIZE BUTTON */}
                <button
                  type="button"
                  onClick={onMinimize}
                  title="Minimize into Floating Pod"
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>

                {/* END CALL BUTTON */}
                <button
                  type="button"
                  onClick={onLeave}
                  title="Close & End Call"
                  className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Video / Audio Canvas Container */}
            <div className="relative w-full h-[460px] bg-gradient-to-b from-[#1a1a1e] to-[#09090b] flex items-center justify-center overflow-hidden">
              {token ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative overflow-hidden">
                    <VideoConference />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-zinc-800 border-4 border-[#FF5C00] flex items-center justify-center font-bold text-3xl text-[#FF5C00] overflow-hidden shadow-2xl shadow-[#FF5C00]/20 animate-pulse">
                      {displayAvatar ? (
                        <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
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
      )}
    </LiveKitRoom>
  );
}
