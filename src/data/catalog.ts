/**
 * Waveform sample catalog — original fictional artists, albums and tracks.
 * Audio: the 16 SoundHelix example songs (T. Schürger, CC-BY) streamed from
 * soundhelix.com; durations verified with ffprobe 2026-10-22. See
 * docs/CONTENT.md for sources and licenses. Artwork: generated locally,
 * see src/data/artwork.ts.
 */

export interface Genre {
  id: string;
  name: string;
  color: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  monthlyListeners: number;
  genreIds: string[];
  bio: string;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  cover: string;
  /** Dark flat tint derived from the cover — Now Playing background wash. */
  tint: string;
  year: number;
  trackIds: string[];
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  duration: number; // seconds
  audioUrl: string;
  genreId: string;
  playCount: number; // sample editorial number, drives "Popular" lists
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  trackIds: string[];
  kind: 'mix' | 'editorial';
  owner: string;
}

const helix = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

export const GENRES: Genre[] = [
  { id: 'electronic', name: 'Electronic', color: '#E8115B' },
  { id: 'synthwave', name: 'Synthwave', color: '#7358FF' },
  { id: 'ambient', name: 'Ambient', color: '#477D95' },
  { id: 'chill', name: 'Chill', color: '#2D7D8C' },
  { id: 'cinematic', name: 'Cinematic', color: '#1E3264' },
  { id: 'dance', name: 'Dance', color: '#E13300' },
  { id: 'downtempo', name: 'Downtempo', color: '#8D67AB' },
  { id: 'focus', name: 'Focus', color: '#0E7A3D' },
  { id: 'indie', name: 'Indie Electronic', color: '#BA5D07' },
  { id: 'workout', name: 'Workout', color: '#B02868' },
];

export const ARTISTS: Artist[] = [
  { id: 'nova-reina', name: 'Nova Reina', image: 'artist-nova-reina', monthlyListeners: 2841204, genreIds: ['synthwave', 'electronic'], bio: 'Neon-soaked synthwave from the night-drive school. Nova Reina builds every track like a city at 2 a.m.' },
  { id: 'atlas-grey', name: 'Atlas Grey', image: 'artist-atlas-grey', monthlyListeners: 1930877, genreIds: ['cinematic', 'electronic'], bio: 'Widescreen electronic scores for journeys that have not happened yet.' },
  { id: 'mira-sol', name: 'Mira Sol', image: 'artist-mira-sol', monthlyListeners: 1204550, genreIds: ['ambient', 'chill'], bio: 'Slow music for slow water. Mira Sol records at dawn, on purpose.' },
  { id: 'paper-lanterns', name: 'Paper Lanterns', image: 'artist-paper-lanterns', monthlyListeners: 964210, genreIds: ['indie', 'chill'], bio: 'Festival-hearted indie electronic — handmade synths, borrowed drums, open windows.' },
  { id: 'vector-club', name: 'Vector Club', image: 'artist-vector-club', monthlyListeners: 2210930, genreIds: ['dance', 'electronic'], bio: 'Terminal-velocity dance music. Vector Club does not believe in breakdowns.' },
  { id: 'sable-june', name: 'Sable & June', image: 'artist-sable-june', monthlyListeners: 845903, genreIds: ['downtempo', 'chill'], bio: 'Downtempo duets for copper skies. Half tape hiss, half heartbeat.' },
  { id: 'orion-fields', name: 'Orion Fields', image: 'artist-orion-fields', monthlyListeners: 1523771, genreIds: ['focus', 'ambient'], bio: 'Music engineered to disappear under deep work — and hold it up.' },
  { id: 'midnight-arcade', name: 'Midnight Arcade', image: 'artist-midnight-arcade', monthlyListeners: 1788654, genreIds: ['electronic', 'synthwave'], bio: 'High-score electronic. Every track is a final level.' },
];

