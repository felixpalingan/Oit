'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, X, Upload, Sparkles } from 'lucide-react';
import LeftNavRail from '@/components/layout/LeftNavRail';
import ChannelSidebar from '@/components/layout/ChannelSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import WelcomeHomeScreen from '@/components/dashboard/WelcomeHomeScreen';
import ProfileModal from '@/components/profile/ProfileModal';
import UserProfileCardModal from '@/components/profile/UserProfileCardModal';
import ImageLightboxModal from '@/components/modals/ImageLightboxModal';
import AddFriendModal from '@/components/friends/AddFriendModal';
import VideoRoom from '@/components/chat/VideoRoom';
import IncomingCallModal from '@/components/call/IncomingCallModal';
import KnockNotification from '@/components/call/KnockNotification';
import SecurityCheckModal from '@/components/modals/SecurityCheckModal';
import CreateServerModal from '@/components/modals/CreateServerModal';
import JoinServerModal from '@/components/modals/JoinServerModal';
import ServerMembersModal from '@/components/modals/ServerMembersModal';
import ServerMembersSidebar from '@/components/layout/ServerMembersSidebar';
import EditServerModal from '@/components/modals/EditServerModal';
import CreateChannelModal from '@/components/modals/CreateChannelModal';
import EditChannelModal from '@/components/modals/EditChannelModal';
import { useAppStore, KnockRequest } from '@/store/useAppStore';
import { User as UserType, Message, Channel } from '@/types';

