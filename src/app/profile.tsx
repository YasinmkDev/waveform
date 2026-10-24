import { useMemo } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Crown, Flame, Settings, Share2, Snowflake } from 'lucide-react-native';

import { PressableScale, StaggerItem } from '../components/ui';
import { art, coverOfTrack, getArtist, getGenre, getTrack } from '../data/catalog';
import {
  countedPlays,
  formatMinutes,
  syncStreak,
  topArtists,
  topGenreId,
  totalSeconds,
  uniqueTracksPlayed,
} from '../lib/stats';
import { useHistoryStore } from '../store/history';
import { usePlayerStore } from '../store/player';
import { usePrefsStore } from '../store/prefs';
import { useUiStore } from '../store/ui';
import { theme } from '../theme';

function timeAgo(at: number): string {
  const mins = Math.floor((Date.now() - at) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Profile & Your Stats (PLAN §6.10) — the identity surface. Every number
 * is computed from the real local play log; the Month card is the
 * shareable peak-end artifact, built from the same data.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const events = useHistoryStore((s) => s.events);
  const plan = usePrefsStore((s) => s.plan);
  const streakFreezes = usePrefsStore((s) => s.streakFreezes);
  const sessionsCount = usePrefsStore((s) => s.sessionsCount);
  const notifAsked = usePrefsStore((s) => s.notifAsked);
  const setNotifAsked = usePrefsStore((s) => s.setNotifAsked);
  const setNotifWeekly = usePrefsStore((s) => s.setNotifWeekly);
  const playContext = usePlayerStore((s) => s.playContext);
  const showToast = useUiStore((s) => s.showToast);

  const stats = useMemo(() => {
    const counted = countedPlays(events);
    const top = topArtists(events, 1)[0];
    const genreId = topGenreId(events);
    const trackPlays = new Map<string, number>();
    for (const e of counted) trackPlays.set(e.trackId, (trackPlays.get(e.trackId) ?? 0) + 1);
    let topTrackId: string | undefined;
    let best = 0;
    for (const [id, n] of trackPlays) {
      if (n > best) {
        best = n;
        topTrackId = id;
      }
    }
    return {
      minutes: totalSeconds(events),
      songs: uniqueTracksPlayed(events),
      plays: counted.length,
      topArtist: top ? getArtist(top.artistId) : undefined,
      topGenre: genreId ? getGenre(genreId) : undefined,
      topTrack: topTrackId ? getTrack(topTrackId) : undefined,
      streak: syncStreak(events),
    };
  }, [events]);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: { trackId: string; at: number }[] = [];
    for (const e of [...events].reverse()) {
      if (seen.has(e.trackId)) continue;
      seen.add(e.trackId);
      out.push({ trackId: e.trackId, at: e.at });
      if (out.length >= 6) break;
    }
    return out;
  }, [events]);

  const hasData = stats.plays > 0;
  const showNotifAsk = sessionsCount >= 3 && !notifAsked;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Profile</Text>
        <PressableScale style={styles.iconBtn} onPress={() => router.push('/settings')} accessibilityLabel="Settings">
          <Settings size={22} color={theme.colors.text} />
        </PressableScale>
      </View>

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <Text style={styles.name}>Guest Listener</Text>
        <PressableScale
          style={[styles.planPill, plan === 'premium' && styles.planPillOn]}
          onPress={() => router.push('/premium')}
        >
          <Crown size={13} color={plan === 'premium' ? theme.colors.accent : theme.colors.textSecondary} />
          <Text style={[styles.planText, plan === 'premium' && { color: theme.colors.accent }]}>
            {plan === 'premium' ? 'Premium' : 'Free plan · see Premium'}
          </Text>
        </PressableScale>
      </View>

      {/* Stats */}
      <Text style={styles.section}>Your stats</Text>
      {hasData ? (
        <View style={styles.statsCard}>
          <StaggerItem index={0} style={styles.statCell}>
            <Text style={styles.statNum}>{formatMinutes(stats.minutes)}</Text>
            <Text style={styles.statLabel}>listened</Text>
          </StaggerItem>
          <StaggerItem index={1} style={styles.statCell}>
            <Text style={styles.statNum}>{stats.songs}</Text>
            <Text style={styles.statLabel}>songs played</Text>
          </StaggerItem>
          <StaggerItem index={2} style={styles.statCell}>
            <Text style={styles.statNum}>{stats.plays}</Text>
            <Text style={styles.statLabel}>full plays</Text>
          </StaggerItem>
          <StaggerItem index={3} style={styles.statRow}>
            <Flame size={17} color={theme.colors.warning} />
            <Text style={styles.statInline}>
              {stats.streak}-day listening streak
            </Text>
            <Snowflake size={15} color={theme.colors.textSecondary} />
            <Text style={styles.statInlineDim}>
              {streakFreezes} {streakFreezes === 1 ? 'freeze' : 'freezes'} ready
            </Text>
          </StaggerItem>
          {stats.topArtist ? (
            <StaggerItem index={4} style={{ width: '100%' }}>
              <Text style={styles.statLine}>
                Top artist · <Text style={styles.statStrong}>{stats.topArtist.name}</Text>
              </Text>
            </StaggerItem>
          ) : null}
          {stats.topGenre ? (
            <StaggerItem index={5} style={{ width: '100%' }}>
              <Text style={styles.statLine}>
                Top genre · <Text style={styles.statStrong}>{stats.topGenre.name}</Text>
              </Text>
            </StaggerItem>
          ) : null}
        </View>
      ) : (
        <View style={styles.statsCard}>
          <Text style={styles.emptyStats}>Play something and your story starts here — minutes, streaks and top artists, all from your real listening.</Text>
        </View>
      )}

      {/* Notification ask — after value, contextual (PLAN §8.3) */}
      {showNotifAsk ? (
        <View style={styles.notifCard}>
          <Bell size={20} color={theme.colors.accent} />
          <Text style={styles.notifText}>Get your Weekly Mix the moment it drops, every Monday at 9.</Text>
          <PressableScale
            style={styles.notifBtn}
            onPress={() => {
              setNotifAsked();
              setNotifWeekly(true);
              showToast('Weekly Mix reminders on');
            }}
          >
            <Text style={styles.notifBtnText}>Remind me</Text>
          </PressableScale>
          <PressableScale onPress={setNotifAsked} hitSlop={8}>
            <Text style={styles.notifSkip}>Not now</Text>
          </PressableScale>
        </View>
      ) : null}

      {/* Month in Music — the shareable artifact */}
      <Text style={styles.section}>Your Month in Music</Text>
      <View style={[styles.monthCard, { backgroundColor: stats.topGenre?.color ?? '#5038B8' }]}>
        <Text style={styles.monthKicker}>WAVEFORM · THIS MONTH</Text>
        <Text style={styles.monthBig}>{hasData ? formatMinutes(stats.minutes) : '0 min'}</Text>
        <Text style={styles.monthLine}>of music, so far</Text>
        {stats.topArtist ? <Text style={styles.monthFact}>Top artist — {stats.topArtist.name}</Text> : null}
        {stats.topTrack ? <Text style={styles.monthFact}>On repeat — “{stats.topTrack.title}”</Text> : null}
        {hasData ? <Text style={styles.monthFact}>{stats.streak}-day streak and counting</Text> : null}
        <PressableScale
          style={styles.shareBtn}
          onPress={() => {
            if (!hasData) {
              showToast('Listen first, then this card tells your story');
              return;
            }
            const lines = [
              `My month on Waveform: ${formatMinutes(stats.minutes)} of music so far.`,
              stats.topArtist ? `Top artist: ${stats.topArtist.name}.` : '',
              stats.topTrack ? `On repeat: ${stats.topTrack.title}.` : '',
              `${stats.streak}-day streak and counting.`,
            ]
              .filter(Boolean)
              .join(' ');
            void Share.share({ message: lines })
              .then((r) => {
                if (r.action === Share.sharedAction) showToast('Shared');
              })
              .catch(() => showToast("Couldn't share — try again"));
          }}
        >
          <Share2 size={16} color={theme.colors.onAccent} />
          <Text style={styles.shareText}>Share your month</Text>
        </PressableScale>
      </View>

      {/* History */}
      {recent.length ? (
        <>
          <Text style={styles.section}>Recently played</Text>
          {recent.map(({ trackId, at }, i) => {
            const t = getTrack(trackId);
            if (!t) return null;
            return (
              <StaggerItem key={trackId} index={i} layout>
                <PressableScale style={styles.histRow} onPress={() => playContext([trackId], 0, 'Recently played')}>
                  <Image source={art(coverOfTrack(t))} style={styles.histArt} contentFit="cover" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.histTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.histArtist} numberOfLines={1}>
                      {getArtist(t.artistId)?.name}
                    </Text>
                  </View>
                  <Text style={styles.histWhen}>{timeAgo(at)}</Text>
                </PressableScale>
              </StaggerItem>
            );
          })}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  headerTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  identity: { alignItems: 'center', paddingTop: theme.spacing.lg, gap: theme.spacing.sm },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.colors.onAccent, fontSize: 34, fontWeight: theme.fontWeight.extrabold },
  name: { color: theme.colors.text, fontSize: theme.fontSize.headline, fontWeight: theme.fontWeight.extrabold, letterSpacing: -0.5 },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  planPillOn: { borderColor: theme.colors.accent },
  planText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  statsCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statCell: { minWidth: '27%' },
  statNum: { color: theme.colors.text, fontSize: theme.fontSize.stat, fontWeight: theme.fontWeight.extrabold, fontVariant: ['tabular-nums'] },
  statLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%' },
  statInline: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  statInlineDim: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small },
  statLine: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, width: '100%' },
  statStrong: { color: theme.colors.text, fontWeight: theme.fontWeight.bold },
  emptyStats: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, lineHeight: 21 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  notifText: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.small, lineHeight: 18 },
  notifBtn: { backgroundColor: theme.colors.text, borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  notifBtnText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.small },
  notifSkip: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small },
  monthCard: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    minHeight: theme.layout.monthCardHeight,
  },
  monthKicker: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: theme.fontWeight.bold, letterSpacing: 1.2 },
  monthBig: { color: '#fff', fontSize: theme.fontSize.hero, fontWeight: theme.fontWeight.extrabold, marginTop: theme.spacing.md, letterSpacing: -0.5, lineHeight: 46 },
  monthLine: { color: 'rgba(255,255,255,0.85)', fontSize: theme.fontSize.body },
  monthFact: { color: '#fff', fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.semibold, marginTop: theme.spacing.md },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: theme.radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: theme.spacing.xl,
  },
  shareText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.small },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  histArt: { width: theme.layout.artworkHistory, height: theme.layout.artworkHistory, borderRadius: theme.radii.sm },
  histTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  histArtist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  histWhen: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption },
});
