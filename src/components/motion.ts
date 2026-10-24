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

/** Pop: brief overshoot then settle — tab icons, PlayDisc toggle pulse. */
export function popTo(sv: SharedValue<number>) {
  sv.value = withSequence(
    withSpring(1.18, theme.motion.springPlayful),
    withSpring(1, theme.motion.springUI),
  );
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

/** Press-scale behaviour for tappable surfaces: 0.97 on press-in, spring back. */
export function usePressScale(target = theme.motion.pressScale) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => springTo(scale, target), [scale, target]);
  const onPressOut = useCallback(() => springTo(scale, 1), [scale]);
  return { style, onPressIn, onPressOut };
}