export default function Page() {
  const {
    activeServerId,
    activeChannelId,
    activeChannelName,
    activeCallRoomId,
    activeCallTargetUser,
    isCallVideo,
    isCallMinimized,
    knockNotification,
    isMobileDrawerOpen,
    setActiveServer,
    setActiveChannel,
    setActiveCall,
    setIsCallMinimized,
    setKnockNotification,
    setIsMobileDrawerOpen,
    clearCall,
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerAvatarUrl, setRegisterAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const registerFileInputRef = useRef<HTMLInputElement>(null);

  // Main Dashboard State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<UserType | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Global Online Presence Set (Set of active User IDs)
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Hydration Trigger Keys
  const [refreshServersKey, setRefreshServersKey] = useState(0);
  const [refreshChannelsKey, setRefreshChannelsKey] = useState(0);

  // Message Previews & Unread Counts Mapping
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, Message>>({});
  const [unreadCountsMap, setUnreadCountsMap] = useState<Record<string, number>>({});

  // Modals & Realtime Call State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [showJoinServerModal, setShowJoinServerModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditServerModal, setShowEditServerModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // User Profile Card & Image Lightbox Target State
  const [selectedUserProfileCard, setSelectedUserProfileCard] = useState<UserType | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; fileName: string } | null>(null);

  const [securityCheckRoom, setSecurityCheckRoom] = useState<{ id: string; title: string } | null>(null);
  const [incomingCallPrompt, setIncomingCallPrompt] = useState<{ caller: UserType; roomName: string; isVideo: boolean } | null>(null);

  const supabase = createClient();

  // Fetch Message Previews for all contacts
  const fetchMessagePreviews = async (userId: string, targetUsers: UserType[]) => {
    try {
      const lastMsgMap: Record<string, Message> = {};
      const unreadMap: Record<string, number> = {};

      for (const target of targetUsers) {
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${target.id}),and(sender_id.eq.${target.id},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (lastMsgs && lastMsgs.length > 0) {
          lastMsgMap[target.id] = lastMsgs[0] as Message;
        }

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', target.id)
          .eq('receiver_id', userId)
          .eq('is_read', false);

        unreadMap[target.id] = count || 0;
      }

      setLastMessagesMap(lastMsgMap);
      setUnreadCountsMap(unreadMap);
    } catch (err) {
      console.error('Error fetching message previews:', err);
    }
  };

  // Load Auth Session & Users Table
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleSessionUser(session.user);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setAuthChecking(false);
      }
    }

    checkAuthSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleSessionUser(session.user);
      } else {
        setCurrentUser(null);
        setActiveChatUser(null);
        setUsersList([]);
        setLastMessagesMap({});
        setUnreadCountsMap({});
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Global Online Presence Channel & Realtime Signaling
  useEffect(() => {
    if (!currentUser) return;

    const globalPresenceChannel = supabase.channel('global_online_presence', {
      config: { presence: { key: currentUser.id } },
    });

    globalPresenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = globalPresenceChannel.presenceState();
        const onlineSet = new Set<string>();

        Object.keys(state).forEach((key) => {
          onlineSet.add(key);
        });

        onlineSet.add(currentUser.id);
        setOnlineUserIds(onlineSet);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await globalPresenceChannel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    const sidebarChannel = supabase
      .channel('global:sidebar_previews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          if (currentUser && usersList.length > 0) {
            fetchMessagePreviews(currentUser.id, usersList);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'server_members' },
        (payload: any) => {
          const oldRow = payload.old;
          if (oldRow && oldRow.user_id === currentUser.id) {
            setActiveServer(null);
            setActiveChannel(null);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'server_bans', filter: `user_id=eq.${currentUser.id}` },
        () => {
          setActiveServer(null);
          setActiveChannel(null);
        }
      )
      .subscribe();

    // Instant Kick & Ban Membership Verification Loop
    const checkMembership = async () => {
      if (!activeServerId || !currentUser) return;
      try {
        const { data } = await supabase
          .from('server_members')
          .select('id')
          .eq('server_id', activeServerId)
          .eq('user_id', currentUser.id);

        if (!data || data.length === 0) {
          setActiveServer(null);
          setActiveChannel(null);
          setActiveChatUser(null);
        }
      } catch (err) {
        console.error('Membership check error:', err);
      }
    };

    checkMembership();
    const kickCheckInterval = setInterval(checkMembership, 1500);

    const callSignalingChannel = supabase
      .channel('global:call_signaling')
      .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
        if (payload?.targetUserId === currentUser.id) {
          setIncomingCallPrompt({
            caller: payload.caller,
            roomName: payload.roomName,
            isVideo: payload.isVideo,
          });
        }
      })
      .on('broadcast', { event: 'call_declined' }, ({ payload }) => {
        if (payload?.roomName && activeCallRoomId === payload.roomName) {
          clearCall();
        }
      })
      .subscribe();

    const roomRequestsChannel = supabase
      .channel('room_requests')
      .on('broadcast', { event: 'knock' }, ({ payload }) => {
        if (payload?.userId !== currentUser.id) {
          setKnockNotification({
            id: `knock-${Date.now()}`,
            userId: payload.userId,
            userName: payload.userName || 'David (34)',
            roomName: payload.roomId || 'secret-room',
            targetRoomTitle: payload.targetRoomTitle || 'Secret Room',
          });
        }
      })
      .on('broadcast', { event: 'knock_approved' }, ({ payload }) => {
        if (payload?.targetUserId === currentUser.id) {
          setActiveCall(payload.roomName, null, true);
        }
      })
      .subscribe();

    return () => {
      clearInterval(kickCheckInterval);
      globalPresenceChannel.untrack();
      supabase.removeChannel(globalPresenceChannel);
      supabase.removeChannel(sidebarChannel);
      supabase.removeChannel(callSignalingChannel);
      supabase.removeChannel(roomRequestsChannel);
    };
  }, [currentUser, usersList, activeCallRoomId, supabase]);

  const handleSessionUser = async (sessionUser: { id: string; email?: string }) => {
    const uname = sessionUser.email?.split('@')[0] || 'user';

    try {
      let userObj: UserType = {
        id: sessionUser.id,
        username: uname,
        display_name: uname,
        avatar_url: null,
      };

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (dbUser) {
        userObj = dbUser;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            id: sessionUser.id,
            username: uname,
            display_name: uname,
          })
          .select()
          .single();

        if (newUser) userObj = newUser;
      }

      setCurrentUser(userObj);

      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', sessionUser.id);

      if (allUsers && allUsers.length > 0) {
        setUsersList(allUsers as UserType[]);
        await fetchMessagePreviews(sessionUser.id, allUsers as UserType[]);
      }
    } catch (err) {
      console.error('Session user setup error:', err);
    }
  };

  const handleRegisterAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `avatars/register_${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, { upsert: true });

      if (!uploadErr) {
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
        if (data?.publicUrl) {
          setRegisterAvatarUrl(data.publicUrl);
          setUploadingAvatar(false);
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        setRegisterAvatarUrl(reader.result as string);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setUploadingAvatar(false);
    }
  };

  const handleKnockRoom = (roomId: string, title: string) => {
    setSecurityCheckRoom({ id: roomId, title });
  };

  const handleSecurityCheckSuccess = () => {
    if (!securityCheckRoom || !currentUser) return;

    supabase.channel('room_requests').send({
      type: 'broadcast',
      event: 'knock',
      payload: {
        userId: currentUser.id,
        userName: currentUser.display_name || currentUser.username,
        roomId: securityCheckRoom.id,
        targetRoomTitle: securityCheckRoom.title,
      },
    });

    setSecurityCheckRoom(null);
  };

  const initiateCall = (chatUser: UserType, isVideo: boolean) => {
    const roomName = `call_${[currentUser?.id, chatUser.id].sort().join('_')}`;

    supabase.channel('global:call_signaling').send({
      type: 'broadcast',
      event: 'incoming_call',
      payload: {
        caller: currentUser,
        targetUserId: chatUser.id,
        roomName,
        isVideo,
      },
    });

    setActiveCall(roomName, chatUser, isVideo);
  };

  const handleApproveKnock = (knock: KnockRequest) => {
    const roomName = `room_${knock.roomName}`;
    supabase.channel('room_requests').send({
      type: 'broadcast',
      event: 'knock_approved',
      payload: {
        targetUserId: knock.userId,
        roomName,
      },
    });
    setActiveCall(roomName, { display_name: knock.userName }, true);
    setKnockNotification(null);
  };

  const handleDenyKnock = (knock: KnockRequest) => {
    setKnockNotification(null);
  };

  const handleDeclineCall = () => {
    if (incomingCallPrompt) {
      supabase.channel('global:call_signaling').send({
        type: 'broadcast',
        event: 'call_declined',
        payload: {
          roomName: incomingCallPrompt.roomName,
          targetUserId: incomingCallPrompt.caller.id,
        },
      });
    }
    setIncomingCallPrompt(null);
  };

  const handleEndCall = () => {
    clearCall();
  };

  const handleAuthAction = async (action: 'login' | 'register') => {
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

    if (action === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok.');
        return;
      }
    }

    setLoading(true);
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const email = `${cleanUsername}@oit.app`;
    const finalDisplayName = displayName.trim() || username.trim();

    try {
      if (action === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: cleanUsername, display_name: finalDisplayName },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            username: cleanUsername,
            display_name: finalDisplayName,
            avatar_url: registerAvatarUrl,
          });

          setSuccessMsg('Akun Oit berhasil dibuat dengan PFP! Silakan klik LOGIN untuk masuk.');
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          await handleSessionUser(data.user);
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
      <div className="h-screen w-screen bg-[#000000] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- RENDER DEDICATED AUTH PAGE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#FF5C00] selection:text-white select-none">
        
        {/* Top Logo & Title */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/oit_logo.png"
            alt="Oit Logo"
            className="w-16 h-16 md:w-20 md:h-20 rounded-3xl object-cover shadow-2xl shadow-[#FF5C00]/25 mb-3 border border-zinc-800"
          />

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#FF5C00] tracking-tight">
            Oit
          </h1>
          
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1">
            High-Voltage Communication Platform
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-zinc-100 relative">
          
          {/* Mode Switch Tabs (LOGIN vs REGISTER) */}
          <div className="flex p-1 bg-[#1a1a1e] rounded-2xl border border-zinc-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-[#FF5C00] text-white shadow-md shadow-[#FF5C00]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>REGISTER</span>
            </button>
          </div>

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

          <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(mode); }} className="space-y-4">
            
            {mode === 'register' && (
              <div className="space-y-4 border-b border-zinc-800/80 pb-4 mb-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#FF5C00] text-center">
                  UPLOAD PROFIL PICTURE (PFP)
                </label>

                <div className="flex justify-center">
                  <input
                    type="file"
                    ref={registerFileInputRef}
                    onChange={handleRegisterAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div
                    onClick={() => registerFileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-[#1c1c21] border-2 border-dashed border-[#FF5C00] hover:border-white overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all group relative shrink-0 shadow-lg shadow-[#FF5C00]/10"
                  >
                    {registerAvatarUrl ? (
                      <>
                        <img src={registerAvatarUrl} alt="PFP" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          Ganti
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#FF5C00] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-extrabold uppercase text-zinc-400 group-hover:text-white">
                          {uploadingAvatar ? 'Uploading...' : 'Set PFP'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    DISPLAY NAME (NAMA TAMPILAN)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Alex Rivers"
                    className="w-full px-4 py-2.5 bg-[#1c1c21] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                USERNAME (TAG UNIK)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: alex_rivers"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c21] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  PASSWORD
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Reset password via admin Supabase.')}
                    className="text-[10px] font-medium text-[#FF5C00] hover:underline"
                  >
                    Lupa Password?
                  </button>
                )}
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c21] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  KONFIRMASI PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c21] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingAvatar}
              className="w-full bg-[#FF5C00] hover:bg-[#ff701a] text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C00]/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : mode === 'login' ? (
                <>
                  <span>MASUK (LOGIN)</span>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                </>
              ) : (
                <>
                  <span>BUAT AKUN BARU (REGISTER)</span>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

        </div>

        <div className="mt-6 text-center text-[10px] text-zinc-500 space-x-2">
          <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-zinc-400">Terms of Service</a>
        </div>

      </div>
    );
  }

  const isHomeLanding = activeServerId === null && activeChatUser === null;

  // --- RENDER MAIN OIT DASHBOARD ---
  return (
    <div className="h-screen w-screen bg-[#141416] flex overflow-hidden font-sans relative select-none">
      
      {/* MOBILE BACKDROP OVERLAY WHEN DRAWER IS OPEN */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SINGLE UNIFIED SIDEBAR CONTAINER */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 flex h-full shrink-0 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <LeftNavRail
          currentUser={currentUser}
          hasUnreadMessages={Object.values(unreadCountsMap).reduce((a, b) => a + b, 0) > 0}
          onOpenProfile={() => {
            setShowProfileModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenNewChat={() => {
            setShowAddFriendModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenCreateServer={() => {
            setShowCreateServerModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onSelectDMHome={() => {
            setActiveChatUser(null);
            setIsMobileDrawerOpen(false);
          }}
          refreshKey={refreshServersKey}
        />

        <ChannelSidebar
          currentUser={currentUser}
          usersList={usersList}
          onlineUserIds={onlineUserIds}
          activeChatUser={activeChatUser}
          onSelectUser={(u) => {
            setActiveChatUser(u);
            setActiveServer(null);
            setIsMobileDrawerOpen(false);
          }}
          onOpenNewChatModal={() => {
            setShowAddFriendModal(true);
            setIsMobileDrawerOpen(false);
          }}
          lastMessagesMap={lastMessagesMap}
          unreadCountsMap={unreadCountsMap}
          onKnockRoom={(id, title) => {
            handleKnockRoom(id, title);
            setIsMobileDrawerOpen(false);
          }}
          onJoinVoiceCall={(c) => {
            setActiveCall(`vc_${c.id}`, { display_name: c.name }, false);
            setIsMobileDrawerOpen(false);
          }}
          onSelectChannel={() => {
            setActiveChatUser(null);
            setIsMobileDrawerOpen(false);
          }}
          onOpenJoinServer={() => {
            setShowJoinServerModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenMembersModal={() => {
            setShowMembersModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenEditServerModal={() => {
            setShowEditServerModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenCreateChannelModal={() => {
            setShowCreateChannelModal(true);
            setIsMobileDrawerOpen(false);
          }}
          onOpenEditChannelModal={(chan) => {
            setEditingChannel(chan);
            setIsMobileDrawerOpen(false);
          }}
          refreshChannelsTrigger={refreshChannelsKey}
        />
      </div>

      {/* MAIN CONTENT STREAM AREA */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#121215] w-full">
        
        {/* Top Right Knock Knock Notification Badge */}
        {knockNotification && (
          <KnockNotification
            knock={knockNotification}
            onApprove={handleApproveKnock}
            onDeny={handleDenyKnock}
          />
        )}

        {/* Render Welcome Landing Home Screen if no chat/server is selected */}
        {isHomeLanding ? (
          <WelcomeHomeScreen
            currentUser={currentUser}
            onOpenCreateServer={() => setShowCreateServerModal(true)}
            onOpenJoinServer={() => setShowJoinServerModal(true)}
            onOpenAddFriend={() => setShowAddFriendModal(true)}
          />
        ) : (
          /* Chat Window Stream with Discord-Style Right Members Panel */
          <div className="flex-1 h-full flex flex-row overflow-hidden w-full">
            <ChatWindow
              currentUser={currentUser}
              chatUser={activeChatUser}
              usersList={usersList}
              isChatUserOnline={activeChatUser ? onlineUserIds.has(activeChatUser.id) : false}
              onBackMobile={() => setIsMobileDrawerOpen(true)}
              onStartCall={(isVideo) => {
                if (activeChatUser) initiateCall(activeChatUser, isVideo);
                else initiateCall({ id: 'room-1', username: activeChannelName, display_name: activeChannelName, avatar_url: null }, isVideo);
              }}
              onOpenUserProfile={(u) => setSelectedUserProfileCard(u)}
              onOpenImageLightbox={(url, fileName) => setSelectedLightboxImage({ url, fileName: fileName || 'image.png' })}
            />

            {/* Discord-style Right Members Sidebar (Image 5) */}
            {activeServerId && !activeChatUser && (
              <ServerMembersSidebar
                serverId={activeServerId}
                currentUser={currentUser}
                onlineUserIds={onlineUserIds}
                onOpenUserProfile={(u) => setSelectedUserProfileCard(u)}
                refreshTrigger={refreshServersKey}
              />
            )}
          </div>
        )}
      </main>

      {/* ALL MODALS RENDERED AT APP ROOT LEVEL (FULL SCREEN BACKDROP OVERLAY) */}
      {showProfileModal && (
        <ProfileModal
          profile={{
            id: currentUser.id,
            username: currentUser.username,
            display_name: currentUser.display_name,
            bio: currentUser.bio || 'Navigating the digital ether.',
            avatar_url: currentUser.avatar_url,
          }}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated) => setCurrentUser((prev) => prev ? { ...prev, ...updated } : null)}
          onLogout={() => {
            setCurrentUser(null);
            setActiveChatUser(null);
            setActiveServer(null);
          }}
        />
      )}

      {/* Full-Screen Image Lightbox Modal Overlay */}
      {selectedLightboxImage && (
        <ImageLightboxModal
          imageUrl={selectedLightboxImage.url}
          fileName={selectedLightboxImage.fileName}
          onClose={() => setSelectedLightboxImage(null)}
        />
      )}

      {/* User Profile Card Popup Modal */}
      {selectedUserProfileCard && (
        <UserProfileCardModal
          targetUser={selectedUserProfileCard}
          isOnline={onlineUserIds.has(selectedUserProfileCard.id)}
          onClose={() => setSelectedUserProfileCard(null)}
          onSendMessage={() => {
            setActiveChatUser(selectedUserProfileCard);
            setActiveServer(null);
          }}
          onStartCall={(isVideo) => initiateCall(selectedUserProfileCard, isVideo)}
        />
      )}

      {showAddFriendModal && (
        <AddFriendModal
          currentUserId={currentUser.id}
          onClose={() => setShowAddFriendModal(false)}
          onFriendAdded={() => {}}
        />
      )}

      {/* Create Server Modal */}
      {showCreateServerModal && currentUser && (
        <CreateServerModal
          currentUser={currentUser}
          onClose={() => setShowCreateServerModal(false)}
          onCreated={() => {
            setActiveChatUser(null);
            setRefreshServersKey((prev) => prev + 1);
          }}
        />
      )}

      {/* Join / Explore Server Modal */}
      {showJoinServerModal && currentUser && (
        <JoinServerModal
          currentUser={currentUser}
          onClose={() => setShowJoinServerModal(false)}
          onJoined={() => {
            setActiveChatUser(null);
            setRefreshServersKey((prev) => prev + 1);
          }}
        />
      )}

      {/* Create Channel Modal (Root Overlay) */}
      {showCreateChannelModal && activeServerId && (
        <CreateChannelModal
          serverId={activeServerId}
          onClose={() => setShowCreateChannelModal(false)}
          onChannelCreated={(created) => {
            setActiveChannel(created.id, created.name);
            setRefreshChannelsKey((prev) => prev + 1);
          }}
        />
      )}

      {/* Edit Channel Modal (Root Overlay) */}
      {editingChannel && (
        <EditChannelModal
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onUpdated={() => setRefreshChannelsKey((prev) => prev + 1)}
          onDeleted={() => setRefreshChannelsKey((prev) => prev + 1)}
        />
      )}

      {/* Server Members List Modal (Root Overlay) */}
      {showMembersModal && activeServerId && currentUser && (
        <ServerMembersModal
          serverId={activeServerId}
          serverName={activeChannelName || 'Server'}
          currentUser={currentUser}
          onlineUserIds={onlineUserIds}
          onClose={() => setShowMembersModal(false)}
          onOpenUserProfile={(u) => setSelectedUserProfileCard(u)}
        />
      )}

      {/* Edit Server Details Modal (Root Overlay) */}
      {showEditServerModal && activeServerId && (
        <EditServerModal
          serverId={activeServerId}
          onClose={() => setShowEditServerModal(false)}
          onUpdated={() => setRefreshServersKey((prev) => prev + 1)}
          onDeleted={() => setRefreshServersKey((prev) => prev + 1)}
        />
      )}

      {/* Glassmorphism Security Check Password Modal */}
      {securityCheckRoom && (
        <SecurityCheckModal
          roomTitle={securityCheckRoom.title}
          onSuccess={handleSecurityCheckSuccess}
          onClose={() => setSecurityCheckRoom(null)}
        />
      )}

      {/* Ringing Incoming Call Prompt Modal */}
      {incomingCallPrompt && (
        <IncomingCallModal
          caller={incomingCallPrompt.caller}
          isVideo={incomingCallPrompt.isVideo}
          onAccept={() => {
            setActiveCall(incomingCallPrompt.roomName, incomingCallPrompt.caller, incomingCallPrompt.isVideo);
            setIncomingCallPrompt(null);
          }}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Persistent LiveKit Video / Voice Call Component */}
      {activeCallRoomId && (
        <VideoRoom
          roomName={activeCallRoomId}
          currentUser={currentUser}
          chatUser={activeCallTargetUser}
          isVideo={isCallVideo}
          isMinimized={isCallMinimized}
          onMinimize={() => setIsCallMinimized(true)}
          onExpand={() => setIsCallMinimized(false)}
          onLeave={handleEndCall}
        />
      )}

    </div>
  );
}
