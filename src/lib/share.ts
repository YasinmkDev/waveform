import * as Clipboard from 'expo-clipboard';

import type { Track } from '../data/catalog';

/** A real, shareable Waveform link for a track (no backend — a stable URL shape). */
export function trackLink(trackId: string): string {
  return `https://waveform.app/track/${trackId}`;
}

/** Copy the track's link to the clipboard; returns the link that was copied. */
export async function copyTrackLink(track: Track): Promise<string> {
  const link = trackLink(track.id);
  await Clipboard.setStringAsync(link);
  return link;
}
