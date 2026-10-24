import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDown,
  ListMusic,
  Moon,
  MoreHorizontal,
  Plus,
  Repeat,
  Repeat1,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  ZoomIn,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { LikeButton } from '../components/LikeButton';
import { artDragReset, artDragUpdate, springTo } from '../components/motion';
import { PlayDisc } from '../components/PlayDisc';
import { formatDuration } from '../components/TrackRow';
import { PlaylistPicker, SleepTimerSheet, TrackMenu } from '../components/sheets';
import { PressableScale } from '../components/ui';
import { copyTrackLink } from '../lib/share';
import { art, coverOfTrack, getAlbum, getArtist, getPlaylist, getTrack } from '../data/catalog';
import { usePlayerStore } from '../store/player';
import { useUiStore } from '../store/ui';
import { theme } from '../theme';

/** Scrubber: subscribes to position alone; drag previews a time, release seeks. */
function Scrubber() {
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);
  const [width, setWidth] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const thumbScale = useSharedValue(1);
  const scrubbing = scrub != null;
  // Thumb grows to 1.4× while scrubbing, springs back on release.
  useEffect(() => {
    if (!reduced) springTo(thumbScale, scrubbing ? 1.4 : 1, true);
  }, [scrubbing, reduced, thumbScale]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ scale: thumbScale.value }] }));

  const shown = scrub ?? position;
  const pct = duration > 0 ? Math.max(0, Math.min(1, shown / duration)) : 0;

  const pan = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .onUpdate((e) => {
      if (width > 0) runOnJS(setScrub)(Math.max(0, Math.min(1, e.x / width)) * duration);
    })
    .onEnd(() => {
      if (scrub != null) runOnJS(seek)(scrub);
      runOnJS(setScrub)(null);
    });

  return (
    <View style={styles.seekWrap}>
      <GestureDetector gesture={pan}>
        <View style={styles.seekHit} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <View style={styles.seekTrack}>
            <View style={[styles.seekFill, { width: `${pct * 100}%` }]} />
          </View>
          <Animated.View
            style={[styles.seekThumb, { left: `${pct * 100}%` }, scrub == null && styles.seekThumbIdle, thumbStyle]}
          />
        </View>
      </GestureDetector>
      <View style={styles.seekTimes}>
        <Text style={styles.time}>{formatDuration(shown)}</Text>
        <Text style={styles.time}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

/**
 * Sleep countdown chip: re-renders on position ticks (2×/s), so the
 * remaining time counts down live. Tap reopens the timer sheet.
 */
function SleepChip({ onPress }: { onPress: () => void }) {
  const sleepUntil = usePlayerStore((s) => s.sleepUntil);
  usePlayerStore((s) => s.position); // tick subscription only
  if (sleepUntil == null) return null;
  // Countdown text must read the current time on each tick render — that is the feature.
  // eslint-disable-next-line react-hooks/purity
  const left = sleepUntil - Date.now();
  if (left <= 0) return null;
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <PressableScale style={styles.sleepChip} onPress={onPress} accessibilityLabel="Sleep timer">
      <Moon size={14} color={theme.colors.text} />
      <Text style={styles.sleepChipText}>
        Sleep in {m}:{String(s).padStart(2, '0')}
      </Text>
    </PressableScale>
  );
}

