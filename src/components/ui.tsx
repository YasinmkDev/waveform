import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '../store/ui';
import { theme } from '../theme';

/* --------------------------------- Chip --------------------------------- */

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}
    >
      <Text style={[styles.chipText, { color: selected ? theme.colors.onAccent : theme.colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------- EmptyState ------------------------------ */

export function EmptyState({
  title,
  body,
  ctaLabel,
  onCta,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {ctaLabel && onCta ? (
        <Pressable onPress={onCta} style={styles.emptyCta} accessibilityRole="button">
          <Text style={styles.emptyCtaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------- Skeletons ------------------------------- */

export function SkeletonBox({ width, height, radius = theme.radii.md }: { width: number | `${number}%`; height: number; radius?: number }) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{ width, height, borderRadius: radius, backgroundColor: theme.colors.surfaceAlt }}
    />
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.skelRow}>
      <SkeletonBox width={48} height={48} radius={theme.radii.sm} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width="62%" height={13} radius={4} />
        <SkeletonBox width="38%" height={11} radius={4} />
      </View>
    </View>
  );
}

/* --------------------------------- Toast --------------------------------- */

/** Global toast host — mount once in the root layout. */
export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const nonce = useUiStore((s) => s.toastNonce);
  const clearToast = useUiStore((s) => s.clearToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2600);
    return () => clearTimeout(t);
  }, [toast, nonce, clearToast]);

  if (!toast) return null;
  return (
    <Animated.View
      key={nonce}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(180)}
      style={[styles.toast, { bottom: insets.bottom + 76 }]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radii.pill,
  },
  chipOn: { backgroundColor: theme.colors.accent },
  chipOff: { backgroundColor: theme.colors.surfaceAlt },
  chipText: { fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
  },
  emptyBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyCta: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.text,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: theme.radii.pill,
  },
  emptyCtaText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.body },
  skelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '86%',
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 50,
  },
  toastText: { color: theme.colors.onAccent, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
});
