import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useLibraryStore } from '../store/library';
import { theme } from '../theme';
import { springTo } from './motion';

/**
 * Like toggle: optimistic, instant, with a pop on like and an Impact
 * Light haptic. The heart fills WHITE — in Waveform's grammar green is
 * reserved for action and live state, never affection (PLAN §7.1).
 */
export function LikeButton({ trackId, size = 22 }: { trackId: string; size?: number }) {
  const liked = useLibraryStore((s) => s.likedTrackIds.includes(trackId));
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const onPress = () => {
    const nowLiked = toggleLike(trackId);
    if (nowLiked) {
      springTo(pop, 1.3, true);
      setTimeout(() => springTo(pop, 1, true), 110);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
      style={styles.hit}
    >
      <Animated.View style={popStyle}>
        <Heart
          size={size}
          color={liked ? theme.colors.text : theme.colors.textSecondary}
          fill={liked ? theme.colors.text : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
