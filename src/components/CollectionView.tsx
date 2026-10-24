import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownAZ, ArrowLeft, Check, Download, Heart, Shuffle } from 'lucide-react-native';
import Animated, { FadeIn, useReducedMotion, ZoomIn } from 'react-native-reanimated';

import { art, totalDuration, tracksOf } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { usePrefsStore } from '../store/prefs';
import { theme } from '../theme';
import { PlayDisc } from './PlayDisc';
import { formatDuration, TrackRow } from './TrackRow';
import { EmptyState, PressableScale, StaggerItem } from './ui';

/**
 * Shared detail layout for playlists and albums (PLAN §6.4): centered
 * hero art, title block, action row (save · download · shuffle · THE
 * Play disc), track list, and a compact sticky header once the hero
 * scrolls away.
 */
export function CollectionView({
  title,
  subtitle,
  coverKey,
  trackIds,
  contextLabel,
  saveKey,
  downloadKey,
  emptyCta,
  childrenBottom,
  removablePlaylistId,
  headerExtra,
}: {
  title: string;
  subtitle: string;
  coverKey: string;
  trackIds: string[];
  contextLabel: string;
  /** Library key for the save (pin/save) heart, e.g. 'playlist:night-drive'. */
  saveKey?: string;
  downloadKey?: string;
  emptyCta?: { label: string; onPress: () => void };
  childrenBottom?: ReactNode;
  removablePlaylistId?: string;
  headerExtra?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const tracks = tracksOf(trackIds);
  const pinnedKeys = useLibraryStore((s) => s.pinnedKeys);
  const togglePin = useLibraryStore((s) => s.togglePin);
  const downloadedKeys = useLibraryStore((s) => s.downloadedKeys);
  const toggleDownload = useLibraryStore((s) => s.toggleDownload);
  const storeShuffle = usePlayerStore((s) => s.shuffle);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const playContext = usePlayerStore((s) => s.playContext);
  const currentId = usePlayerStore((s) => s.queue[s.index]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const [shuffleOn, setShuffleOn] = useState(storeShuffle);
  const [compact, setCompact] = useState(false);

  const saved = saveKey ? pinnedKeys.includes(saveKey) : false;
  const downloaded = downloadKey ? downloadedKeys.includes(downloadKey) : false;
  const isThisContext = tracks.some((t) => t.id === currentId);
  const total = totalDuration(trackIds);
  const hours = Math.floor(total / 3600);
  const mins = Math.round((total % 3600) / 60);
  const metaLine = `${tracks.length} songs · ${hours ? `${hours} hr ` : ''}${mins} min`;
  // Collection sort: Recents keeps the collection's own order, A–Z reorders
  // by title — a real reorder, layout-animated by the row wrappers below.
  const [sort, setSort] = useState<'recents' | 'az'>('recents');
  const reduced = useReducedMotion();
  const shownTracks =
    sort === 'az' ? [...tracks].sort((a, b) => a.title.localeCompare(b.title)) : tracks;
  // Row taps play in the order currently shown, so A–Z playback follows A–Z.
  const shownTrackIds = shownTracks.map((t) => t.id);

  const onPlay = () => {
    if (isThisContext) {
      togglePlay();
      return;
    }
    if (shuffleOn !== storeShuffle) toggleShuffle();
    playContext(trackIds, 0, contextLabel);
  };

  const onShuffleToggle = () => {
    const nextVal = !shuffleOn;
    setShuffleOn(nextVal);
    if (nextVal !== storeShuffle) toggleShuffle();
  };

  return (
    <View style={styles.root}>
      {compact ? (
        <Animated.View entering={FadeIn.duration(150)} style={[styles.compact, { paddingTop: insets.top }]}>
          <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
            <ArrowLeft size={24} color={theme.colors.text} />
          </PressableScale>
          <Image source={art(coverKey)} style={styles.compactArt} contentFit="cover" />
          <Text style={styles.compactTitle} numberOfLines={1}>
            {title}
          </Text>
          <PlayDisc size={44} isPlaying={isThisContext && isPlaying} onPress={onPlay} />
        </Animated.View>
      ) : null}

      <ScrollView
        onScroll={(e) => setCompact(e.nativeEvent.contentOffset.y > 300)}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + theme.spacing.md }]}>
          <View style={styles.heroTopRow}>
            <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
              <ArrowLeft size={24} color={theme.colors.text} />
            </PressableScale>
            {headerExtra}
          </View>
          <Image source={art(coverKey)} style={styles.heroArt} contentFit="cover" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
          <Text style={styles.meta}>{metaLine}</Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionLeft}>
            {saveKey ? (
              <PressableScale
                style={styles.iconBtn}
                onPress={() => togglePin(saveKey)}
                accessibilityLabel={saved ? 'Remove from Your Library' : 'Save to Your Library'}
              >
                <Heart
                  size={26}
                  color={theme.colors.text}
                  fill={saved ? theme.colors.text : 'transparent'}
                />
              </PressableScale>
            ) : null}
            {downloadKey ? (
              <PressableScale
                style={styles.iconBtn}
                onPress={() => {
                  // Downloads are a Premium feature (PLAN §6.12) — the gate is real.
                  if (usePrefsStore.getState().plan !== 'premium' && !downloaded) {
                    router.push('/premium');
                    return;
                  }
                  toggleDownload(downloadKey);
                }}
                accessibilityLabel={downloaded ? 'Remove download' : 'Download'}
              >
                {downloaded ? (
                  <Check size={24} color={theme.colors.accent} />
                ) : (
                  <Download size={24} color={theme.colors.text} />
                )}
              </PressableScale>
            ) : null}
            <PressableScale style={styles.iconBtn} onPress={onShuffleToggle} accessibilityLabel="Shuffle play">
              <Shuffle size={22} color={shuffleOn ? theme.colors.accent : theme.colors.textSecondary} />
              {shuffleOn ? (
                <Animated.View entering={reduced ? undefined : ZoomIn.springify().damping(16)} style={styles.dot} />
              ) : null}
            </PressableScale>
            {tracks.length > 1 ? (
              <PressableScale
                style={styles.sortBtn}
                onPress={() => setSort((s) => (s === 'recents' ? 'az' : 'recents'))}
                accessibilityLabel="Change track sort"
              >
                <ArrowDownAZ size={16} color={theme.colors.text} />
                <Text style={styles.sortText}>{sort === 'recents' ? 'Recents' : 'A–Z'}</Text>
              </PressableScale>
            ) : null}
          </View>
          <PlayDisc isPlaying={isThisContext && isPlaying} onPress={onPlay} />
        </View>

        {tracks.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body="Add songs and they will line up here, ready to play."
            ctaLabel={emptyCta?.label}
            onCta={emptyCta?.onPress}
          />
        ) : (
          shownTracks.map((t, i) => (
            <StaggerItem key={t.id} index={i} layout>
              <TrackRow
                track={t}
                index={i}
                showIndex
                contextTracks={shownTrackIds}
                contextLabel={contextLabel}
                removablePlaylistId={removablePlaylistId}
              />
            </StaggerItem>
          ))
        )}
        {childrenBottom}
        {tracks.length > 0 ? (
          <Text style={styles.footerMeta}>
            {tracks.map((t) => formatDuration(t.duration)).length} tracks · {metaLine.split('·')[1]?.trim() ?? ''}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  compactArt: { width: 36, height: 36, borderRadius: theme.radii.sm },
  compactTitle: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
  hero: { paddingHorizontal: theme.spacing.lg },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  heroArt: {
    width: theme.layout.artworkHero,
    height: theme.layout.artworkHero,
    borderRadius: theme.radii.md,
    alignSelf: 'center',
    marginVertical: theme.spacing.lg,
  },
  title: { color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.extrabold },
  subtitle: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, marginTop: 4, lineHeight: 18 },
  meta: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 6 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  sortText: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.accent },
  footerMeta: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
