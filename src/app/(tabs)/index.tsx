import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Music2 } from 'lucide-react-native';

import { theme } from '../../theme';

interface ShelfItem {
  id: string;
  title: string;
  subtitle: string;
}

const RECENTLY_PLAYED: ShelfItem[] = [
  { id: 'rp-1', title: 'Liked Songs', subtitle: 'Playlist' },
  { id: 'rp-2', title: 'Daily Mix 01', subtitle: 'Playlist' },
  { id: 'rp-3', title: 'Chill Hits', subtitle: 'Playlist' },
  { id: 'rp-4', title: 'Top Hits 2026', subtitle: 'Playlist' },
  { id: 'rp-5', title: 'Acoustic Covers', subtitle: 'Album' },
  { id: 'rp-6', title: 'Workout Beats', subtitle: 'Playlist' },
];

const MADE_FOR_YOU: ShelfItem[] = [
  { id: 'mf-1', title: 'Discover Weekly', subtitle: 'Fresh picks every Monday' },
  { id: 'mf-2', title: 'Release Radar', subtitle: 'New music from artists you follow' },
  { id: 'mf-3', title: 'On Repeat', subtitle: 'Songs you cannot get enough of' },
  { id: 'mf-4', title: 'Time Capsule', subtitle: 'Throwbacks picked for you' },
];

function ArtworkPlaceholder({ size }: { size: number }) {
  return (
    <View style={[styles.artwork, { width: size, height: size }]}>
      <Music2 size={size / 3} color={theme.colors.textSecondary} />
    </View>
  );
}

/**
 * Home — the landing feed. A quick-pick grid of recently played items on
 * top, then personalised "Made for you" shelves. Placeholder content until
 * the catalogue service lands; tapping any card opens the player route.
 */
export default function HomeScreen() {
  const openPlayer = () => router.push('/player');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Good evening</Text>

        <Text style={styles.sectionTitle}>Recently played</Text>
        <View style={styles.grid}>
          {RECENTLY_PLAYED.map((item) => (
            <Pressable key={item.id} style={styles.gridCard} onPress={openPlayer}>
              <ArtworkPlaceholder size={theme.layout.artworkSm} />
              <Text style={styles.gridTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Made for you</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shelf}
        >
          {MADE_FOR_YOU.map((item) => (
            <Pressable key={item.id} style={styles.shelfCard} onPress={openPlayer}>
              <ArtworkPlaceholder size={theme.layout.artworkLg} />
              <Text style={styles.shelfTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.shelfSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.note}>
          Placeholder shelves — real recommendations plug in once the catalogue and listening
          history services exist.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.lg,
    // Clears the floating mini player + tab bar.
    paddingBottom: theme.layout.tabBarHeight + theme.layout.miniPlayerHeight + theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  gridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.sm,
    paddingRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  gridTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
  },
  shelf: {
    gap: theme.spacing.md,
  },
  shelfCard: {
    width: theme.layout.artworkLg,
    gap: theme.spacing.xs,
  },
  shelfTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  shelfSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
  },
  artwork: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    marginTop: theme.spacing.lg,
  },
});
