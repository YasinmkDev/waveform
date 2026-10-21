import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronDown,
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';

import { theme } from '../theme';

const PROGRESS = 0.35;

/**
 * Player — the full-screen now-playing view, presented as a modal over
 * the tabs. Artwork, seek bar and transport controls are placeholders:
 * play/pause toggles local state until the expo-audio player service is
 * wired to a real queue.
 */
export default function PlayerScreen() {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.back()}
          accessibilityLabel="Close player"
        >
          <ChevronDown size={28} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerMeta}>
          <Text style={styles.headerOverline}>PLAYING FROM PLAYLIST</Text>
          <Text style={styles.headerTitle}>Liked Songs</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.artwork}>
        <Music2 size={96} color={theme.colors.textSecondary} />
      </View>

      <View style={styles.trackRow}>
        <View style={styles.trackMeta}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            Track title
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            Artist name
          </Text>
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => setLiked((value) => !value)}
          accessibilityLabel={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <Heart
            size={26}
            color={liked ? theme.colors.accent : theme.colors.text}
            fill={liked ? theme.colors.accent : 'transparent'}
          />
        </Pressable>
      </View>

      <View style={styles.seek}>
        <View style={styles.seekTrack}>
          <View style={[styles.seekFill, { width: `${PROGRESS * 100}%` }]} />
          <View style={styles.seekThumb} />
        </View>
        <View style={styles.seekTimes}>
          <Text style={styles.time}>1:12</Text>
          <Text style={styles.time}>3:27</Text>
        </View>
      </View>

      <View style={styles.transport}>
        <Pressable style={styles.iconButton} accessibilityLabel="Shuffle">
          <Shuffle size={22} color={theme.colors.textSecondary} />
        </Pressable>
        <Pressable style={styles.iconButton} accessibilityLabel="Previous track">
          <SkipBack size={32} color={theme.colors.text} fill={theme.colors.text} />
        </Pressable>
        <Pressable
          style={styles.playButton}
          onPress={() => setPlaying((value) => !value)}
          accessibilityLabel={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause size={32} color={theme.colors.onAccent} fill={theme.colors.onAccent} />
          ) : (
            <Play size={32} color={theme.colors.onAccent} fill={theme.colors.onAccent} />
          )}
        </Pressable>
        <Pressable style={styles.iconButton} accessibilityLabel="Next track">
          <SkipForward size={32} color={theme.colors.text} fill={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.iconButton} accessibilityLabel="Repeat">
          <Repeat size={22} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <ListMusic size={20} color={theme.colors.textSecondary} />
        <Text style={styles.footerText}>Queue and devices land with the playback service</Text>
        <Share2 size={20} color={theme.colors.textSecondary} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  headerMeta: {
    alignItems: 'center',
    gap: 2,
  },
  headerOverline: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    alignSelf: 'center',
    width: 320,
    height: 320,
    maxWidth: '100%',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xxl,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  trackMeta: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
  },
  trackArtist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
  seek: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  seekTrack: {
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceRaised,
    justifyContent: 'center',
  },
  seekFill: {
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.text,
  },
  seekThumb: {
    position: 'absolute',
    left: `${PROGRESS * 100}%`,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.text,
  },
  seekTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  footerText: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
  },
});