export const TRACKS: Track[] = [
  { id: 't-meridian', title: 'Midnight Meridian', artistId: 'nova-reina', albumId: 'neon-meridian', duration: 373, audioUrl: helix(1), genreId: 'synthwave', playCount: 18420311 },
  { id: 't-ultraviolet', title: 'Ultraviolet Run', artistId: 'nova-reina', albumId: 'neon-meridian', duration: 421, audioUrl: helix(7), genreId: 'synthwave', playCount: 12047782 },
  { id: 't-northbound', title: 'Northbound', artistId: 'atlas-grey', albumId: 'cartographer', duration: 527, audioUrl: helix(10), genreId: 'cinematic', playCount: 15220984 },
  { id: 't-long-survey', title: 'The Long Survey', artistId: 'atlas-grey', albumId: 'cartographer', duration: 470, audioUrl: helix(13), genreId: 'cinematic', playCount: 8930412 },
  { id: 't-paper-moon', title: 'Paper Moon', artistId: 'mira-sol', albumId: 'slow-tides', duration: 280, audioUrl: helix(6), genreId: 'ambient', playCount: 11048203 },
  { id: 't-salt-cedar', title: 'Salt & Cedar', artistId: 'mira-sol', albumId: 'slow-tides', duration: 344, audioUrl: helix(3), genreId: 'ambient', playCount: 7655119 },
  { id: 't-lantern-parade', title: 'Lantern Parade', artistId: 'paper-lanterns', albumId: 'festival-lights', duration: 426, audioUrl: helix(2), genreId: 'indie', playCount: 9841207 },
  { id: 't-fireworks', title: 'Fireworks in June', artistId: 'paper-lanterns', albumId: 'festival-lights', duration: 354, audioUrl: helix(5), genreId: 'indie', playCount: 6902338 },
  { id: 't-afterburn', title: 'Afterburn', artistId: 'vector-club', albumId: 'terminal-velocity', duration: 325, audioUrl: helix(8), genreId: 'dance', playCount: 13997645 },
  { id: 't-night-terminal', title: 'Night Terminal', artistId: 'vector-club', albumId: 'terminal-velocity', duration: 551, audioUrl: helix(11), genreId: 'dance', playCount: 10553091 },
  { id: 't-copper-sky', title: 'Copper Sky', artistId: 'sable-june', albumId: 'velvet-static', duration: 303, audioUrl: helix(4), genreId: 'downtempo', playCount: 8214556 },
  { id: 't-slow-parade', title: 'Slow Parade', artistId: 'sable-june', albumId: 'velvet-static', duration: 389, audioUrl: helix(9), genreId: 'downtempo', playCount: 5941870 },
  { id: 't-field-notes', title: 'Field Notes', artistId: 'orion-fields', albumId: 'deep-focus', duration: 514, audioUrl: helix(12), genreId: 'focus', playCount: 12830417 },
  { id: 't-quiet-machinery', title: 'Quiet Machinery', artistId: 'orion-fields', albumId: 'deep-focus', duration: 438, audioUrl: helix(15), genreId: 'focus', playCount: 9012774 },
  { id: 't-high-score', title: 'High Score', artistId: 'midnight-arcade', albumId: 'insert-coin', duration: 516, audioUrl: helix(14), genreId: 'electronic', playCount: 16742908 },
  { id: 't-final-level', title: 'Final Level', artistId: 'midnight-arcade', albumId: 'insert-coin', duration: 483, audioUrl: helix(16), genreId: 'electronic', playCount: 13408662 },
];

export const ALBUMS: Album[] = [
  { id: 'neon-meridian', title: 'Neon Meridian', artistId: 'nova-reina', cover: 'album-neon-meridian', tint: '#10131F', year: 2025, trackIds: ['t-meridian', 't-ultraviolet'] },
  { id: 'cartographer', title: 'Cartographer', artistId: 'atlas-grey', cover: 'album-cartographer', tint: '#0E1A1A', year: 2024, trackIds: ['t-northbound', 't-long-survey'] },
  { id: 'slow-tides', title: 'Slow Tides', artistId: 'mira-sol', cover: 'album-slow-tides', tint: '#123B4C', year: 2025, trackIds: ['t-paper-moon', 't-salt-cedar'] },
  { id: 'festival-lights', title: 'Festival Lights', artistId: 'paper-lanterns', cover: 'album-festival-lights', tint: '#1D1033', year: 2023, trackIds: ['t-lantern-parade', 't-fireworks'] },
  { id: 'terminal-velocity', title: 'Terminal Velocity', artistId: 'vector-club', cover: 'album-terminal-velocity', tint: '#1A1214', year: 2025, trackIds: ['t-afterburn', 't-night-terminal'] },
  { id: 'velvet-static', title: 'Velvet Static', artistId: 'sable-june', cover: 'album-velvet-static', tint: '#221C26', year: 2024, trackIds: ['t-copper-sky', 't-slow-parade'] },
  { id: 'deep-focus', title: 'Deep Focus', artistId: 'orion-fields', cover: 'album-deep-focus', tint: '#0B2027', year: 2025, trackIds: ['t-field-notes', 't-quiet-machinery'] },
  { id: 'insert-coin', title: 'Insert Coin', artistId: 'midnight-arcade', cover: 'album-insert-coin', tint: '#160F29', year: 2024, trackIds: ['t-high-score', 't-final-level'] },
];

