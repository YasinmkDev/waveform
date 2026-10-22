import { ALBUMS, PLAYLISTS, TRACKS, getAlbum, getPlaylist, getTrack, type Playlist } from '../data/catalog';
import type { PlayEvent } from '../store/history';
import { countedPlays } from './stats';

/**
 * Algorithmic intimacy, honestly: every "made for you" surface in the app
 * is generated here from the user's own data — taste picks from
 * onboarding, likes, and the play log (completions vs <30s skips).
 * No server, no fake intelligence: weighted scoring over the catalog.
 */

export interface TasteProfile {
  genreWeights: Map<string, number>;
  artistWeights: Map<string, number>;
  /** Track ids the user bailed on before 30s — negative signal. */
  skippedTrackIds: Set<string>;
  likedTrackIds: Set<string>;
}

export function buildTaste(
  events: PlayEvent[],
  opts: { tasteArtistIds: string[]; tasteGenreIds: string[]; likedTrackIds: string[] },
): TasteProfile {
  const genreWeights = new Map<string, number>();
  const artistWeights = new Map<string, number>();
  const add = (map: Map<string, number>, key: string, by: number) =>
    map.set(key, (map.get(key) ?? 0) + by);

  for (const g of opts.tasteGenreIds) add(genreWeights, g, 3);
  for (const a of opts.tasteArtistIds) add(artistWeights, a, 3);
  for (const id of opts.likedTrackIds) {
    const t = getTrack(id);
    if (t) {
      add(genreWeights, t.genreId, 2);
      add(artistWeights, t.artistId, 2);
    }
  }
  for (const e of events) {
    const t = getTrack(e.trackId);
    if (!t) continue;
    if (e.counted) {
      add(genreWeights, t.genreId, 1);
      add(artistWeights, t.artistId, 1);
    }
  }
  const skipped = new Set(
    events.filter((e) => !e.counted && e.seconds >= 3 && e.seconds < 30).map((e) => e.trackId),
  );
  return { genreWeights, artistWeights, skippedTrackIds: skipped, likedTrackIds: new Set(opts.likedTrackIds) };
}

function scoreTrack(taste: TasteProfile, trackId: string): number {
  const t = getTrack(trackId);
  if (!t) return 0;
  let score =
    (taste.genreWeights.get(t.genreId) ?? 0) * 2 + (taste.artistWeights.get(t.artistId) ?? 0) * 3;
  if (taste.skippedTrackIds.has(trackId)) score -= 6;
  if (taste.likedTrackIds.has(trackId)) score -= 2; // a mix should still surprise a little
  return score;
}

/** Deterministic PRNG so a given week's mix is stable all week. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoWeekSeed(d = new Date()): number {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return d.getFullYear() * 100 + week;
}

/**
 * Your Weekly Mix: top-taste tracks the user has NOT counted-played in
 * the last 14 days, lightly shuffled by the week seed. Falls back to the
 * catalog's seed list before any data exists.
 */
export function generateWeeklyMix(events: PlayEvent[], taste: TasteProfile, count = 8): string[] {
  const cutoff = Date.now() - 14 * 86400000;
  const recentlyPlayed = new Set(countedPlays(events).filter((e) => e.at > cutoff).map((e) => e.trackId));
  const pool = TRACKS.map((t) => t.id).filter((id) => !recentlyPlayed.has(id));
  const source = pool.length >= 4 ? pool : TRACKS.map((t) => t.id);
  const rand = mulberry32(isoWeekSeed());
  return source
    .map((id) => ({ id, score: scoreTrack(taste, id) + rand() * 4 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.id);
}

/** A personal "jump back in" mix for cold starts: taste artists first. */
export function generateTasteMix(taste: TasteProfile, count = 8): string[] {
  const rand = mulberry32(42);
  return TRACKS.map((t) => t.id)
    .map((id) => ({ id, score: scoreTrack(taste, id) + rand() * 3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.id);
}

export interface ResumeContext {
  label: string;
  trackIds: string[];
  cover: string;
}

/**
 * Resume grid data: most recent play contexts (from event ctxLabels),
 * resolved back to their track lists; falls back to the track's album.
 */
export function resumeContexts(events: PlayEvent[], limit = 6): ResumeContext[] {
  const out: ResumeContext[] = [];
  const seen = new Set<string>();
  const byLabel = new Map<string, string[]>();
  for (const p of PLAYLISTS) byLabel.set(p.title, p.trackIds);
  for (const a of ALBUMS) byLabel.set(a.title, a.trackIds);

  for (const e of [...events].reverse()) {
    if (out.length >= limit) break;
    const label = e.ctxLabel ?? getAlbum(getTrack(e.trackId)?.albumId ?? '')?.title;
    if (!label || seen.has(label)) continue;
    const trackIds = byLabel.get(label);
    if (!trackIds?.length) continue;
    seen.add(label);
    const playlist = PLAYLISTS.find((p) => p.title === label);
    const album = ALBUMS.find((a) => a.title === label);
    out.push({ label, trackIds, cover: playlist?.cover ?? album?.cover ?? 'playlist-top-hits' });
  }
  return out;
}

/** Home shelf ordering signal: genres ranked by taste weight. */
export function topTasteGenres(taste: TasteProfile, limit = 3): string[] {
  return [...taste.genreWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([g]) => g);
}

export function weeklyMixPlaylist(events: PlayEvent[], taste: TasteProfile): Playlist {
  const base = getPlaylist('weekly-mix') as Playlist;
  return { ...base, trackIds: generateWeeklyMix(events, taste) };
}
