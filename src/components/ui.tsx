import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '../store/ui';
import { theme } from '../theme';
import { pulseOpacity, staggerDelay, usePressScale } from './motion';

/* ---------------------------- PressableScale ----------------------------- */

/**
 * Universal press-scale wrapper: 0.97 spring on press-in (0.94 for discs
 * via `scale`), plain render under Reduced Motion. `style` lands on the
 * inner Pressable (so rows/cards keep their layout); `outerStyle` sizes
 * the wrapper when it is a flex item (grid cells, row mains). `layout`
 * opts the wrapper into LinearTransition for reorder/filter animations.
 */
export function PressableScale({
  onPress,
  style,
  outerStyle,
  scale,
  layout,
  children,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  hitSlop,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
  scale?: number;
  layout?: boolean;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: 'button';
  accessibilityState?: { selected?: boolean };
  hitSlop?: number;
}) {
  const reduced = useReducedMotion();
  const press = usePressScale(scale);
  return (
    <Animated.View style={[reduced ? undefined : press.style, outerStyle]} layout={layout ? LinearTransition.springify() : undefined}>
      <Pressable
        onPress={onPress}
        onPressIn={reduced ? undefined : press.onPressIn}
        onPressOut={reduced ? undefined : press.onPressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        hitSlop={hitSlop}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------ StaggerItem ------------------------------ */

/**
 * FadeInDown stagger for list items: 40 ms/item, first 8 only, then plain.
 * With `layout`, removed items fade out (150 ms) and siblings slide —
 * the reorder/filter/delete animation.
 */
export function StaggerItem({
  index,
  layout,
  style,
  children,
}: {
  index: number;
  layout?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced || index >= 8 ? undefined : FadeInDown.delay(staggerDelay(index)).duration(300)}
      exiting={reduced || !layout ? undefined : FadeOut.duration(150)}
      layout={layout ? LinearTransition.springify() : undefined}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

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
    <PressableScale onPress={onPress} scale={0.96} layout accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}>
        <Text style={[styles.chipText, { color: selected ? theme.colors.onAccent : theme.colors.text }]}>
          {label}
        </Text>
      </View>
    </PressableScale>
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
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0.7);
  useEffect(() => {
    if (!reduced) pulseOpacity(opacity);
  }, [reduced, opacity]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.colors.surfaceAlt }, reduced ? undefined : pulseStyle]}
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
      exiting={SlideOutDown.duration(200)}
      style={[styles.toast, { bottom: insets.bottom + 76 }]}
      pointerEvents="none"
    >
      <Animated.View entering={SlideInUp.duration(theme.motion.durationBase)}>
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
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
