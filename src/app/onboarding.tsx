import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, LinearTransition, useReducedMotion, ZoomIn } from 'react-native-reanimated';

import { ARTISTS, GENRES, art } from '../data/catalog';
import { PressableScale } from '../components/ui';
import { usePrefsStore } from '../store/prefs';
import { theme } from '../theme';

const MIN_ARTISTS = 3;

/**
 * Taste onboarding (PLAN §5.1): value before account, no account at all.
 * Declared taste solves the cold start — pick artists and genres, watch
 * them turn into a personal mix, land on a Home that is already yours.
 * The delight budget lives here (Mastery 6.4: first-time = flourish OK).
 */
export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [artists, setArtists] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [ready, setReady] = useState(false);
  const completeOnboarding = usePrefsStore((s) => s.completeOnboarding);

  useEffect(() => {
    if (!building) return;
    const t1 = setTimeout(() => setReady(true), 1100);
    return () => clearTimeout(t1);
  }, [building]);

  const finish = () => {
    completeOnboarding(artists, genres);
    router.replace('/(tabs)');
  };

  const skip = () => {
    completeOnboarding([], []);
    router.replace('/(tabs)');
  };

  const toggleArtist = (id: string) =>
    setArtists((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleGenre = (id: string) =>
    setGenres((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const reduced = useReducedMotion();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <View style={styles.segments}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={`${i}-${step >= i}`}
              entering={reduced ? undefined : FadeIn.duration(200)}
              layout={LinearTransition.springify()}
              style={[styles.segment, step >= i && styles.segmentOn]}
            />
          ))}
        </View>
        {!building ? (
          <PressableScale onPress={skip} hitSlop={10}>
            <Text style={styles.skip}>Skip</Text>
          </PressableScale>
        ) : null}
      </View>

      {step === 0 && !building ? (
        <Animated.View key="step0" entering={FadeInRight.duration(280)} style={styles.body}>
          <Text style={styles.title}>Which artists do you love?</Text>
          <Text style={styles.sub}>Pick at least {MIN_ARTISTS} — your home and mixes are built from these.</Text>
          <ScrollView contentContainerStyle={styles.bubbleGrid}>
            {ARTISTS.map((a, i) => {
              const selected = artists.includes(a.id);
              return (
                <Animated.View key={a.id} entering={FadeInDown.delay(i * 45).duration(280)} style={styles.bubbleCell}>
                  <PressableScale onPress={() => toggleArtist(a.id)} accessibilityRole="button" accessibilityState={{ selected }}>
                    <View style={[styles.bubbleRing, selected && styles.bubbleRingOn]}>
                      <Image source={art(a.image)} style={styles.bubble} contentFit="cover" />
                      {selected ? (
                        <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.checkBadge}>
                          <Check size={13} color={theme.colors.onAccent} strokeWidth={3.5} />
                        </Animated.View>
                      ) : null}
                    </View>
                    <Text style={[styles.bubbleName, selected && { color: theme.colors.text }]} numberOfLines={1}>
                      {a.name}
                    </Text>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </ScrollView>
          <PressableScale
            style={[styles.cta, artists.length < MIN_ARTISTS && styles.ctaOff]}
            disabled={artists.length < MIN_ARTISTS}
            onPress={() => setStep(1)}
          >
            <Text style={[styles.ctaText, artists.length < MIN_ARTISTS && { color: theme.colors.textTertiary }]}>
              {artists.length < MIN_ARTISTS
                ? `Pick ${MIN_ARTISTS - artists.length} more`
                : `Continue · ${artists.length} picked`}
            </Text>
          </PressableScale>
        </Animated.View>
      ) : null}

      {step === 1 && !building ? (
        <Animated.View key="step1" entering={FadeInRight.duration(280)} style={styles.body}>
          <Text style={styles.title}>What should we lean into?</Text>
          <Text style={styles.sub}>Genres sharpen your Weekly Mix. Pick as many as fit.</Text>
          <View style={styles.chipWrap}>
            {GENRES.map((g, i) => {
              const selected = genres.includes(g.id);
              return (
                <Animated.View key={g.id} entering={FadeInDown.delay(i * 35).duration(240)}>
                  <PressableScale
                    onPress={() => toggleGenre(g.id)}
                    style={[styles.genreChip, { backgroundColor: selected ? theme.colors.text : theme.colors.surfaceAlt }]}
                  >
                    <Text style={[styles.genreChipText, selected && { color: theme.colors.onAccent }]}>{g.name}</Text>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
          <View style={{ flex: 1 }} />
          <PressableScale style={styles.cta} onPress={() => setBuilding(true)}>
            <Text style={styles.ctaText}>Build my mix</Text>
          </PressableScale>
          <PressableScale onPress={() => setStep(0)} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </PressableScale>
        </Animated.View>
      ) : null}

      {building ? (
        <Animated.View key="building" entering={FadeIn.duration(300)} style={styles.buildWrap}>
          {!ready ? (
            <>
              <View style={styles.buildPulse}>
                <Image source={art('playlist-weekly-mix')} style={styles.buildArt} contentFit="cover" />
              </View>
              <Text style={styles.buildTitle}>Building your mix…</Text>
              <Text style={styles.sub}>
                Seeding it with {artists.length} artists and {genres.length} genres you picked.
              </Text>
            </>
          ) : (
            <>
              <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.successCircle}>
                <Check size={40} color={theme.colors.onAccent} strokeWidth={3} />
              </Animated.View>
              <Text style={styles.buildTitle}>Your mix is ready</Text>
              <Text style={styles.sub}>It sharpens every time you listen. Your first play is one tap away.</Text>
              <PressableScale style={[styles.cta, { alignSelf: 'stretch', marginTop: theme.spacing.xxl }]} onPress={finish}>
                <Text style={styles.ctaText}>Start listening</Text>
              </PressableScale>
            </>
          )}
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas, paddingHorizontal: theme.spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.md },
  segments: { flexDirection: 'row', gap: 6, flex: 1, marginRight: theme.spacing.lg },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.colors.surfaceRaised },
  segmentOn: { backgroundColor: theme.colors.text },
  skip: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.semibold },
  body: { flex: 1 },
  title: { color: theme.colors.text, fontSize: theme.fontSize.headline, fontWeight: theme.fontWeight.extrabold, lineHeight: 34, letterSpacing: -0.5 },
  sub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, marginTop: theme.spacing.sm, lineHeight: 21 },
  bubbleGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: theme.spacing.xl, gap: theme.spacing.lg },
  bubbleCell: { width: '29%', alignItems: 'center' },
  bubbleRing: { borderRadius: 999, padding: 3, borderWidth: 2, borderColor: 'transparent' },
  bubbleRingOn: { borderColor: theme.colors.text },
  bubble: { width: 92, height: 92, borderRadius: 46 },
  checkBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleName: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
    marginTop: 6,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, paddingTop: theme.spacing.xl },
  genreChip: { borderRadius: theme.radii.pill, paddingHorizontal: 18, paddingVertical: 11 },
  genreChipText: { color: '#fff', fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.small },
  cta: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ctaOff: { backgroundColor: theme.colors.surfaceAlt },
  ctaText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.extrabold, fontSize: theme.fontSize.body },
  backBtn: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  backText: { color: theme.colors.textSecondary, fontWeight: theme.fontWeight.semibold },
  buildWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  buildPulse: { borderRadius: theme.radii.xl, overflow: 'hidden' },
  buildArt: { width: 168, height: 168, borderRadius: theme.radii.xl },
  buildTitle: { color: theme.colors.text, fontSize: theme.fontSize.stat, fontWeight: theme.fontWeight.extrabold, marginTop: theme.spacing.xl, textAlign: 'center' },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
