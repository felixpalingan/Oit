import { create } from 'zustand';

export interface KnockRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  roomName: string;
  targetRoomTitle: string;
}

interface AppState {
  activeServerId: string | null;
  activeChannelId: string | null;
  activeChannelName: string;
  activeCallRoomId: string | null;
  activeCallTargetUser: any | null;
  isCallVideo: boolean;
  isCallMinimized: boolean;
  knockNotification: KnockRequest | null;

  setActiveServer: (id: string | null) => void;
  setActiveChannel: (id: string | null, name?: string) => void;
  setActiveCall: (roomId: string | null, targetUser?: any, isVideo?: boolean) => void;
  setIsCallMinimized: (minimized: boolean) => void;
  setKnockNotification: (knock: KnockRequest | null) => void;
  clearCall: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeServerId: 'design-team',
  activeChannelId: 'ui-ux-sync',
  activeChannelName: 'ui-ux-sync',
  activeCallRoomId: null,
  activeCallTargetUser: null,
  isCallVideo: true,
  isCallMinimized: false,
  knockNotification: null,

  setActiveServer: (id) => set({ activeServerId: id }),
  setActiveChannel: (id, name) =>
    set({
      activeChannelId: id,
      activeChannelName: name || id || 'ui-ux-sync',
    }),
  setActiveCall: (roomId, targetUser = null, isVideo = true) =>
    set({
      activeCallRoomId: roomId,
      activeCallTargetUser: targetUser,
      isCallVideo: isVideo,
      isCallMinimized: false,
    }),
  setIsCallMinimized: (minimized) => set({ isCallMinimized: minimized }),
  setKnockNotification: (knock) => set({ knockNotification: knock }),
  clearCall: () =>
    set({
      activeCallRoomId: null,
      activeCallTargetUser: null,
      isCallMinimized: false,
    }),
}));
