import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudioStatus } from 'expo-audio';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getTrack } from '../data/catalog';
import { engineLoadedUrl, enginePause, enginePlay, engineSeek, fadeIn, fadeOut, loadTrack } from '../player/engine';
import { useHistoryStore } from './history';
import { usePrefsStore } from './prefs';
import { useUiStore } from './ui';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  queue: string[];
  baseQueue: string[];
  index: number;
  contextLabel: string;
  /** Direction of the last track change — drives Now Playing slide direction. */
  lastNavDirection: 'next' | 'prev' | null;
  shuffle: boolean;
  repeat: RepeatMode;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  ended: boolean;
  playContext: (trackIds: string[], startIndex: number, label: string) => void;
  togglePlay: () => void;
  next: (manual?: boolean) => void;
  prev: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (trackId: string) => void;
  removeFromQueue: (i: number) => void;
  moveQueueItem: (from: number, to: number) => void;
  clearQueue: () => void;
  replayQueue: () => void;
  resetPlayback: () => void;
  _onStatus: (status: AudioStatus) => void;
}

/** Non-persisted scratch state for the live session. */
let maxPosition = 0;
let finishHandled = false;
let startedTrackId: string | null = null;
let recentErrors: number[] = [];
/** Context label of the track currently loaded — history events carry it. */
let activeCtxLabel = '';

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function flushHistory(ctxLabel: string) {
  if (startedTrackId && maxPosition >= 1) {
    useHistoryStore.getState().recordPlay(startedTrackId, maxPosition, ctxLabel || undefined);
  }
  maxPosition = 0;
}

