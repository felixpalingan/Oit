'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Lock, LogIn, UserPlus, PhoneCall, AlertCircle, CheckCircle2 } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ProfileModal from '@/components/profile/ProfileModal';
import AddFriendModal from '@/components/friends/AddFriendModal';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import LiveKitCallModal from '@/components/call/LiveKitCallModal';
import { UserProfile, Room, Friend } from '@/types';

export default function Page() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // App Auth State
  const [sessionUser, setSessionUser] = useState<unknown | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [callState, setCallState] = useState<{ active: boolean; roomName: string } | null>(null);

  const supabase = createClient();

  // Load Session & Profile
  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionUser(session.user);
          await loadUserProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setAuthChecking(false);
      }
    }
    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        await loadUserProfile(session.user.id, session.user.email);
      } else {
        setSessionUser(null);
        setProfile(null);
        setRooms([]);
        setFriends([]);
        setActiveRoom(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Sync profile to database table `users` & `profiles`
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      const uname = email?.split('@')[0] || 'user';

      // Ensure profile exists in `public.users`
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userData) {
        // Insert into public.users
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: uname,
            display_name: uname,
          })
          .select()
          .single();

        if (newUser) {
          setProfile({
            id: newUser.id,
            username: newUser.username,
            display_name: newUser.display_name,
            bio: 'Hey there! I am using Oit.',
            avatar_url: newUser.avatar_url,
          });
        }
      } else {
        setProfile({
          id: userData.id,
          username: userData.username,
          display_name: userData.display_name || userData.username,
          bio: 'Hey there! I am using Oit.',
          avatar_url: userData.avatar_url,
        });
      }

      await fetchRoomsAndFriends(userId);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const fetchRoomsAndFriends = async (userId: string) => {
    try {
      // Fetch rooms
      const { data: roomMembers } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', userId);

      if (roomMembers && roomMembers.length > 0) {
        const rIds = roomMembers.map((r) => r.room_id);
        const { data: rData } = await supabase
          .from('rooms')
          .select('*')
          .in('id', rIds)
          .order('created_at', { ascending: false });

        if (rData) {
          setRooms(rData as Room[]);
        }
      }

      // Fetch friends
      const { data: fData } = await supabase
        .from('friends')
        .select(`
          *,
          profile:profiles!friends_friend_id_fkey(*)
        `)
        .eq('user_id', userId);

      if (fData) {
        setFriends(fData as Friend[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  // Handle Login & Register Actions
  const handleAuth = async (actionType: 'login' | 'register') => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    const email = `${username.trim().toLowerCase()}@oit.app`;

    try {
      if (actionType === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;
        if (data.user) {
          // Insert into users table
          await supabase.from('users').insert({
            id: data.user.id,
            username: username.trim().toLowerCase(),
            display_name: username.trim(),
          });

          setSuccessMsg('Akun Oit berhasil dibuat! Silakan klik LOGIN untuk masuk.');
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          await loadUserProfile(data.user.id, data.user.email);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan otentikasi.';
      if (msg.includes('Invalid login')) {
        setErrorMsg('Username atau password salah. Silakan coba lagi.');
      } else if (msg.includes('already registered')) {
        setErrorMsg('Username sudah terdaftar. Silakan tekan tombol LOGIN.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="h-screen w-screen bg-oit-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-oit-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- RENDER AUTH SCREEN (Matching User's Image Pixel-Perfectly) ---
  if (!sessionUser || !profile) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#FF5C00] selection:text-white">
        
        {/* Top Logo & Title */}
        <div className="flex flex-col items-center mb-8 text-center">
          
          {/* Logo Badge Icon Container */}
          <div className="w-20 h-20 bg-white rounded-3xl p-2.5 shadow-2xl shadow-[#FF5C00]/20 flex flex-col items-center justify-center relative mb-4 border border-zinc-200 overflow-hidden">
            {/* Matrix-like decorative text ring */}
            <div className="text-[7px] font-mono text-zinc-800 leading-tight tracking-widest text-center select-none opacity-80 mb-1">
              BCEEBOTAPIHG<br />
              GKIACOFNMI<br />
              Au<br />
              OFORτ?
            </div>
            
            {/* Orange Chat Bubble Icon with Phone */}
            <div className="flex items-center gap-1 bg-[#FF5C00] text-white px-2 py-1 rounded-xl shadow-md">
              <PhoneCall className="w-4 h-4 fill-current text-white" />
              <span className="font-black text-sm tracking-tight text-white">QOit</span>
            </div>
          </div>

          {/* Oit Main Brand Title */}
          <h1 className="text-4xl font-extrabold text-[#FF5C00] tracking-tight">
            Oit
          </h1>
          
          {/* Tagline */}
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1.5">
            High-Voltage Communication
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full max-w-sm bg-[#121212] border border-zinc-800/80 rounded-2xl p-7 shadow-2xl shadow-black/80 text-zinc-100">
          
          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleAuth(mode); }} className="space-y-5">
            
            {/* USERNAME FIELD */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                USERNAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Fitur reset password tersedia via admin Supabase.')}
                  className="text-[11px] font-medium text-[#FF5C00] hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
              </div>
            </div>

            {/* PRIMARY BUTTON: LOGIN */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAuth('login')}
              className="w-full bg-[#FF5C00] hover:bg-[#ff701a] text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.99] disabled:opacity-50 mt-6"
            >
              {loading && mode === 'login' ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            {/* OR DIVIDER */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-zinc-800" />
              <span className="px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                OR
              </span>
              <div className="flex-1 border-t border-zinc-800" />
            </div>

            {/* SECONDARY BUTTON: REGISTER */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAuth('register')}
              className="w-full bg-transparent border border-[#FF5C00] text-[#FF5C00] hover:bg-[#FF5C00]/10 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading && mode === 'register' ? (
                <span className="animate-spin w-4 h-4 border-2 border-[#FF5C00] border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>REGISTER</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-[11px] text-zinc-500 space-x-2">
          <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-zinc-400">Terms of Service</a>
        </div>

      </div>
    );
  }

  // --- RENDER MAIN CHAT APP ONCE LOGGED IN ---
  return (
    <div className="h-screen w-screen bg-[#000000] flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <div className={`h-full w-full md:w-auto ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <ChatSidebar
          currentProfile={profile}
          rooms={rooms}
          friends={friends}
          activeRoom={activeRoom}
          onSelectRoom={(r) => setActiveRoom(r)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAddFriend={() => setShowAddFriendModal(true)}
          onOpenCreateGroup={() => setShowCreateGroupModal(true)}
          onStartDirectCall={(friendProfile) => {
            const roomName = `call_${[profile.id, friendProfile.id].sort().join('_')}`;
            setCallState({ active: true, roomName });
          }}
          onLogout={async () => {
            await supabase.auth.signOut();
            setSessionUser(null);
            setProfile(null);
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`h-full flex-1 ${activeRoom ? 'flex' : 'hidden md:flex'}`}>
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            currentProfile={profile}
            onBackMobile={() => setActiveRoom(null)}
            onStartCall={() => {
              if (activeRoom) {
                setCallState({ active: true, roomName: `call_${activeRoom.id}` });
              }
            }}
          />
        ) : (
          <div className="flex-1 h-full bg-[#000000] flex flex-col items-center justify-center text-center p-8 border-l border-zinc-900">
            <div className="w-20 h-20 rounded-3xl bg-[#121212] border border-[#FF5C00]/30 flex items-center justify-center mb-4 shadow-2xl shadow-[#FF5C00]/10">
              <PhoneCall className="w-10 h-10 text-[#FF5C00]" />
            </div>
            <h2 className="text-2xl font-black text-white">Selamat Datang di Oit!</h2>
            <p className="text-xs text-zinc-400 max-w-sm mt-2 leading-relaxed">
              Anda telah masuk sebagai <b className="text-[#FF5C00]">@{profile.username}</b>. Pilih pesan atau tambah teman untuk memulai obrolan real-time.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated) => setProfile(updated)}
        />
      )}

      {showAddFriendModal && (
        <AddFriendModal
          currentUserId={profile.id}
          onClose={() => setShowAddFriendModal(false)}
          onFriendAdded={() => fetchRoomsAndFriends(profile.id)}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          currentProfile={profile}
          friends={friends}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={() => fetchRoomsAndFriends(profile.id)}
        />
      )}

      {callState?.active && (
        <LiveKitCallModal
          roomName={callState.roomName}
          username={profile.username}
          onLeave={() => setCallState(null)}
        />
      )}

    </div>
  );
}
