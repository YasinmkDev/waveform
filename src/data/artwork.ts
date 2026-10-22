import type { ImageSource } from 'expo-image';

/**
 * Static artwork map. Every cover in the app is a locally generated flat
 * design (scripts/generate_artwork.py) — no hotlinked images. Keys match
 * the `cover` / `image` fields in the catalog.
 */
export const artwork: Record<string, ImageSource> = {
  'album-neon-meridian': require('../../assets/artwork/album-neon-meridian.png'),
  'album-cartographer': require('../../assets/artwork/album-cartographer.png'),
  'album-slow-tides': require('../../assets/artwork/album-slow-tides.png'),
  'album-festival-lights': require('../../assets/artwork/album-festival-lights.png'),
  'album-terminal-velocity': require('../../assets/artwork/album-terminal-velocity.png'),
  'album-velvet-static': require('../../assets/artwork/album-velvet-static.png'),
  'album-deep-focus': require('../../assets/artwork/album-deep-focus.png'),
  'album-insert-coin': require('../../assets/artwork/album-insert-coin.png'),
  'artist-nova-reina': require('../../assets/artwork/artist-nova-reina.png'),
  'artist-atlas-grey': require('../../assets/artwork/artist-atlas-grey.png'),
  'artist-mira-sol': require('../../assets/artwork/artist-mira-sol.png'),
  'artist-paper-lanterns': require('../../assets/artwork/artist-paper-lanterns.png'),
  'artist-vector-club': require('../../assets/artwork/artist-vector-club.png'),
  'artist-sable-june': require('../../assets/artwork/artist-sable-june.png'),
  'artist-orion-fields': require('../../assets/artwork/artist-orion-fields.png'),
  'artist-midnight-arcade': require('../../assets/artwork/artist-midnight-arcade.png'),
  'playlist-daily-mix-01': require('../../assets/artwork/playlist-daily-mix-01.png'),
  'playlist-daily-mix-02': require('../../assets/artwork/playlist-daily-mix-02.png'),
  'playlist-daily-mix-03': require('../../assets/artwork/playlist-daily-mix-03.png'),
  'playlist-weekly-mix': require('../../assets/artwork/playlist-weekly-mix.png'),
  'playlist-liked': require('../../assets/artwork/playlist-liked.png'),
  'playlist-night-drive': require('../../assets/artwork/playlist-night-drive.png'),
  'playlist-power-run': require('../../assets/artwork/playlist-power-run.png'),
  'playlist-deep-focus': require('../../assets/artwork/playlist-deep-focus.png'),
  'playlist-chill': require('../../assets/artwork/playlist-chill.png'),
  'playlist-top-hits': require('../../assets/artwork/playlist-top-hits.png'),
};

export function art(key: string): ImageSource {
  return artwork[key] ?? artwork['playlist-top-hits'];
}
