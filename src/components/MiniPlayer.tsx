import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Music2, Pause, Play } from 'lucide-react-native';

import { theme } from '../theme';

/**
 * MiniPlayer — the persistent bar that sits above the tab bar and mirrors
 * the currently playing track. Placeholder: tapping it opens the full
 * player route; the play/pause button toggles local state only until the
 * expo-audio playback service lands.
 */
export function MiniPlayer() {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.main} onPress={() => router.push('/player')}>
        <View style={styles.artwork}>
          <Music2 size={20} color={theme.colors.textSecondary} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            No track playing
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            Pick something from Home to start listening
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.control}
        onPress={() => setPlaying((value) => !value)}
        accessibilityLabel={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <Pause size={24} color={theme.colors.text} fill={theme.colors.text} />
        ) : (
          <Play size={24} color={theme.colors.text} fill={theme.colors.text} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    // Floats directly above the tab bar.
    bottom: theme.layout.tabBarHeight + theme.spacing.sm,
    height: theme.layout.miniPlayerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  artwork: {
    width: theme.layout.artworkSm,
    height: theme.layout.artworkSm,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
  },
  artist: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
