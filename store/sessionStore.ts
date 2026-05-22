import { create } from "zustand";

export interface Reading {
  speed: number;
  accel: number;
  lat: number;
  lon: number;
  timestamp: string;
  crashFlagged: boolean;
}

interface SessionStore {
  sessionId: string | null;
  isActive: boolean;
  readings: Reading[];
  location: { lat: number; lon: number } | null;
  setLocation: (loc: { lat: number; lon: number }) => void;
  setSessionId: (id: string) => void;
  addReading: (r: Reading) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  isActive: false,
  readings: [],
  location: null,
  setLocation: (location) => set({ location }),
  setSessionId: (id) => set({ sessionId: id, isActive: true }),
  addReading: (r) =>
    set((s) => ({ readings: [r, ...s.readings].slice(0, 10) })),
  endSession: () => set({ sessionId: null, isActive: false, readings: [] }),
}));