export default function PlayerScreen() {
  const trackId = usePlayerStore((s) => s.queue[s.index]);
  const contextLabel = usePlayerStore((s) => s.contextLabel);
  const lastNavDirection = usePlayerStore((s) => s.lastNavDirection);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const ended = usePlayerStore((s) => s.ended);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const playContext = usePlayerStore((s) => s.playContext);
  const showToast = useUiStore((s) => s.showToast);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const reduced = useReducedMotion();
  const dragX = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const dragRot = useSharedValue(0);
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { scale: dragScale.value }, { rotate: `${dragRot.value}deg` }],
  }));

  const track = trackId ? getTrack(trackId) : undefined;

  const swipeArt = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onUpdate((e) => {
      artDragUpdate(dragX, dragScale, dragRot, e.translationX);
    })
    .onEnd((e) => {
      artDragReset(dragX, dragScale, dragRot);
      if (e.translationX <= -70) runOnJS(next)(true);
      else if (e.translationX >= 70) runOnJS(prev)();
    });

  if (!track) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Nothing playing</Text>
          <Text style={styles.emptyBody}>Pick something from Home and it will live here.</Text>
          <Pressable style={styles.emptyCta} onPress={() => router.back()}>
            <Text style={styles.emptyCtaText}>Browse music</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const artist = getArtist(track.artistId);
  const album = getAlbum(track.albumId);
  const tint = album?.tint ?? theme.colors.canvas;
  // Directional entrance: next slides from the right, prev from the left;
  // fresh contexts fade in. Reduced Motion always crossfades.
  const artEntering = reduced
    ? FadeIn.duration(320)
    : lastNavDirection === 'next'
      ? SlideInRight.duration(280)
      : lastNavDirection === 'prev'
        ? SlideInLeft.duration(280)
        : FadeIn.duration(320);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tint crossfade: keyed overlay fades in on every track change. */}
      <Animated.View key={`tint-${track.id}`} entering={FadeIn.duration(400)} style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      <View style={styles.header}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Close player">
          <ChevronDown size={28} color={theme.colors.text} />
        </PressableScale>
        <View style={styles.headerMeta}>
          <Text style={styles.headerOverline}>PLAYING FROM</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {contextLabel || album?.title}
          </Text>
        </View>
        <PressableScale style={styles.iconBtn} onPress={() => setMenuOpen(true)} accessibilityLabel="More options">
          <MoreHorizontal size={24} color={theme.colors.text} />
        </PressableScale>
      </View>

      <GestureDetector gesture={swipeArt}>
        <Animated.View key={track.id} entering={artEntering} style={styles.artWrap}>
          <Animated.View style={dragStyle}>
            <Image source={art(coverOfTrack(track))} style={styles.artwork} contentFit="cover" />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.trackRow}>
        <View style={styles.trackMeta}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {artist?.name}
          </Text>
        </View>
        <LikeButton trackId={track.id} size={26} />
        <PressableScale style={styles.iconBtn} scale={0.9} onPress={() => setPickerOpen(true)} accessibilityLabel="Add to playlist">
          <Plus size={26} color={theme.colors.text} />
        </PressableScale>
      </View>

      <Scrubber />

      <View style={styles.transport}>
        <PressableScale style={styles.iconBtn} onPress={toggleShuffle} accessibilityLabel="Shuffle">
          <Shuffle size={22} color={shuffle ? theme.colors.accent : theme.colors.textSecondary} />
          {shuffle ? (
            <Animated.View entering={reduced ? undefined : ZoomIn.springify().damping(16)} style={styles.dot} />
          ) : null}
        </PressableScale>
        <PressableScale style={styles.iconBtn} onPress={prev} accessibilityLabel="Previous track">
          <SkipBack size={34} color={theme.colors.text} fill={theme.colors.text} />
        </PressableScale>
        <PlayDisc light size={theme.layout.playDiscLg} isPlaying={isPlaying} isBuffering={isBuffering} onPress={togglePlay} />
        <PressableScale style={styles.iconBtn} onPress={() => next(true)} accessibilityLabel="Next track">
          <SkipForward size={34} color={theme.colors.text} fill={theme.colors.text} />
        </PressableScale>
        <PressableScale style={styles.iconBtn} onPress={cycleRepeat} accessibilityLabel="Repeat">
          {repeat === 'one' ? (
            <Repeat1 size={22} color={theme.colors.accent} />
          ) : (
            <Repeat size={22} color={repeat === 'all' ? theme.colors.accent : theme.colors.textSecondary} />
          )}
          {repeat !== 'off' ? (
            <Animated.View entering={reduced ? undefined : ZoomIn.springify().damping(16)} style={styles.dot} />
          ) : null}
        </PressableScale>
      </View>

      {ended ? (
        <PressableScale
          style={styles.keepListening}
          onPress={() => {
            const weekly = getPlaylist('weekly-mix');
            if (weekly) playContext(weekly.trackIds, 0, weekly.title);
          }}
        >
          <Text style={styles.keepListeningText}>Queue finished — keep listening with Your Weekly Mix</Text>
        </PressableScale>
      ) : null}

      <SleepChip onPress={() => setSleepOpen(true)} />

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <PressableScale
            style={styles.iconBtn}
            onPress={() => {
              void copyTrackLink(track).then(() => showToast('Link copied to clipboard'));
            }}
            accessibilityLabel="Share"
          >
            <Share2 size={20} color={theme.colors.textSecondary} />
          </PressableScale>
          <PressableScale style={styles.iconBtn} onPress={() => setSleepOpen(true)} accessibilityLabel="Sleep timer">
            <Moon size={20} color={theme.colors.textSecondary} />
          </PressableScale>
        </View>
        <PressableScale style={styles.queueBtn} onPress={() => router.push('/queue')} accessibilityLabel="Open queue">
          <ListMusic size={20} color={theme.colors.text} />
          <Text style={styles.queueText}>Queue</Text>
        </PressableScale>
      </View>

      <TrackMenu track={track} visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <PlaylistPicker track={track} visible={pickerOpen} onClose={() => setPickerOpen(false)} />
      <SleepTimerSheet visible={sleepOpen} onClose={() => setSleepOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm },
  headerMeta: { alignItems: 'center', gap: 2, flex: 1, paddingHorizontal: theme.spacing.sm },
  headerOverline: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1.2,
  },
  headerTitle: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  artWrap: { alignSelf: 'center', width: '100%', maxWidth: 380, aspectRatio: 1, marginVertical: theme.spacing.xl },
  artwork: { width: '100%', height: '100%', borderRadius: theme.radii.md },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  trackMeta: { flex: 1, minWidth: 0, gap: 2 },
  trackTitle: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  trackArtist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body },
  seekWrap: { marginTop: theme.spacing.lg },
  seekHit: { paddingVertical: 10, justifyContent: 'center' },
  seekTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  seekFill: { height: 4, borderRadius: 2, backgroundColor: theme.colors.text },
  seekThumb: {
    position: 'absolute',
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.text,
  },
  seekThumbIdle: { width: 0, height: 0 },
  seekTimes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  time: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, fontVariant: ['tabular-nums'] },
  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.md },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
  keepListening: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  keepListeningText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.small },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  sleepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: theme.spacing.md,
  },
  sleepChipText: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold, fontVariant: ['tabular-nums'] },
  queueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  queueText: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.xxl },
  emptyTitle: { color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.bold },
  emptyBody: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, textAlign: 'center' },
  emptyCta: { marginTop: theme.spacing.md, backgroundColor: theme.colors.text, borderRadius: theme.radii.pill, paddingHorizontal: 22, paddingVertical: 11 },
  emptyCtaText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold },
});
