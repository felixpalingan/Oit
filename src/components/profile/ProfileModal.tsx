'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Mic, Video, VideoOff, Save, LogOut } from 'lucide-react';
import { UserProfile } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: (updatedProfile: UserProfile) => void;
  onLogout?: () => void;
}

export default function ProfileModal({
  profile,
  onClose,
  onUpdate,
  onLogout,
}: ProfileModalProps) {
  const {
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    setSelectedAudioDeviceId,
    setSelectedVideoDeviceId,
  } = useAppStore();

  const [displayName, setDisplayName] = useState(profile.display_name || profile.username);
  const [aboutMe, setAboutMe] = useState(profile.bio || 'Navigating the digital ether.');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  // Hardware Devices State
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>(selectedAudioDeviceId || '');
  const [selectedCam, setSelectedCam] = useState<string>(selectedVideoDeviceId || '');
  const [isPreviewCamOn, setIsPreviewCamOn] = useState(true);

  // Real Microphone Volume Meter Level (0 - 100%)
  const [micVolume, setMicVolume] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  // Enumerate Media Hardware Devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        setMics(audioInputs);
        setCams(videoInputs);

        if (!selectedMic && audioInputs.length > 0) {
          setSelectedMic(audioInputs[0].deviceId);
          setSelectedAudioDeviceId(audioInputs[0].deviceId);
        }
        if (!selectedCam && videoInputs.length > 0) {
          setSelectedCam(videoInputs[0].deviceId);
          setSelectedVideoDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Could not enumerate media devices:', err);
      }
    }
    getDevices();
  }, []);

  // REAL Microphone Audio Volume Meter via Web Audio API with strict cleanup protocol
  useEffect(() => {
    let audioStream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let animFrameId: number;

    async function startMicMeter() {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
          video: false,
        });

        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Scale 0 - 64 average to 0 - 100%
          const pct = Math.min(100, Math.round((average / 64) * 100));
          setMicVolume(pct);
          animFrameId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn('Mic meter error:', err);
        setMicVolume(0);
      }
    }

    startMicMeter();

    // STRICT CLEANUP PROTOCOL: Stop all tracks and close AudioContext
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [selectedMic]);

  // Camera Preview Stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      if (!isPreviewCamOn || !videoRef.current) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCam ? { deviceId: { exact: selectedCam } } : true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera preview error:', err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCam, isPreviewCamOn]);

  // Handle Audio Device Dropdown Selection
  const handleMicChange = (deviceId: string) => {
    setSelectedMic(deviceId);
    setSelectedAudioDeviceId(deviceId);
  };

  // Handle Video Device Dropdown Selection
  const handleCamChange = (deviceId: string) => {
    setSelectedCam(deviceId);
    setSelectedVideoDeviceId(deviceId);
  };

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `avatars/${profile.id}_${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, { upsert: true });

      if (!uploadErr) {
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
        if (data?.publicUrl) {
          setAvatarUrl(data.publicUrl);
          setUploading(false);
          return;
        }
      }

      // Base64 Fallback
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const updated: UserProfile = {
      ...profile,
      display_name: displayName,
      bio: aboutMe,
      avatar_url: avatarUrl || null,
    };

    try {
      await supabase.from('users').update({
        display_name: displayName,
        bio: aboutMe,
        avatar_url: avatarUrl || null,
      }).eq('id', profile.id);
    } catch (err) {
      console.error('User update error:', err);
    }

    onUpdate(updated);
    onClose();
  };

  const handleLogoutAction = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      if (onLogout) onLogout();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.clear();
      if (onLogout) onLogout();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      
      {/* User Settings Modal Container */}
      <div className="w-full max-w-2xl bg-[#161619] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col space-y-6 text-white max-h-[92vh] overflow-y-auto relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF5C00]" />
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              User Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TICKET 1: PROFILE DETAILS & IDENTITIES */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C00] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            PEMBARUAN PROFIL & IDENTITAS
          </h4>

          {/* Avatar Upload Box */}
          <div className="flex items-center gap-4 sm:gap-5 p-4 bg-[#1c1c21] border border-zinc-800 rounded-2xl">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 border-2 border-dashed border-[#FF5C00] overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0 relative group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl sm:text-2xl font-extrabold text-[#FF5C00]">
                  {(displayName || 'U')[0].toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                {uploading ? 'Uploading...' : 'Change'}
              </div>
            </div>

            <div className="flex-1">
              <h5 className="text-xs font-bold text-white">Avatar PFP</h5>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Klik lingkaran avatar untuk mengunggah foto profil baru. Otomatis diperbarui ke Supabase Storage & state aplikasi.
              </p>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              DISPLAY NAME (NAMA TAMPILAN)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors font-medium"
            />
          </div>

          {/* About Me Textarea */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
              ABOUT ME (BIO PENGGUNA)
            </label>
            <textarea
              rows={3}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tulis sedikit tentang diri Anda..."
              className="w-full px-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors resize-none font-medium"
            />
          </div>
        </div>

        {/* TICKET 2 & TICKET 3: WEBRTC DEVICE ENUMERATION & REALTIME MIC METER */}
        <div className="space-y-4 border-t border-zinc-800/80 pt-4">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C00] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            MANAJEMEN PERANGKAT WEBRTC & MIC TEST
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Microphone Dropdown (Ticket 2) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                MIKROFON (AUDIO INPUT)
              </label>
              <div className="relative">
                <Mic className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <select
                  value={selectedMic}
                  onChange={(e) => handleMicChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors appearance-none cursor-pointer font-medium"
                >
                  {mics.length > 0 ? (
                    mics.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>
                        {m.label || `Microphone ${m.deviceId.substring(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">System Default Microphone</option>
                  )}
                </select>
              </div>

              {/* TICKET 3: REALTIME MIC VOLUME METER VISUALIZER */}
              <div className="mt-3 space-y-1 bg-[#121215] p-3 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-[10px] text-zinc-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-[#FF5C00] animate-pulse" /> Live Volume Input:
                  </span>
                  <span className="text-[#FF5C00] font-extrabold">{micVolume}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-[#FF5C00] to-red-500 rounded-full transition-all duration-75 shadow-sm shadow-[#FF5C00]/50"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Video Source Dropdown (Ticket 2) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                KAMERA (VIDEO INPUT)
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <select
                  value={selectedCam}
                  onChange={(e) => handleCamChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#1c1c21] border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-[#FF5C00] transition-colors appearance-none cursor-pointer font-medium"
                >
                  {cams.length > 0 ? (
                    cams.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label || `Camera ${c.deviceId.substring(0, 5)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">System Default Camera</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Camera Preview Box */}
          <div className="relative w-full h-40 bg-[#1c1c21] border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {isPreviewCamOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-500 space-y-1">
                <VideoOff className="w-8 h-8 text-[#FF5C00]" />
                <span className="text-[11px] font-medium">Camera Preview Disabled</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsPreviewCamOn(!isPreviewCamOn)}
              className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              {isPreviewCamOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{isPreviewCamOn ? 'Disable' : 'Enable'}</span>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={handleLogoutAction}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#26262a] hover:bg-[#303036] text-zinc-200 font-extrabold rounded-2xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={uploading}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
