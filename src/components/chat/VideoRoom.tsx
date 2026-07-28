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
} from 'lucide-react';
import { User } from '@/types';

interface VideoRoomProps {
  roomName: string;
  currentUser: User;
  onLeave: () => void;
}

export default function VideoRoom({ roomName, currentUser, onLeave }: VideoRoomProps) {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Call Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
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
          setWsUrl(data.wsUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://demo.livekit.cloud');
        }
      } catch (err) {
        console.error('Failed to get LiveKit token:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [roomName, currentUser.username]);

  // Mock participants matching user image design for demo preview
  const demoParticipants = [
    { name: 'Sarah (26)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Kenji (31)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Maria (40)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
    { name: 'David (34)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    { name: 'Chloe (22)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      
      {/* Main Video Call Modal Container */}
      <div className="w-full max-w-4xl bg-[#161619] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-[#FF5C00]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {roomName.replace('call_', '').replace('room_', '') || 'LiveKit Call Room'}
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

        {/* Video Canvas Area */}
        <div className="relative w-full h-[450px] bg-gradient-to-b from-[#2a2b30] to-[#1a1b20] flex items-center justify-center overflow-hidden">
          
          {/* LiveKit Cloud Player Container if Token Available */}
          {token ? (
            <LiveKitRoom
              video={!isVideoOff}
              audio={!isMuted}
              token={token}
              serverUrl={wsUrl}
              data-lk-theme="default"
              onDisconnected={onLeave}
              style={{ width: '100%', height: '100%' }}
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            /* Custom Avatar Gallery Preview Matching User's Design Image */
            <div className="flex flex-col items-center justify-center w-full h-full p-6 relative">
              
              {/* Picture-In-Picture Box for Self CAMERA ('YOU') */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-zinc-900 border-2 border-zinc-700 rounded-2xl overflow-hidden shadow-2xl z-20">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                  alt="YOU"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-2 bg-black/70 text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                  YOU
                </span>
                <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {/* Center Participant Avatars Line */}
              <div className="flex items-center justify-center gap-3 md:gap-5 my-auto">
                {demoParticipants.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center group">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white/80 shadow-2xl overflow-hidden mb-3 transform transition-transform group-hover:scale-105">
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-zinc-200">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Active Speaker Tag */}
              <div className="absolute bottom-4 left-4 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-xl flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <span>Sarah (26)</span>
                <Volume2 className="w-3.5 h-3.5 text-[#FF5C00]" />
              </div>

            </div>
          )}

        </div>

        {/* Bottom Call Control Bar */}
        <div className="px-6 py-4 bg-[#121215] border-t border-zinc-800/80 flex items-center justify-between">
          
          <div className="flex items-center justify-center gap-3 mx-auto">
            {/* Toggle Mic */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Camera */}
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Screen Share */}
            <button
              onClick={() => alert('Screen share aktif')}
              title="Share Screen"
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-center transition-all"
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            {/* Participants */}
            <button
              onClick={() => alert('Daftar peserta panggilan')}
              title="Participants"
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-center transition-all"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button
              onClick={() => alert('Pengaturan audio/video')}
              title="Settings"
              className="w-11 h-11 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-center transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* END CALL PRIMARY RED BUTTON */}
            <button
              onClick={onLeave}
              className="bg-[#ff3b30] hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-2xl flex items-center gap-2 text-xs shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] ml-3"
            >
              <PhoneOff className="w-4 h-4" />
              <span>END CALL</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
