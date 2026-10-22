import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Plan = 'free' | 'premium';

interface PrefsState {
  onboarded: boolean;
  tasteArtistIds: string[];
  tasteGenreIds: string[];
  plan: Plan;
  /** Listening-day streak freezes remaining (the mercy valve, shown in Stats). */
  streakFreezes: number;
  /** Days a freeze was auto-applied to, so a gap day is only charged once. */
  frozenDays: string[];
  sessionsCount: number;
  notifAsked: boolean;
  crossfade: number; // seconds 0..6 — fade-out/fade-in on track transitions
  dataSaver: boolean;
  notifWeekly: boolean;
  notifReleases: boolean;
  completeOnboarding: (artistIds: string[], genreIds: string[]) => void;
  setPlan: (plan: Plan) => void;
  useFreeze: (day: string) => void;
  grantFreeze: () => void;
  bumpSession: () => void;
  setNotifAsked: () => void;
  setCrossfade: (v: number) => void;
  setDataSaver: (v: boolean) => void;
  setNotifWeekly: (v: boolean) => void;
  setNotifReleases: (v: boolean) => void;
  reset: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      onboarded: false,
      tasteArtistIds: [],
      tasteGenreIds: [],
      plan: 'free',
      streakFreezes: 2,
      frozenDays: [],
      sessionsCount: 0,
      notifAsked: false,
      crossfade: 0,
      dataSaver: false,
      notifWeekly: true,
      notifReleases: true,
      completeOnboarding: (artistIds, genreIds) => set({ onboarded: true, tasteArtistIds: artistIds, tasteGenreIds: genreIds }),
      setPlan: (plan) => set({ plan }),
      useFreeze: (day) =>
        set((s) =>
          s.frozenDays.includes(day)
            ? s
            : { streakFreezes: Math.max(0, s.streakFreezes - 1), frozenDays: [...s.frozenDays, day] },
        ),
      grantFreeze: () => set((s) => ({ streakFreezes: Math.min(2, s.streakFreezes + 1) })),
      bumpSession: () => set((s) => ({ sessionsCount: s.sessionsCount + 1 })),
      setNotifAsked: () => set({ notifAsked: true }),
      setCrossfade: (v) => set({ crossfade: v }),
      setDataSaver: (v) => set({ dataSaver: v }),
      setNotifWeekly: (v) => set({ notifWeekly: v }),
      setNotifReleases: (v) => set({ notifReleases: v }),
      reset: () =>
        set({
          onboarded: false,
          tasteArtistIds: [],
          tasteGenreIds: [],
          plan: 'free',
          streakFreezes: 2,
          frozenDays: [],
          sessionsCount: 0,
          notifAsked: false,
          crossfade: 0,
          dataSaver: false,
          notifWeekly: true,
          notifReleases: true,
        }),
    }),
    { name: 'waveform-prefs', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
