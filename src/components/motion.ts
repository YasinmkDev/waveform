import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '../theme';

/**
 * Shared-value writes live in module-level helpers (never inline in a
 * component handler) — keeps the React Compiler lint rule happy and the
 * motion language in one place.
 */
export function springTo(sv: SharedValue<number>, to: number, playful = false) {
  sv.value = withSpring(to, playful ? theme.motion.springPlayful : theme.motion.springUI);
}

export function fadeTo(sv: SharedValue<number>, to: number, duration = theme.motion.durationFast) {
  sv.value = withTiming(to, { duration });
}

/** Pop: brief overshoot then settle — tab icons (1.18), PlayDisc toggle (1.12). */
export function popTo(sv: SharedValue<number>, peak = 1.18) {
  sv.value = withSequence(
    withSpring(peak, theme.motion.springPlayful),
    withSpring(1, theme.motion.springUI),
  );
}

/** Artwork drag feedback: follow X, shrink to 0.94, tilt up to ±4°. */
export function artDragUpdate(
  tx: SharedValue<number>,
  sc: SharedValue<number>,
  rot: SharedValue<number>,
  dx: number,
) {
  tx.value = dx;
  sc.value = 0.94;
  rot.value = Math.max(-4, Math.min(4, dx / 25));
}

/** Artwork drag release: spring back to centered, full size, upright. */
export function artDragReset(tx: SharedValue<number>, sc: SharedValue<number>, rot: SharedValue<number>) {
  tx.value = withSpring(0, theme.motion.springUI);
  sc.value = withSpring(1, theme.motion.springUI);
  rot.value = withSpring(0, theme.motion.springUI);
}

/** Sheet entrance: spring up + backdrop fade in. */
export function sheetSlideIn(sheetY: SharedValue<number>, backdrop: SharedValue<number>) {
  sheetY.value = withSpring(0, theme.motion.springSheet);
  backdrop.value = withTiming(1, { duration: 180 });
}

/** Sheet exit: slide down + backdrop fade out. */
export function sheetSlideOut(sheetY: SharedValue<number>, backdrop: SharedValue<number>) {
  sheetY.value = withTiming(600, { duration: 250 });
  backdrop.value = withTiming(0, { duration: 200 });
}

/** Sheet instant position (Reduced Motion): no animation, just the state. */
export function sheetSnap(sheetY: SharedValue<number>, backdrop: SharedValue<number>, y: number, o: number) {
  sheetY.value = y;
  backdrop.value = o;
}

/** Pop-from: snap to `from`, then spring to 1 — track-change artwork pop. */
export function popFrom(sv: SharedValue<number>, from = 0.92) {
  sv.value = from;
  sv.value = withSpring(1, theme.motion.springPlayful);
}

/** Endless skeleton pulse: opacity 0.35 ↔ 0.7 on a 1.4 s loop. Never a loop on taps. */
export function pulseOpacity(sv: SharedValue<number>) {
  sv.value = withRepeat(
    withSequence(
      withTiming(0.35, { duration: 700 }),
      withTiming(0.7, { duration: 700 }),
    ),
    -1,
    false,
  );
}

/** Stagger delay for list items: 40 ms/item, capped at the first 8. */
export function staggerDelay(index: number): number {
  return Math.min(index, 7) * theme.motion.stagger;
}

/** Collection hero parallax (worklet): scale 1 → 1.08 + slight fade across
 *  scroll 0 → 300. Call inside useAnimatedStyle; Reduced Motion renders
 *  plain (the caller skips this style entirely when reduced). */
export function parallaxArt(scrollY: SharedValue<number>) {
  'worklet';
  const t = Math.min(Math.max(scrollY.value / 300, 0), 1);
  return {
    transform: [{ scale: 1 + t * 0.08 }],
    opacity: 1 - t * 0.15,
  };
}

/** Press-scale behaviour for tappable surfaces: 0.97 on press-in, spring back. */
export function usePressScale(target = theme.motion.pressScale) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => springTo(scale, target), [scale, target]);
  const onPressOut = useCallback(() => springTo(scale, 1), [scale]);
  return { style, onPressIn, onPressOut };
}
