import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pause, Play, SkipForward } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SlideInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { art, coverOfTrack, getArtist, getTrack } from '../data/catalog';
import { usePlayerStore } from '../store/player';
import { theme } from '../theme';
import { LikeButton } from './LikeButton';
import { popFrom } from './motion';
import { PressableScale } from './ui';

/** Subscribes to position alone so the 2×/s updates re-render only this hairline. */
function ProgressLine() {
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/**
 * MiniPlayer — floats above the tab bar whenever a track is loaded.
 * Tap = expand to Now Playing. Swipe left = next, swipe right = previous.
 * Exists only when something is playing (cold state lives on Home).
 */
export function MiniPlayer() {
  const trackId = usePlayerStore((s) => s.queue[s.index]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const reduced = useReducedMotion();
  const artScale = useSharedValue(1);
  const artStyle = useAnimatedStyle(() => ({ transform: [{ scale: artScale.value }] }));

  const track = trackId ? getTrack(trackId) : undefined;

  // Track-change artwork pop: 0.92 → 1 on a playful spring.
  useEffect(() => {
    if (track && !reduced) popFrom(artScale, 0.92);
  }, [track?.id, reduced, artScale]); // eslint-disable-line react-hooks/exhaustive-deps

  const swipe = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .onEnd((e) => {
      if (e.translationX <= -56) runOnJS(next)(true);
      else if (e.translationX >= 56) runOnJS(prev)();
    });

  if (!track) return null;
  const artist = getArtist(track.artistId);

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View entering={reduced ? undefined : SlideInUp.springify().damping(26)} style={styles.container}>
        <ProgressLine />
        <PressableScale outerStyle={{ flex: 1 }} style={styles.main} onPress={() => router.push('/player')}>
          <Animated.View key={track.id} style={reduced ? undefined : artStyle}>
            <Image source={art(coverOfTrack(track))} style={styles.artwork} contentFit="cover" />
          </Animated.View>
          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {artist?.name}
            </Text>
          </View>
        </PressableScale>
        <LikeButton trackId={track.id} size={22} />
        <PressableScale style={styles.control} scale={0.9} onPress={togglePlay} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
          {isBuffering ? (
            <View style={styles.bufferDot} />
          ) : isPlaying ? (
            <Pause size={26} color={theme.colors.text} fill={theme.colors.text} />
          ) : (
            <Play size={26} color={theme.colors.text} fill={theme.colors.text} />
          )}
        </PressableScale>
        <PressableScale style={styles.control} scale={0.9} onPress={() => next(true)} accessibilityLabel="Next track">
          <SkipForward size={24} color={theme.colors.text} fill={theme.colors.text} />
        </PressableScale>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    bottom: theme.layout.tabBarHeight + theme.spacing.sm,
    height: theme.layout.miniPlayerHeight + 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  progressFill: { height: 2, backgroundColor: theme.colors.text },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minWidth: 0 },
  artwork: { width: theme.layout.artworkSm, height: theme.layout.artworkSm, borderRadius: theme.radii.sm },
  meta: { flex: 1, minWidth: 0, gap: 1 },
  title: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  artist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  control: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bufferDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.textSecondary,
  },
});
