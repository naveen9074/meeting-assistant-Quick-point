import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  activeSessionId: string | null;
  activeSessionTitle: string | null;
  setActiveSession: (id: string, title: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      activeSessionTitle: null,
      setActiveSession: (id, title) => set({ activeSessionId: id, activeSessionTitle: title }),
      clearSession: () => set({ activeSessionId: null, activeSessionTitle: null }),
    }),
    { name: 'quickpoint-session' }
  )
);
