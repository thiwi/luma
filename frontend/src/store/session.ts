import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface MoodConfig {
  id: string;
  lottie: string;
}

export interface SessionState {
  sessionId: string | null;
  isPremium: boolean;
  activeMoods: Record<string, MoodConfig>;
  presence: { [eventId: string]: number };
  setPremium: (v: boolean) => void;
  setPresence: (eventId: string, count: number) => void;
  initSession: () => Promise<void>;
}

const storageKey = 'sessionId';

export const useSession = create<SessionState>()(
  subscribeWithSelector((set, get) => ({
    sessionId: localStorage.getItem(storageKey),
    isPremium: false,
    activeMoods: {},
    presence: {},
    setPremium: (v) => set({ isPremium: v }),
    setPresence: (eventId, count) =>
      set((s) => ({ presence: { ...s.presence, [eventId]: count } })),
    initSession: async () => {
      if (get().sessionId) return;
      // backend exposes POST /api/session to create a new session
      const res = await fetch('/api/session', { method: 'POST' });
      const { sessionId } = await res.json();
      localStorage.setItem(storageKey, sessionId);
      set({ sessionId });
    },
  }))
);
