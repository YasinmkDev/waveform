import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ListMusic, Music2, User } from 'lucide-react-native';

import { theme } from '../../theme';

type LibraryKind = 'playlist' | 'album' | 'artist';

interface LibraryItem {
  id: string;
  title: string;
  kind: LibraryKind;
  detail: string;
}

const FILTERS = ['Playlists', 'Artists', 'Albums'] as const;

const ITEMS: LibraryItem[] = [
  { id: 'l-1', title: 'Liked Songs', kind: 'playlist', detail: 'Playlist · 128 songs' },
  { id: 'l-2', title: 'Chill Hits', kind: 'playlist', detail: 'Playlist · 64 songs' },
  { id: 'l-3', title: 'Midnight Sessions', kind: 'album', detail: 'Album · The Wanderers' },
  { id: 'l-4', title: 'Aria Vale', kind: 'artist', detail: 'Artist' },
  { id: 'l-5', title: 'Workout Beats', kind: 'playlist', detail: 'Playlist · 42 songs' },
];

function ItemIcon({ kind }: { kind: LibraryKind }) {
  if (kind === 'artist') {
    return <User size={22} color={theme.colors.textSecondary} />;
  }
  if (kind === 'playlist') {
    return <ListMusic size={22} color={theme.colors.textSecondary} />;
  }
  return <Music2 size={22} color={theme.colors.textSecondary} />;
}

/**
 * Your Library — filter chips (Playlists / Artists / Albums) over the
 * user's saved items. Placeholder rows; tapping one opens the player
 * route until collection detail screens exist.
 */
export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Library</Text>

        <View style={styles.chips}>
          {FILTERS.map((filter, index) => (
            <View key={filter} style={[styles.chip, index === 0 && styles.chipActive]}>
              <Text style={styles.chipText}>{filter}</Text>
            </View>
          ))}
        </View>

        <View style={styles.list}>
          {ITEMS.map((item) => (
            <Pressable key={item.id} style={styles.row} onPress={() => router.push('/player')}>
              <View style={[styles.artwork, item.kind === 'artist' && styles.artworkRound]}>
                <ItemIcon kind={item.kind} />
              </View>
              <View style={styles.meta}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowDetail} numberOfLines={1}>
                  {item.detail}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          Placeholder library — saved items, pins and recents sorting arrive with the account
          service.
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
    paddingBottom: theme.layout.tabBarHeight + theme.layout.miniPlayerHeight + theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
  },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.medium,
  },
  list: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  artwork: {
    width: theme.layout.artworkMd,
    height: theme.layout.artworkMd,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkRound: {
    borderRadius: theme.radii.pill,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
  },
  rowDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.small,
  },
  note: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    marginTop: theme.spacing.lg,
  },
});
