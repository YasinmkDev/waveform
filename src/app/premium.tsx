import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { usePrefsStore } from '../store/prefs';
import { useUiStore } from '../store/ui';
import { theme } from '../theme';

const ROWS: { label: string; free: string; premium: string }[] = [
  { label: 'House ads on Home', free: 'Yes', premium: 'None' },
  { label: 'Downloads', free: '—', premium: 'Included' },
  { label: 'Crossfade', free: 'Up to 2s', premium: 'Up to 6s' },
  { label: 'Weekly Mix & stats', free: 'Included', premium: 'Included' },
  { label: 'Queue control', free: 'Included', premium: 'Included' },
];

/**
 * Premium paywall (PLAN §6.12) — honest demo: real feature differences
 * wired through the app, a labeled demo checkout, no countdowns, no
 * fake scarcity, close always visible (no roach motel).
 */
export default function PremiumScreen() {
  const plan = usePrefsStore((s) => s.plan);
  const setPlan = usePrefsStore((s) => s.setPlan);
  const showToast = useUiStore((s) => s.showToast);
  const [tier, setTier] = useState<'monthly' | 'yearly'>('yearly');
  const [stage, setStage] = useState<'pitch' | 'checkout' | 'done'>('pitch');

  const subscribe = () => {
    setPlan('premium');
    setStage('done');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.iconBtn} />
        <Text style={styles.headerTitle}>Waveform Premium</Text>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Close">
          <X size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {stage === 'done' ? (
        <View style={styles.doneWrap}>
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.successCircle}>
            <Check size={40} color={theme.colors.onAccent} strokeWidth={3} />
          </Animated.View>
          <Text style={styles.doneTitle}>You are Premium</Text>
          <Text style={styles.doneSub}>House ads are gone, downloads are unlocked, crossfade runs to 6s.</Text>
          <Pressable style={styles.cta} onPress={() => router.back()}>
            <Text style={styles.ctaText}>Start listening</Text>
          </Pressable>
        </View>
      ) : stage === 'checkout' ? (
        <ScrollView contentContainerStyle={styles.checkout}>
          <Text style={styles.title}>{tier === 'yearly' ? 'Yearly · $49.99' : 'Monthly · $4.99'}</Text>
          <Text style={styles.sub}>Demo checkout — no real payment is taken, ever.</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Card number</Text>
            <Text style={styles.fieldValue}>•••• •••• •••• 4242 (demo)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={styles.fieldValue}>Guest Listener</Text>
          </View>
          <Pressable style={styles.cta} onPress={subscribe}>
            <Text style={styles.ctaText}>Subscribe (demo)</Text>
          </Pressable>
          <Pressable style={styles.backLink} onPress={() => setStage('pitch')}>
            <Text style={styles.backLinkText}>Back to plans</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.title}>Your music, uninterrupted.</Text>
          <Text style={styles.sub}>Everything Premium unlocks is already wired through the app — try the demo.</Text>

          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.td, styles.tdLabel]} />
              <Text style={styles.tdHead}>Free</Text>
              <Text style={[styles.tdHead, { color: theme.colors.accent }]}>Premium</Text>
            </View>
            {ROWS.map((r) => (
              <View key={r.label} style={styles.tr}>
                <Text style={[styles.td, styles.tdLabel]}>{r.label}</Text>
                <Text style={styles.td}>{r.free}</Text>
                <Text style={[styles.td, { color: theme.colors.text, fontWeight: theme.fontWeight.semibold }]}>{r.premium}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <Pressable
              style={[styles.planCard, tier === 'monthly' && styles.planCardOn]}
              onPress={() => setTier('monthly')}
            >
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>$4.99<Text style={styles.planPer}> / month</Text></Text>
              <Text style={styles.planNote}>Demo pricing</Text>
            </Pressable>
            <Pressable
              style={[styles.planCard, tier === 'yearly' && styles.planCardOn]}
              onPress={() => setTier('yearly')}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BEST VALUE</Text>
              </View>
              <Text style={styles.planName}>Yearly</Text>
              <Text style={styles.planPrice}>$49.99<Text style={styles.planPer}> / year</Text></Text>
              <Text style={styles.planNote}>Two months free vs monthly</Text>
            </Pressable>
          </View>

          {plan === 'premium' ? (
            <Text style={styles.already}>You are already Premium — enjoy.</Text>
          ) : (
            <Pressable style={styles.cta} onPress={() => setStage('checkout')}>
              <Text style={styles.ctaText}>Continue</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.restore}
            onPress={() =>
              showToast(plan === 'premium' ? 'Premium is active on this device' : 'No purchase found (demo)')
            }
          >
            <Text style={styles.restoreText}>Restore purchase</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas, paddingHorizontal: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: theme.fontWeight.extrabold, marginTop: theme.spacing.lg },
  sub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, marginTop: theme.spacing.sm, lineHeight: 21 },
  table: { marginTop: theme.spacing.xxl, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surface, padding: theme.spacing.md },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  trHead: { borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 10 },
  td: { width: 78, color: theme.colors.textSecondary, fontSize: theme.fontSize.small },
  tdLabel: { flex: 1, width: undefined, color: theme.colors.text, fontSize: theme.fontSize.small },
  tdHead: { width: 78, color: theme.colors.textSecondary, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.bold },
  plans: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xl },
  planCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: 3,
  },
  planCardOn: { borderColor: theme.colors.accent, backgroundColor: theme.colors.surface },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: { color: theme.colors.onAccent, fontSize: 10, fontWeight: theme.fontWeight.extrabold, letterSpacing: 0.6 },
  planName: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
  planPrice: { color: theme.colors.text, fontSize: 22, fontWeight: theme.fontWeight.extrabold },
  planPer: { fontSize: theme.fontSize.small, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  planNote: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  already: { color: theme.colors.accent, textAlign: 'center', marginTop: theme.spacing.xl, fontWeight: theme.fontWeight.bold },
  cta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  ctaText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.extrabold, fontSize: theme.fontSize.body },
  restore: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  restoreText: { color: theme.colors.textSecondary, fontWeight: theme.fontWeight.semibold },
  checkout: { paddingBottom: 40 },
  field: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  fieldLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginBottom: 4 },
  fieldValue: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  backLink: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  backLinkText: { color: theme.colors.textSecondary, fontWeight: theme.fontWeight.semibold },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { color: theme.colors.text, fontSize: 24, fontWeight: theme.fontWeight.extrabold, marginTop: theme.spacing.xl },
  doneSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, textAlign: 'center', marginTop: theme.spacing.sm, lineHeight: 21 },
});
