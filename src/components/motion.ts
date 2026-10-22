import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
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

/** Press-scale behaviour for tappable surfaces: 0.97 on press-in, spring back. */
export function usePressScale(target = theme.motion.pressScale) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => springTo(scale, target), [scale, target]);
  const onPressOut = useCallback(() => springTo(scale, 1), [scale]);
  return { style, onPressIn, onPressOut };
}
