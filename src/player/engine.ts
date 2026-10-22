import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';

/**
 * Playback engine — owns the single expo-audio player instance.
 * The player store (src/store/player.ts) drives it; UI never touches it.
 * Background playback is intentionally NOT enabled (plan decision,
 * 2026-10-22): foreground playback in Expo Go.
 */
let player: AudioPlayer | null = null;
let statusHandler: ((status: AudioStatus) => void) | null = null;
let loadedUrl: string | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

export function initEngine(onStatus: (status: AudioStatus) => void) {
  statusHandler = onStatus;
  if (player) return;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }).catch(() => {});
  player = createAudioPlayer(null, { updateInterval: 500 });
  player.addListener('playbackStatusUpdate', (status) => {
    statusHandler?.(status);
  });
}

function ensure(): AudioPlayer {
  if (!player) throw new Error('engine not initialised');
  return player;
}

export function engineLoadedUrl() {
  return loadedUrl;
}

export function loadTrack(url: string, autoplay: boolean, seekSeconds = 0) {
  const p = ensure();
  stopFade();
  p.volume = 1;
  loadedUrl = url;
  p.replace({ uri: url });
  if (seekSeconds > 0) p.seekTo(seekSeconds);
  if (autoplay) p.play();
}

export function enginePlay() {
  ensure().play();
}

export function enginePause() {
  ensure().pause();
}

export function engineSeek(seconds: number) {
  ensure().seekTo(Math.max(0, seconds));
}

function stopFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

/** Fade volume to 0 over `ms`, run `done`, caller restarts playback. */
export function fadeOut(ms: number, done: () => void) {
  const p = ensure();
  stopFade();
  if (ms <= 0) {
    done();
    return;
  }
  const steps = 10;
  const stepMs = ms / steps;
  let i = 0;
  fadeTimer = setInterval(() => {
    i += 1;
    try {
      p.volume = Math.max(0, 1 - i / steps);
    } catch {
      /* player released */
    }
    if (i >= steps) {
      stopFade();
      done();
    }
  }, stepMs);
}

/** Fade volume from 0 to 1 over `ms` (call right after play). */
export function fadeIn(ms: number) {
  const p = ensure();
  stopFade();
  if (ms <= 0) {
    p.volume = 1;
    return;
  }
  const steps = 10;
  const stepMs = ms / steps;
  let i = 0;
  try {
    p.volume = 0;
  } catch {
    return;
  }
  fadeTimer = setInterval(() => {
    i += 1;
    try {
      p.volume = Math.min(1, i / steps);
    } catch {
      /* player released */
    }
    if (i >= steps) stopFade();
  }, stepMs);
}