function startTrack(
  set: (p: Partial<PlayerState>) => void,
  get: () => PlayerState,
  autoplay = true,
  prevCtxLabel = activeCtxLabel,
) {
  const { queue, index } = get();
  const track = getTrack(queue[index]);
  if (!track) return;
  flushHistory(prevCtxLabel);
  startedTrackId = track.id;
  finishHandled = false;
  loadTrack(track.audioUrl, autoplay, 0);
  if (autoplay) {
    const prefs = usePrefsStore.getState();
    const cap = prefs.plan === 'premium' ? 6 : 2;
    const fade = Math.min(prefs.crossfade, cap);
    if (fade > 0) fadeIn(fade * 1000);
  }
  set({ position: 0, duration: track.duration, ended: false, isBuffering: autoplay });
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      baseQueue: [],
      index: 0,
      contextLabel: '',
      lastNavDirection: null,
      shuffle: false,
      repeat: 'off',
      isPlaying: false,
      isBuffering: false,
      position: 0,
      duration: 0,
      ended: false,

      playContext: (trackIds, startIndex, label) => {
        if (!trackIds.length) return;
        const startId = trackIds[startIndex];
        let queue = [...trackIds];
        let index = startIndex;
        if (get().shuffle) {
          const rest = shuffled(trackIds.filter((id) => id !== startId));
          queue = [startId, ...rest];
          index = 0;
        }
        const prevCtx = activeCtxLabel;
        activeCtxLabel = label;
        set({ queue, baseQueue: [...trackIds], index, contextLabel: label, lastNavDirection: null });
        startTrack(set, get, true, prevCtx);
        set({ isPlaying: true });
      },

      togglePlay: () => {
        const s = get();
        const track = getTrack(s.queue[s.index]);
        if (!track) return;
        if (s.isPlaying) {
          enginePause();
          set({ isPlaying: false });
          return;
        }
        if (s.ended) {
          get().replayQueue();
          return;
        }
        if (engineLoadedUrl() !== track.audioUrl) {
          // Cold start after an app restart: reload where we left off.
          activeCtxLabel = s.contextLabel;
          startedTrackId = track.id;
          finishHandled = false;
          loadTrack(track.audioUrl, true, s.position > 1 ? s.position : 0);
        } else {
          enginePlay();
        }
        set({ isPlaying: true });
      },

      next: (manual = true) => {
        const s = get();
        if (!s.queue.length) return;
        const fade = manual ? 0.15 : 0;
        const advance = () => {
          if (s.index < s.queue.length - 1) {
            set({ index: s.index + 1, lastNavDirection: 'next' });
            startTrack(set, get, true);
            set({ isPlaying: true });
          } else if (s.repeat === 'all') {
            set({ index: 0, lastNavDirection: 'next' });
            startTrack(set, get, true);
            set({ isPlaying: true });
          } else {
            flushHistory(activeCtxLabel);
            startedTrackId = null;
            enginePause();
            set({ isPlaying: false, ended: true, position: s.duration });
          }
        };
        if (fade > 0 && s.isPlaying) fadeOut(fade * 1000, advance);
        else advance();
      },

      prev: () => {
        const s = get();
        if (!s.queue.length) return;
        if (s.position > 3) {
          engineSeek(0);
          maxPosition = 0;
          set({ position: 0, ended: false });
          if (!s.isPlaying) {
            enginePlay();
            set({ isPlaying: true });
          }
          return;
        }
        if (s.index > 0) {
          set({ index: s.index - 1, lastNavDirection: 'prev' });
          startTrack(set, get, true);
          set({ isPlaying: true });
        } else {
          engineSeek(0);
          set({ position: 0 });
        }
      },

      seek: (seconds) => {
        engineSeek(seconds);
        set({ position: seconds, ended: false });
        if (seconds > maxPosition) maxPosition = seconds;
      },

      toggleShuffle: () => {
        const s = get();
        const currentId = s.queue[s.index];
        if (!currentId) {
          set({ shuffle: !s.shuffle });
          return;
        }
        if (!s.shuffle) {
          const rest = shuffled(s.baseQueue.filter((id) => id !== currentId));
          set({ shuffle: true, queue: [currentId, ...rest], index: 0 });
        } else {
          const idx = s.baseQueue.indexOf(currentId);
          set({ shuffle: false, queue: [...s.baseQueue], index: idx >= 0 ? idx : 0 });
        }
      },

      cycleRepeat: () => {
        const order: RepeatMode[] = ['off', 'all', 'one'];
        const nextMode = order[(order.indexOf(get().repeat) + 1) % order.length];
        set({ repeat: nextMode });
      },

      addToQueue: (trackId) => {
        const s = get();
        if (!s.queue.length) {
          get().playContext([trackId], 0, 'Queue');
          return;
        }
        const queue = [...s.queue];
        queue.splice(s.index + 1, 0, trackId);
        const baseQueue = s.baseQueue.includes(trackId) ? s.baseQueue : [...s.baseQueue, trackId];
        set({ queue, baseQueue });
        useUiStore.getState().showToast('Added to queue');
      },

      removeFromQueue: (i) => {
        const s = get();
        if (i === s.index || i < 0 || i >= s.queue.length) return;
        const queue = s.queue.filter((_, idx) => idx !== i);
        set({ queue, index: i < s.index ? s.index - 1 : s.index });
      },

      moveQueueItem: (from, to) => {
        const s = get();
        if (from === to || from < 0 || to < 0 || from >= s.queue.length || to >= s.queue.length) return;
        const queue = [...s.queue];
        const [moved] = queue.splice(from, 1);
        queue.splice(to, 0, moved);
        let index = s.index;
        if (from === s.index) index = to;
        else if (from < s.index && to >= s.index) index = s.index - 1;
        else if (from > s.index && to <= s.index) index = s.index + 1;
        set({ queue, index });
      },

      clearQueue: () => {
        const s = get();
        const current = s.queue[s.index];
        if (!current) return;
        set({ queue: [current], baseQueue: [current], index: 0 });
      },

      replayQueue: () => {
        const s = get();
        if (!s.queue.length) return;
        set({ index: 0, ended: false });
        startTrack(set, get, true);
        set({ isPlaying: true });
      },

      resetPlayback: () => {
        try {
          enginePause();
        } catch {
          /* engine not started yet */
        }
        startedTrackId = null;
        activeCtxLabel = '';
        maxPosition = 0;
        set({
          queue: [],
          baseQueue: [],
          index: 0,
          contextLabel: '',
          lastNavDirection: null,
          isPlaying: false,
          isBuffering: false,
          position: 0,
          duration: 0,
          ended: false,
        });
      },

      _onStatus: (status) => {
        const s = get();
        if (status.error) {
          const now = Date.now();
          recentErrors = [...recentErrors.filter((t) => now - t < 5000), now];
          if (recentErrors.length <= 3) {
            useUiStore.getState().showToast("Couldn't load that track — skipped");
            s.next(false);
          } else {
            enginePause();
            set({ isPlaying: false });
            useUiStore.getState().showToast('Playback problem — check your connection');
          }
          return;
        }
        if (status.currentTime > maxPosition) maxPosition = status.currentTime;
        const patch: Partial<PlayerState> = {
          position: status.currentTime,
          isBuffering: status.isBuffering,
        };
        if (status.duration > 0) patch.duration = status.duration;
        if (status.playing !== s.isPlaying && engineLoadedUrl()) patch.isPlaying = status.playing;
        set(patch);
        if (status.didJustFinish && !finishHandled) {
          finishHandled = true;
          const cur = get();
          if (cur.repeat === 'one') {
            flushHistory(activeCtxLabel);
            startedTrackId = cur.queue[cur.index] ?? null;
            maxPosition = 0;
            finishHandled = false;
            engineSeek(0);
            enginePlay();
            set({ position: 0, isPlaying: true, ended: false });
          } else {
            cur.next(false);
          }
        }
      },
    }),
    {
      name: 'waveform-player',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        queue: s.queue,
        baseQueue: s.baseQueue,
        index: s.index,
        contextLabel: s.contextLabel,
        shuffle: s.shuffle,
        repeat: s.repeat,
        position: s.position,
      }),
    },
  ),
);

export function currentTrackId(): string | undefined {
  const s = usePlayerStore.getState();
  return s.queue[s.index];
}
