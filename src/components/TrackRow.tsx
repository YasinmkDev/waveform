import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MoreHorizontal } from 'lucide-react-native';

import { art, coverOfTrack, getArtist, type Track } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { theme } from '../theme';
import { Equalizer } from './Equalizer';
import { LikeButton } from './LikeButton';
import { TrackMenu } from './sheets';

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * The universal track row. Subscribes to the player store with narrow
 * boolean selectors so only the playing row (and the previous one)
 * re-render when playback state changes.
 */
export const TrackRow = memo(function TrackRow({
  track,
  index,
  contextTracks,
  contextLabel,
  showArtwork = true,
  showLike = true,
  showIndex = false,
  removablePlaylistId,
}: {
  track: Track;
  index?: number;
  contextTracks: string[];
  contextLabel: string;
  showArtwork?: boolean;
  showLike?: boolean;
  showIndex?: boolean;
  /** When set, the menu gains "Remove from this playlist". */
  removablePlaylistId?: string;
}) {
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist);
  const isCurrent = usePlayerStore((s) => s.queue[s.index] === track.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playContext = usePlayerStore((s) => s.playContext);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const [menuOpen, setMenuOpen] = useState(false);
  const artist = getArtist(track.artistId);

  const onPress = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      const i = contextTracks.indexOf(track.id);
      playContext(contextTracks, i >= 0 ? i : 0, contextLabel);
    }
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${track.title} by ${artist?.name ?? ''}`}
      >
        {showIndex ? (
          <View style={styles.indexCell}>
            {isCurrent ? (
              <Equalizer playing={isPlaying} />
            ) : (
              <Text style={styles.indexText}>{(index ?? 0) + 1}</Text>
            )}
          </View>
        ) : null}
        {showArtwork ? (
          <Image source={art(coverOfTrack(track))} style={styles.art} contentFit="cover" transition={150} />
        ) : null}
        <View style={styles.meta}>
          <Text
            style={[styles.title, isCurrent && { color: theme.colors.accent }]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {isCurrent && !showIndex ? 'Now playing · ' : ''}
            {artist?.name}
          </Text>
        </View>
        {showLike ? <LikeButton trackId={track.id} size={20} /> : null}
        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
        <Pressable
          onPress={() => setMenuOpen(true)}
          hitSlop={8}
          style={styles.moreBtn}
          accessibilityLabel={`More options for ${track.title}`}
        >
          <MoreHorizontal size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </Pressable>
      <TrackMenu
        track={track}
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRemoveFromPlaylist={
          removablePlaylistId ? () => removeFromPlaylist(removablePlaylistId, track.id) : undefined
        }
      />
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    minHeight: 64,
  },
  rowPressed: { backgroundColor: theme.colors.surfaceAlt },
  indexCell: { width: 22, alignItems: 'center' },
  indexText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
  art: { width: theme.layout.artworkSm, height: theme.layout.artworkSm, borderRadius: theme.radii.sm },
  meta: { flex: 1, minWidth: 0, gap: 2 },
  title: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  artist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  duration: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
    fontVariant: ['tabular-nums'],
    width: 34,
    textAlign: 'right',
  },
  moreBtn: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
});
