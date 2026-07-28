'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, Room, Friend } from '@/types';
import AuthModal from '@/components/auth/AuthModal';
import ProfileModal from '@/components/profile/ProfileModal';
import AddFriendModal from '@/components/friends/AddFriendModal';
import CreateGroupModal from '@/components/chat/CreateGroupModal';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import LiveKitCallModal from '@/components/call/LiveKitCallModal';
import { Flame } from 'lucide-react';

export default function Page() {
  const [session, setSession] = useState<unknown | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [callState, setCallState] = useState<{ active: boolean; roomName: string } | null>(null);

  const supabase = createClient();

  // Load Auth Session & User Profile
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          // Fetch Profile
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profData) {
            setProfile(profData);
          } else {
            // Auto create profile if trigger skipped
            const username = session.user.email?.split('@')[0] || 'user';
            const { data: newProf } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username,
                display_name: username,
              })
              .select()
              .single();
            if (newProf) setProfile(newProf);
          }
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setRooms([]);
        setFriends([]);
        setActiveRoom(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Load Rooms & Friends data
  const fetchData = async () => {
    if (!profile) return;

    try {
      // Fetch Rooms where user is a member
      const { data: roomMembers } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', profile.id);

      if (roomMembers && roomMembers.length > 0) {
        const roomIds = roomMembers.map((r) => r.room_id);
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .in('id', roomIds)
          .order('created_at', { ascending: false });

        if (roomsData) {
          setRooms(roomsData as Room[]);
          if (!activeRoom && roomsData.length > 0) {
            setActiveRoom(roomsData[0] as Room);
          }
        }
      }

      // Fetch Friends list
      const { data: friendsData } = await supabase
        .from('friends')
        .select(`
          *,
          profile:profiles!friends_friend_id_fkey(*)
        `)
        .eq('user_id', profile.id);

      if (friendsData) {
        setFriends(friendsData as Friend[]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  // Start Direct Chat with Friend or create room
  const handleStartDirectCall = async (friendProfile: UserProfile) => {
    if (!profile) return;
    // Direct call room name
    const roomName = `call_${[profile.id, friendProfile.id].sort().join('_')}`;
    setCallState({ active: true, roomName });
  };

  // Start call from ChatWindow
  const handleStartCallFromRoom = (isVideo: boolean) => {
    if (!activeRoom) return;
    setCallState({ active: true, roomName: `room_call_${activeRoom.id}` });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6b00] to-[#ea580c] flex items-center justify-center shadow-lg shadow-orange-600/30 animate-pulse">
            <Flame className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            Oit<span className="text-[#ff6b00]">.</span>
          </h2>
        </div>
      </div>
    );
  }

  // If not logged in, render Auth Modal
  if (!session || !profile) {
    return <AuthModal onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="h-screen w-screen bg-[#050505] flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation & Chat List */}
      <div
        className={`h-full w-full md:w-auto ${
          activeRoom ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatSidebar
          currentProfile={profile}
          rooms={rooms}
          friends={friends}
          activeRoom={activeRoom}
          onSelectRoom={(r) => setActiveRoom(r)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAddFriend={() => setShowAddFriendModal(true)}
          onOpenCreateGroup={() => setShowCreateGroupModal(true)}
          onStartDirectCall={handleStartDirectCall}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Chat Window */}
      <div
        className={`h-full flex-1 ${
          activeRoom ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeRoom ? (
          <ChatWindow
            room={activeRoom}
            currentProfile={profile}
            onBackMobile={() => setActiveRoom(null)}
            onStartCall={handleStartCallFromRoom}
          />
        ) : (
          <div className="flex-1 h-full bg-[#050505] flex flex-col items-center justify-center text-center p-8 border-l border-zinc-900">
            <div className="w-20 h-20 rounded-3xl bg-[#141417] border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
              <Flame className="w-10 h-10 text-[#ff6b00]" />
            </div>
            <h2 className="text-2xl font-black text-white">Selamat Datang di Oit!</h2>
            <p className="text-sm text-zinc-400 max-w-sm mt-2 leading-relaxed">
              Pilih obrolan di sebelah kiri atau tambah teman baru via username & QR Code untuk memulai komunikasi real-time.
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
          onFriendAdded={fetchData}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          currentProfile={profile}
          friends={friends}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={fetchData}
        />
      )}

      {/* LiveKit Voice/Video Call Modal */}
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
