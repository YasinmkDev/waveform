import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Settings } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ArtistCard, ResumeTile, SquareCard } from '../../components/Cards';
import { PlayDisc } from '../../components/PlayDisc';
import { Shelf } from '../../components/Shelf';
import { Chip } from '../../components/ui';
import {
  ALBUMS,
  ARTISTS,
  PLAYLISTS,
  art,
  getPlaylist,
} from '../../data/catalog';
import { buildTaste, generateTasteMix, resumeContexts, weeklyMixPlaylist } from '../../lib/mix';
import { playedToday, syncStreak } from '../../lib/stats';
import { useHistoryStore } from '../../store/history';
import { useLibraryStore } from '../../store/library';
import { usePlayerStore } from '../../store/player';
import { usePrefsStore } from '../../store/prefs';
import { theme } from '../../theme';

type HomeFilter = 'all' | 'mixes' | 'albums' | 'artists';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Home — one job: the right music playing in one tap.
 * Resume first (daily loop), then algorithmic shelves that are honest
 * functions of the user's own data (PLAN §6.1, §8).
 */
export default function HomeScreen() {
  const [filter, setFilter] = useState<HomeFilter>('all');
  const events = useHistoryStore((s) => s.events);
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const tasteArtistIds = usePrefsStore((s) => s.tasteArtistIds);
  const tasteGenreIds = usePrefsStore((s) => s.tasteGenreIds);
  const plan = usePrefsStore((s) => s.plan);
  const notifReleases = usePrefsStore((s) => s.notifReleases);
  const hasTrack = usePlayerStore((s) => s.queue.length > 0);
  const playContext = usePlayerStore((s) => s.playContext);
  const [adDismissed, setAdDismissed] = useState(false);

  const taste = useMemo(
    () => buildTaste(events, { tasteArtistIds, tasteGenreIds, likedTrackIds }),
    [events, tasteArtistIds, tasteGenreIds, likedTrackIds],
  );
  const resume = useMemo(() => resumeContexts(events, 6), [events]);
  const weekly = useMemo(() => weeklyMixPlaylist(events, taste), [events, taste]);
  const streak = useMemo(() => syncStreak(events), [events]);
  const showStreakSaver = streak >= 3 && !playedToday(events);
  const weeklyFresh = events.length === 0 || new Date().getDay() === 1;

  const mixes = PLAYLISTS.filter((p) => p.kind === 'mix' && p.id !== 'weekly-mix');
  const editorial = PLAYLISTS.filter((p) => p.kind === 'editorial');
  const newReleases = [...ALBUMS].sort((a, b) => b.year - a.year);
  const topArtists = [...ARTISTS]
    .sort((a, b) => (taste.artistWeights.get(b.id) ?? 0) - (taste.artistWeights.get(a.id) ?? 0))
    .slice(0, 6);

  const showMixes = filter === 'all' || filter === 'mixes';
  const showAlbums = filter === 'all' || filter === 'albums';
  const showArtists = filter === 'all' || filter === 'artists';

  const playResume = (label: string, trackIds: string[]) => playContext(trackIds, 0, label);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: hasTrack ? 150 : 96 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push('/playlist/weekly-mix')}
              accessibilityLabel="Your Weekly Mix"
            >
              <Bell size={23} color={theme.colors.text} />
              {weeklyFresh ? <View style={styles.bellDot} /> : null}
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/settings')} accessibilityLabel="Settings">
              <Settings size={23} color={theme.colors.text} />
            </Pressable>
            <Pressable style={styles.avatar} onPress={() => router.push('/profile')} accessibilityLabel="Profile">
              <Text style={styles.avatarText}>G</Text>
            </Pressable>
          </View>
        </View>

        {/* Filter chips */}
        <View style={styles.chips}>
          {(
            [
              ['all', 'All'],
              ['mixes', 'Mixes'],
              ['albums', 'Albums'],
              ['artists', 'Artists'],
            ] as [HomeFilter, string][]
          ).map(([key, label]) => (
            <Chip key={key} label={label} selected={filter === key} onPress={() => setFilter(key)} />
          ))}
        </View>

        {/* Weekly Mix hero — the algorithmic-intimacy surface */}
        {showMixes ? (
          <Animated.View entering={FadeInDown.duration(380).springify()} style={styles.heroCard}>
            <Image source={art(weekly.cover)} style={styles.heroArt} contentFit="cover" />
            <View style={styles.heroMeta}>
              <Text style={styles.kicker}>MADE FROM YOUR LIKES & PLAYS</Text>
              <Text style={styles.heroTitle}>Your Weekly Mix</Text>
              <Text style={styles.heroSub} numberOfLines={2}>
                {weekly.trackIds.length} songs picked from what you actually listen to
              </Text>
            </View>
            <PlayDisc
              isPlaying={false}
              size={52}
              onPress={() => playContext(weekly.trackIds, 0, weekly.title)}
            />
          </Animated.View>
        ) : null}

        {/* Streak saver — in-app trigger, supportive, never shaming */}
        {showStreakSaver ? (
          <Pressable
            style={styles.streakCard}
            onPress={() => {
              const weeklyIds = weekly.trackIds;
              if (weeklyIds.length) playContext(weeklyIds, 0, weekly.title);
            }}
          >
            <Text style={styles.streakText}>
              Your {streak}-day listening streak is alive — one song keeps it going.
            </Text>
            <Text style={styles.streakCta}>Play</Text>
          </Pressable>
        ) : null}

        {/* Resume grid / cold start */}
        {filter === 'all' ? (
          resume.length ? (
            <View style={styles.resumeGrid}>
              {resume.map((ctx, i) => (
                <Animated.View
                  key={ctx.label}
                  entering={FadeInDown.delay(Math.min(i, 7) * theme.motion.stagger).duration(300)}
                  style={styles.resumeCell}
                >
                  <ResumeTile coverKey={ctx.cover} title={ctx.label} onPress={() => playResume(ctx.label, ctx.trackIds)} />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Pressable
              style={styles.coldCard}
              onPress={() => playContext(generateTasteMix(taste), 0, 'Made For You')}
            >
              <Text style={styles.kicker}>YOUR TASTE, INSTANTLY</Text>
              <Text style={styles.coldTitle}>A mix built from the artists you picked</Text>
              <Text style={styles.heroSub}>Tap to play — it sharpens every time you listen.</Text>
            </Pressable>
          )
        ) : null}

        {showMixes ? (
          <Shelf
            title="Made For You"
            data={mixes}
            keyExtractor={(p) => p.id}
            renderItem={(p) => (
              <SquareCard
                coverKey={p.cover}
                title={p.title}
                caption={p.description}
                size={164}
                onPress={() => router.push(`/playlist/${p.id}`)}
              />
            )}
          />
        ) : null}

        {showAlbums ? (
          <Shelf
            title="Jump back in"
            data={newReleases}
            keyExtractor={(a) => a.id}
            renderItem={(a) => (
              <SquareCard
                coverKey={a.cover}
                title={a.title}
                caption={`${a.year} · Album`}
                onPress={() => router.push(`/album/${a.id}`)}
              />
            )}
          />
        ) : null}

        {plan === 'free' && !adDismissed ? (
          <Pressable style={styles.adCard} onPress={() => router.push('/premium')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.adTag}>AD · WAVEFORM PREMIUM</Text>
              <Text style={styles.adTitle}>Your music, uninterrupted.</Text>
              <Text style={styles.adSub}>Go Premium for the full stats card and zero house ads.</Text>
            </View>
            <Pressable onPress={() => setAdDismissed(true)} hitSlop={10} accessibilityLabel="Dismiss ad">
              <Text style={styles.adClose}>✕</Text>
            </Pressable>
          </Pressable>
        ) : null}

        {showArtists ? (
          <Shelf
            title="Your top artists"
            data={topArtists}
            keyExtractor={(a) => a.id}
            renderItem={(a) => (
              <ArtistCard imageKey={a.image} name={a.name} onPress={() => router.push(`/artist/${a.id}`)} />
            )}
          />
        ) : null}

        {showMixes ? (
          <Shelf
            title="Soundtrack your day"
            data={editorial}
            keyExtractor={(p) => p.id}
            renderItem={(p) => (
              <SquareCard
                coverKey={p.cover}
                title={p.title}
                caption={p.description}
                onPress={() => router.push(`/playlist/${p.id}`)}
              />
            )}
          />
        ) : null}

        {showAlbums && notifReleases ? (
          <Shelf
            title="New releases for you"
            data={newReleases.slice(0, 4)}
            keyExtractor={(a) => `nr-${a.id}`}
            renderItem={(a) => {
              const pl = getPlaylist('top-hits-lab');
              return (
                <SquareCard
                  coverKey={a.cover}
                  title={a.title}
                  caption={pl ? 'Fresh in the catalog' : undefined}
                  onPress={() => router.push(`/album/${a.id}`)}
                />
              );
            }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  greeting: { color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.extrabold },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.extrabold, fontSize: 14 },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  heroArt: { width: 76, height: 76, borderRadius: theme.radii.md },
  heroMeta: { flex: 1, minWidth: 0, gap: 2 },
  kicker: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.8,
  },
  heroTitle: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.extrabold },
  heroSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, lineHeight: 16 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  streakText: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.small, lineHeight: 18 },
  streakCta: { color: theme.colors.accent, fontWeight: theme.fontWeight.extrabold, fontSize: theme.fontSize.body },
  resumeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  resumeCell: { width: '48.7%' },
  coldCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: 4,
  },
  coldTitle: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  adCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  adTag: { color: theme.colors.textTertiary, fontSize: 10, fontWeight: theme.fontWeight.bold, letterSpacing: 1 },
  adTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold, marginTop: 4 },
  adSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2, lineHeight: 16 },
  adClose: { color: theme.colors.textSecondary, fontSize: 14, padding: 2 },
});
