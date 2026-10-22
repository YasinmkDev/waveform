import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Pause, Play } from 'lucide-react-native';
import Animated from 'react-native-reanimated';

import { theme } from '../theme';
import { usePressScale } from './motion';

/**
 * THE Play disc — the single loudest interactive element in the product.
 * Green fill, black glyph; green appears here and on live state only.
 */
export function PlayDisc({
  isPlaying,
  isBuffering = false,
  size = theme.layout.playDisc,
  onPress,
  light = false,
}: {
  isPlaying: boolean;
  isBuffering?: boolean;
  size?: number;
  onPress: () => void;
  /** White disc variant used on the Now Playing screen. */
  light?: boolean;
}) {
  const press = usePressScale(0.94);
  const bg = light ? theme.colors.text : theme.colors.accent;
  const fg = theme.colors.onAccent;
  const glyph = Math.round(size * 0.46);
  return (
    <Animated.View style={press.style}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        style={[styles.disc, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}
      >
        {isBuffering ? (
          <ActivityIndicator color={fg} />
        ) : isPlaying ? (
          <Pause size={glyph} color={fg} fill={fg} />
        ) : (
          <Play size={glyph} color={fg} fill={fg} style={{ marginLeft: size * 0.05 }} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
