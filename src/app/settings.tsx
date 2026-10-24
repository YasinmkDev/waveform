import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Crown, Minus, Plus } from 'lucide-react-native';

import { PressableScale, StaggerItem } from '../components/ui';
import { useHistoryStore } from '../store/history';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { usePrefsStore } from '../store/prefs';
import { theme } from '../theme';

/**
 * Settings (PLAN §6.11) — every control is real: crossfade drives the
 * engine's fades, notification toggles gate the in-app surfaces, reset
 * wipes all four stores and returns to onboarding.
 */
export default function SettingsScreen() {
  const crossfade = usePrefsStore((s) => s.crossfade);
  const setCrossfade = usePrefsStore((s) => s.setCrossfade);
  const plan = usePrefsStore((s) => s.plan);
  const notifWeekly = usePrefsStore((s) => s.notifWeekly);
  const setNotifWeekly = usePrefsStore((s) => s.setNotifWeekly);
  const notifReleases = usePrefsStore((s) => s.notifReleases);
  const setNotifReleases = usePrefsStore((s) => s.setNotifReleases);
  const resetPrefs = usePrefsStore((s) => s.reset);
  const resetLibrary = useLibraryStore((s) => s.reset);
  const resetHistory = useHistoryStore((s) => s.reset);
  const resetPlayback = usePlayerStore((s) => s.resetPlayback);

  const resetAll = () =>
    Alert.alert('Reset demo data?', 'Your likes, playlists, history, taste picks and plan will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetPlayback();
          resetLibrary();
          resetHistory();
          resetPrefs();
          router.replace('/');
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </PressableScale>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <StaggerItem index={0}>
          <Text style={styles.section}>Plan</Text>
          <PressableScale style={styles.row} onPress={() => router.push('/premium')}>
            <Crown size={20} color={plan === 'premium' ? theme.colors.accent : theme.colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{plan === 'premium' ? 'Waveform Premium' : 'Free plan'}</Text>
              <Text style={styles.rowSub}>{plan === 'premium' ? 'All demo benefits active' : 'See what Premium adds'}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </PressableScale>
        </StaggerItem>

        <StaggerItem index={1}>
          <Text style={styles.section}>Playback</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Crossfade</Text>
              <Text style={styles.rowSub}>
                Fade between tracks{plan !== 'premium' ? ' · up to 2s on Free, 6s on Premium' : ''}
              </Text>
            </View>
            <View style={styles.stepper}>
              <PressableScale
                style={styles.stepBtn}
                scale={0.9}
                onPress={() => setCrossfade(Math.max(0, crossfade - 1))}
                accessibilityLabel="Less crossfade"
              >
                <Minus size={16} color={theme.colors.text} />
              </PressableScale>
              <Text style={styles.stepVal}>{crossfade}s</Text>
              <PressableScale
                style={styles.stepBtn}
                scale={0.9}
                onPress={() => setCrossfade(Math.min(plan === 'premium' ? 6 : 2, crossfade + 1))}
                accessibilityLabel="More crossfade"
              >
                <Plus size={16} color={theme.colors.text} />
              </PressableScale>
            </View>
          </View>
        </StaggerItem>

        <StaggerItem index={2}>
          <Text style={styles.section}>Reminders (in-app)</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Weekly Mix drop</Text>
              <Text style={styles.rowSub}>Bell dot and hero card when your mix refreshes</Text>
            </View>
            <Switch value={notifWeekly} onValueChange={setNotifWeekly} trackColor={{ true: theme.colors.accent }} />
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>New release alerts</Text>
              <Text style={styles.rowSub}>Controls the “New releases for you” shelf on Home</Text>
            </View>
            <Switch value={notifReleases} onValueChange={setNotifReleases} trackColor={{ true: theme.colors.accent }} />
          </View>
        </StaggerItem>

        <StaggerItem index={3}>
          <Text style={styles.section}>About</Text>
          <View style={styles.aboutBox}>
            <Text style={styles.aboutText}>
              Waveform is a portfolio study of the Spotify product system — original code, an original sample catalog, and no
              affiliation with Spotify. Music: SoundHelix example songs (T. Schürger). Artwork: generated in-project. Artist
              listener and play counts are sample editorial data.
            </Text>
            <Text style={styles.aboutMeta}>Version 1.0.0 · Expo SDK 57</Text>
          </View>
        </StaggerItem>

        <StaggerItem index={4}>
          <PressableScale style={styles.resetBtn} onPress={resetAll}>
            <Text style={styles.resetText}>Reset demo data</Text>
          </PressableScale>
        </StaggerItem>
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
    paddingHorizontal: theme.spacing.sm,
  },
  headerTitle: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  section: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 60,
  },
  rowTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  rowSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2, lineHeight: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVal: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold, fontVariant: ['tabular-nums'], minWidth: 28, textAlign: 'center' },
  aboutBox: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm },
  aboutText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, lineHeight: 20 },
  aboutMeta: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption },
  resetBtn: { marginTop: theme.spacing.xxxl, alignItems: 'center', paddingVertical: theme.spacing.md },
  resetText: { color: theme.colors.danger, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.semibold },
});
