import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PlayEvent {
  trackId: string;
  /** Local date key, YYYY-MM-DD — streaks are computed from these. */
  day: string;
  /** Epoch ms when this play session of the track started. */
  at: number;
  /** Seconds actually listened (max position reached). */
  seconds: number;
  /** Reached 30s or finished — counts as a real play. */
  counted: boolean;
}

interface HistoryState {
  events: PlayEvent[];
  recordPlay: (trackId: string, seconds: number) => void;
  reset: () => void;
}

export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MAX_EVENTS = 2000;

/**
 * Append-only listening history. Every stat, streak, mix and the resume
 * grid are pure functions over these events (src/lib/stats.ts, mix.ts) —
 * the app never invents a number it shows the user.
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      events: [],
      recordPlay: (trackId, seconds) =>
        set((s) => ({
          events: [
            ...s.events.slice(-(MAX_EVENTS - 1)),
            { trackId, day: dayKey(), at: Date.now(), seconds: Math.round(seconds), counted: seconds >= 30 },
          ],
        })),
      reset: () => set({ events: [] }),
    }),
    { name: 'waveform-history', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
