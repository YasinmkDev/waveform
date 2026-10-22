import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '../theme';

function setBar(sv: SharedValue<number>, playing: boolean, peak: number, duration: number) {
  if (playing) {
    sv.value = withRepeat(withTiming(peak, { duration }), -1, true);
  } else {
    sv.value = withTiming(0.35, { duration: 160 });
  }
}

function Bar({ playing, peak, duration, delay }: { playing: boolean; peak: number; duration: number; delay: number }) {
  const v = useSharedValue(0.35);
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(() => setBar(v, playing && !reduced, peak, duration), delay);
    return () => clearTimeout(t);
  }, [playing, reduced, v, peak, duration, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: v.value }] }));
  return <Animated.View style={[styles.bar, style]} />;
}

/**
 * The signature playing indicator: three tiny green bars bouncing at
 * different rates replaces the track's row number (Spotify's shape code
 * for "alive"). Paused = frozen bars. Reduced Motion = static bars.
 */
export function Equalizer({ playing, size = 14 }: { playing: boolean; size?: number }) {
  return (
    <View style={[styles.row, { height: size, width: size + 4 }]}>
      <Bar playing={playing} peak={1} duration={340} delay={0} />
      <Bar playing={playing} peak={0.9} duration={460} delay={90} />
      <Bar playing={playing} peak={0.75} duration={390} delay={180} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  bar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    transformOrigin: 'bottom',
  },
});
