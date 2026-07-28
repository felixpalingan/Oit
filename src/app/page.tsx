'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import LeftNavRail from '@/components/layout/LeftNavRail';
import ChannelSidebar from '@/components/layout/ChannelSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ProfileModal from '@/components/profile/ProfileModal';
import AddFriendModal from '@/components/friends/AddFriendModal';
import VideoRoom from '@/components/chat/VideoRoom';
import IncomingCallModal from '@/components/call/IncomingCallModal';
import KnockNotification from '@/components/call/KnockNotification';
import SecurityCheckModal from '@/components/modals/SecurityCheckModal';
import CreateServerModal from '@/components/modals/CreateServerModal';
import { useAppStore, KnockRequest } from '@/store/useAppStore';
import { User as UserType, Message } from '@/types';

export default function Page() {
  const {
    activeChannelId,
    activeChannelName,
    activeCallRoomId,
    activeCallTargetUser,
    isCallVideo,
    isCallMinimized,
    knockNotification,
    setActiveCall,
    setIsCallMinimized,
    setKnockNotification,
    clearCall,
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Main Dashboard State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<UserType | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Message Previews & Unread Counts Mapping
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, Message>>({});
  const [unreadCountsMap, setUnreadCountsMap] = useState<Record<string, number>>({});

  // Modals & Realtime Call State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
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

  // Real-time Listeners for Previews, Call Signaling, and Knock-Knock Broadcasts
  useEffect(() => {
    if (!currentUser) return;

    // 1. Sidebar Messages Realtime Listener
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
      .subscribe();

    // 2. Realtime Call Signaling Channel
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
      .on('broadcast', { event: 'call_ended' }, ({ payload }) => {
        if (payload?.roomName && activeCallRoomId === payload.roomName) {
          clearCall();
        }
      })
      .subscribe();

    // 3. Supabase Realtime "Knock-Knock" Room Requests Channel
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
      } else {
        const sampleUser: UserType = {
          id: 'sample-1',
          username: 'Sarah (26)',
          display_name: 'Sarah (26)',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        };
      }
    } catch (err) {
      console.error('Session user setup error:', err);
    }
  };

  // Trigger Outgoing Knock Knock Door Request & Open Security Check Modal
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

  // Trigger Outgoing Call Signaling to Target User
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

  // Approve Knock Handler
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

  // Deny Knock Handler
  const handleDenyKnock = (knock: KnockRequest) => {
    setKnockNotification(null);
  };

  // Decline Call Handler
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

  // End Call Handler
  const handleEndCall = () => {
    if (activeCallRoomId) {
      supabase.channel('global:call_signaling').send({
        type: 'broadcast',
        event: 'call_ended',
        payload: {
          roomName: activeCallRoomId,
        },
      });
    }
    clearCall();
  };

  // Login & Register handler
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

    setLoading(true);
    const email = `${username.trim().toLowerCase()}@oit.app`;

    try {
      if (action === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
          },
        });

        if (error) throw error;
        if (data.user) {
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

  // --- RENDER AUTH PAGE (IMAGE 4 MATCH) ---
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center p-4 selection:bg-[#FF5C00] selection:text-white">
        
        {/* Top Logo & Title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img
            src="/oit_logo.png"
            alt="Oit Logo"
            className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-[#FF5C00]/25 mb-4 border border-zinc-800"
          />

          <h1 className="text-4xl font-extrabold text-[#FF5C00] tracking-tight">
            Oit
          </h1>
          
          <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1.5">
            High-Voltage Communication
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full max-w-sm bg-[#121212] border border-zinc-800/80 rounded-2xl p-7 shadow-2xl shadow-black/80 text-zinc-100">
          
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

          <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(mode); }} className="space-y-5">
            
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => alert('Reset password via admin Supabase.')}
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

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAuthAction('login')}
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

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-zinc-800" />
              <span className="px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                OR
              </span>
              <div className="flex-1 border-t border-zinc-800" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAuthAction('register')}
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

        <div className="mt-8 text-center text-[11px] text-zinc-500 space-x-2">
          <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-zinc-400">Terms of Service</a>
        </div>

      </div>
    );
  }

  // --- RENDER MAIN OIT DASHBOARD ---
  return (
    <div className="h-screen w-screen bg-[#141416] flex overflow-hidden font-sans relative select-none">
      
      {/* 1. Leftmost Vertical Navigation Rail */}
      <LeftNavRail
        currentUser={currentUser}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNewChat={() => setShowAddFriendModal(true)}
        onOpenCreateServer={() => setShowCreateServerModal(true)}
      />

      {/* 2. Channel & DM Sidebar */}
      <ChannelSidebar
        currentUser={currentUser}
        usersList={usersList}
        activeChatUser={activeChatUser}
        onSelectUser={(u) => setActiveChatUser(u)}
        onOpenNewChatModal={() => setShowAddFriendModal(true)}
        lastMessagesMap={lastMessagesMap}
        unreadCountsMap={unreadCountsMap}
        onKnockRoom={handleKnockRoom}
        onJoinVoiceCall={(c) => {
          setActiveCall(`vc_${c.id}`, { display_name: c.name }, false);
        }}
      />

      {/* 3. Main Content Stream Area */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#121215]">
        
        {/* Top Right Knock Knock Notification Badge */}
        {knockNotification && (
          <KnockNotification
            knock={knockNotification}
            onApprove={handleApproveKnock}
            onDeny={handleDenyKnock}
          />
        )}

        {/* Chat Window Stream */}
        <ChatWindow
          currentUser={currentUser}
          chatUser={activeChatUser}
          onBackMobile={() => setActiveChatUser(null)}
          onStartCall={(isVideo) => {
            if (activeChatUser) initiateCall(activeChatUser, isVideo);
            else initiateCall({ id: 'room-1', username: activeChannelName, display_name: activeChannelName, avatar_url: null }, isVideo);
          }}
        />
      </main>

      {/* Modals & Realtime Ringing Handlers */}
      {showProfileModal && (
        <ProfileModal
          profile={{
            id: currentUser.id,
            username: currentUser.username,
            display_name: currentUser.display_name,
            bio: 'Navigating the digital ether.',
            avatar_url: currentUser.avatar_url,
          }}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated) => setCurrentUser((prev) => prev ? { ...prev, ...updated } : null)}
        />
      )}

      {showAddFriendModal && (
        <AddFriendModal
          currentUserId={currentUser.id}
          onClose={() => setShowAddFriendModal(false)}
          onFriendAdded={() => {}}
        />
      )}

      {/* Create Server Modal (Ticket 1 & 2 Match) */}
      {showCreateServerModal && currentUser && (
        <CreateServerModal
          currentUser={currentUser}
          onClose={() => setShowCreateServerModal(false)}
          onCreated={() => {}}
        />
      )}

      {/* Glassmorphism Security Check Password Modal (Image 1 Match) */}
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