export const PLAYLISTS: Playlist[] = [
  { id: 'daily-mix-01', title: 'Daily Mix 01', description: 'Nova Reina, Vector Club, Midnight Arcade and more', cover: 'playlist-daily-mix-01', kind: 'mix', owner: 'Waveform', trackIds: ['t-meridian', 't-afterburn', 't-high-score', 't-ultraviolet', 't-night-terminal'] },
  { id: 'daily-mix-02', title: 'Daily Mix 02', description: 'Paper Lanterns, Sable & June, Atlas Grey and more', cover: 'playlist-daily-mix-02', kind: 'mix', owner: 'Waveform', trackIds: ['t-lantern-parade', 't-copper-sky', 't-northbound', 't-fireworks', 't-slow-parade'] },
  { id: 'daily-mix-03', title: 'Daily Mix 03', description: 'Mira Sol, Orion Fields, Sable & June and more', cover: 'playlist-daily-mix-03', kind: 'mix', owner: 'Waveform', trackIds: ['t-paper-moon', 't-field-notes', 't-salt-cedar', 't-quiet-machinery', 't-copper-sky'] },
  { id: 'weekly-mix', title: 'Your Weekly Mix', description: 'Fresh picks made from your likes and plays', cover: 'playlist-weekly-mix', kind: 'mix', owner: 'Waveform', trackIds: ['t-ultraviolet', 't-long-survey', 't-fireworks', 't-quiet-machinery', 't-final-level', 't-salt-cedar'] },
  { id: 'night-drive', title: 'Night Drive', description: 'Synthwave for empty highways', cover: 'playlist-night-drive', kind: 'editorial', owner: 'Waveform', trackIds: ['t-meridian', 't-ultraviolet', 't-high-score', 't-final-level', 't-night-terminal', 't-afterburn'] },
  { id: 'power-run', title: 'Power Run', description: 'High-tempo fuel for the last kilometre', cover: 'playlist-power-run', kind: 'editorial', owner: 'Waveform', trackIds: ['t-night-terminal', 't-afterburn', 't-high-score', 't-ultraviolet', 't-fireworks', 't-lantern-parade'] },
  { id: 'deep-focus-pl', title: 'Deep Focus', description: 'Long, quiet, engineered to disappear', cover: 'playlist-deep-focus', kind: 'editorial', owner: 'Waveform', trackIds: ['t-field-notes', 't-quiet-machinery', 't-paper-moon', 't-salt-cedar', 't-long-survey'] },
  { id: 'chill-meridian', title: 'Chill Meridian', description: 'Slow water, copper skies', cover: 'playlist-chill', kind: 'editorial', owner: 'Waveform', trackIds: ['t-paper-moon', 't-salt-cedar', 't-copper-sky', 't-slow-parade', 't-quiet-machinery'] },
  { id: 'top-hits-lab', title: 'Top Hits Lab', description: 'The most-played tracks in the catalog', cover: 'playlist-top-hits', kind: 'editorial', owner: 'Waveform', trackIds: ['t-meridian', 't-high-score', 't-northbound', 't-afterburn', 't-final-level', 't-field-notes'] },
];

export const LIKED_ID = 'liked';

export { art } from './artwork';

/* ------------------------------- lookups -------------------------------- */

const trackMap = new Map(TRACKS.map((t) => [t.id, t]));
const artistMap = new Map(ARTISTS.map((a) => [a.id, a]));
const albumMap = new Map(ALBUMS.map((a) => [a.id, a]));
const playlistMap = new Map(PLAYLISTS.map((p) => [p.id, p]));
const genreMap = new Map(GENRES.map((g) => [g.id, g]));

export const getTrack = (id: string) => trackMap.get(id);
export const getArtist = (id: string) => artistMap.get(id);
export const getAlbum = (id: string) => albumMap.get(id);
export const getPlaylist = (id: string) => playlistMap.get(id);
export const getGenre = (id: string) => genreMap.get(id);

export function tracksOf(ids: string[]): Track[] {
  return ids.map((id) => trackMap.get(id)).filter((t): t is Track => Boolean(t));
}

export function artistTracks(artistId: string): Track[] {
  return TRACKS.filter((t) => t.artistId === artistId).sort((a, b) => b.playCount - a.playCount);
}

export function artistAlbums(artistId: string): Album[] {
  return ALBUMS.filter((a) => a.artistId === artistId);
}

export function albumArtist(album: Album): Artist {
  return artistMap.get(album.artistId) as Artist;
}

export function totalDuration(ids: string[]): number {
  return tracksOf(ids).reduce((sum, t) => sum + t.duration, 0);
}

/** Cover key for any playable context (used by player + rows). */
export function coverOfTrack(track: Track): string {
  return albumMap.get(track.albumId)?.cover ?? 'playlist-top-hits';
}

export function searchCatalog(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { tracks: [] as Track[], artists: [] as Artist[], albums: [] as Album[], playlists: [] as Playlist[] };
  return {
    tracks: TRACKS.filter((t) => t.title.toLowerCase().includes(q) || (artistMap.get(t.artistId)?.name.toLowerCase().includes(q) ?? false)),
    artists: ARTISTS.filter((a) => a.name.toLowerCase().includes(q)),
    albums: ALBUMS.filter((a) => a.title.toLowerCase().includes(q)),
    playlists: PLAYLISTS.filter((p) => p.title.toLowerCase().includes(q)),
  };
}
