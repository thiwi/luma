import { create } from 'zustand';
import { apiFetch } from '../api/http';
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
  initSession: (force?: boolean) => Promise<void>;
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
    initSession: async (force?: boolean) => {
      if (get().sessionId && !force) return;
      // backend exposes POST /session to create a new session
      // response payload is {"token": "<session token>"}
      const res = await apiFetch('/session', { method: 'POST' });
      const { token } = await res.json();
      localStorage.setItem(storageKey, token);
      set({ sessionId: token });
    },
  }))
);
