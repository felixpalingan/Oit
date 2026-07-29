import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isMobileDrawerOpen: boolean;

  setActiveServer: (id: string | null) => void;
  setActiveChannel: (id: string | null, name?: string) => void;
  setActiveCall: (roomId: string | null, targetUser?: any, isVideo?: boolean) => void;
  setIsCallMinimized: (minimized: boolean) => void;
  setKnockNotification: (knock: KnockRequest | null) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  clearCall: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeServerId: null,
      activeChannelId: null,
      activeChannelName: '',
      activeCallRoomId: null,
      activeCallTargetUser: null,
      isCallVideo: true,
      isCallMinimized: false,
      knockNotification: null,
      isMobileDrawerOpen: false,

      setActiveServer: (id) => set({ activeServerId: id }),
      setActiveChannel: (id, name) =>
        set((state) => ({
          activeChannelId: id,
          activeChannelName: name !== undefined ? name : state.activeChannelName,
        })),
      setActiveCall: (roomId, targetUser = null, isVideo = true) =>
        set({
          activeCallRoomId: roomId,
          activeCallTargetUser: targetUser,
          isCallVideo: isVideo,
          isCallMinimized: false,
        }),
      setIsCallMinimized: (minimized) => set({ isCallMinimized: minimized }),
      setKnockNotification: (knock) => set({ knockNotification: knock }),
      setIsMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
      clearCall: () =>
        set({
          activeCallRoomId: null,
          activeCallTargetUser: null,
          isCallMinimized: false,
        }),
    }),
    {
      name: 'oit-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeServerId: state.activeServerId,
        activeChannelId: state.activeChannelId,
        activeChannelName: state.activeChannelName,
      }),
    }
  )
);
