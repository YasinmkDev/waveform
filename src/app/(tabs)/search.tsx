import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';

import { theme } from '../../theme';

interface Genre {
  id: string;
  name: string;
}

const GENRES: Genre[] = [
  { id: 'g-1', name: 'Pop' },
  { id: 'g-2', name: 'Hip-Hop' },
  { id: 'g-3', name: 'Rock' },
  { id: 'g-4', name: 'Electronic' },
  { id: 'g-5', name: 'Jazz' },
  { id: 'g-6', name: 'Classical' },
  { id: 'g-7', name: 'Podcasts' },
  { id: 'g-8', name: 'Live Events' },
];

/**
 * Search — a search field on top and a "Browse all" genre grid below.
 * Placeholder: the field is decorative until catalogue search is wired;
 * genre tiles use the flat palette from the theme.
 */
export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textTertiary} />
          <Text style={styles.searchHint}>What do you want to listen to?</Text>
        </View>

        <Text style={styles.sectionTitle}>Browse all</Text>
        <View style={styles.grid}>
          {GENRES.map((genre, index) => (
            <View
              key={genre.id}
              style={[
                styles.tile,
                { backgroundColor: theme.genrePalette[index % theme.genrePalette.length] },
              ]}
            >
              <Text style={styles.tileText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Placeholder browse grid — genre pages and live search results plug in with the catalogue
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    height: 48,
  },
  searchHint: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.body,
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
    gap: theme.spacing.md,
  },
  tile: {
    width: '47%',
    height: 100,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  tileText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.bold,
  },
  note: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    marginTop: theme.spacing.lg,
  },
});
