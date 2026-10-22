import { getTrack } from '../data/catalog';
import { dayKey, type PlayEvent } from '../store/history';
import { usePrefsStore } from '../store/prefs';

/**
 * Every number the app shows about the user is computed here from the
 * real play-event log. Nothing is invented (PLAN §8, Mastery 4.9).
 */

export function totalSeconds(events: PlayEvent[]): number {
  return events.reduce((sum, e) => sum + e.seconds, 0);
}

export function countedPlays(events: PlayEvent[]): PlayEvent[] {
  return events.filter((e) => e.counted);
}

export function uniqueTracksPlayed(events: PlayEvent[]): number {
  return new Set(countedPlays(events).map((e) => e.trackId)).size;
}

export interface RankedArtist {
  artistId: string;
  plays: number;
  seconds: number;
}

export function topArtists(events: PlayEvent[], limit = 5): RankedArtist[] {
  const map = new Map<string, RankedArtist>();
  for (const e of countedPlays(events)) {
    const track = getTrack(e.trackId);
    if (!track) continue;
    const cur = map.get(track.artistId) ?? { artistId: track.artistId, plays: 0, seconds: 0 };
    cur.plays += 1;
    cur.seconds += e.seconds;
    map.set(track.artistId, cur);
  }
  return [...map.values()].sort((a, b) => b.seconds - a.seconds).slice(0, limit);
}

export function topGenreId(events: PlayEvent[]): string | null {
  const map = new Map<string, number>();
  for (const e of countedPlays(events)) {
    const track = getTrack(e.trackId);
    if (!track) continue;
    map.set(track.genreId, (map.get(track.genreId) ?? 0) + e.seconds);
  }
  let best: string | null = null;
  let bestVal = 0;
  for (const [g, v] of map) {
    if (v > bestVal) {
      best = g;
      bestVal = v;
    }
  }
  return best;
}

/** Distinct days (YYYY-MM-DD) with at least one counted play. */
export function listeningDays(events: PlayEvent[]): Set<string> {
  return new Set(countedPlays(events).map((e) => e.day));
}

function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return dayKey(d);
}

/**
 * Streak sync: walk back from yesterday; a missing day consumes a freeze
 * (once — frozenDays remembers) instead of breaking the streak. This is
 * Duolingo's mercy valve, automatic and visible in Stats. Returns the
 * current streak length in days (today counts once played).
 */
export function syncStreak(events: PlayEvent[]): number {
  const days = listeningDays(events);
  const prefs = usePrefsStore.getState();
  const today = dayKey();
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  // Safety bound: never walk more than a year.
  for (let i = 0; i < 366; i++) {
    if (days.has(cursor) || prefs.frozenDays.includes(cursor)) {
      streak += 1;
      cursor = shiftDay(cursor, -1);
      continue;
    }
    // A gap day: spend a freeze if one is available and the streak is alive.
    if (streak > 0 && prefs.streakFreezes > 0) {
      prefs.useFreeze(cursor);
      streak += 1;
      cursor = shiftDay(cursor, -1);
      continue;
    }
    break;
  }
  return streak;
}

export function playedToday(events: PlayEvent[]): boolean {
  return listeningDays(events).has(dayKey());
}

/** Compact count formatting: 18420311 → "18.4M", 9841 → "9,841". */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-US');
}

export function formatMinutes(totalSec: number): string {
  const mins = Math.round(totalSec / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }
  return `${mins} min`;
}
