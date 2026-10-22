import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { SquareCard } from '../../components/Cards';
import { TrackRow } from '../../components/TrackRow';
import { EmptyState } from '../../components/ui';
import { PLAYLISTS, TRACKS, getGenre, tracksOf } from '../../data/catalog';
import { theme } from '../../theme';

/** Genre page: flat color field header, playlists that live in the genre, and its popular tracks. */
export default function GenreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const genre = getGenre(id ?? '');

  if (!genre) {
    return (
      <View style={styles.missing}>
        <EmptyState title="Genre not found" body="That shelf is empty." ctaLabel="Go back" onCta={() => router.back()} />
      </View>
    );
  }

  const genreTracks = TRACKS.filter((t) => t.genreId === genre.id).sort((a, b) => b.playCount - a.playCount);
  const playlists = PLAYLISTS.filter((p) => {
    const ts = tracksOf(p.trackIds);
    return ts.filter((t) => t.genreId === genre.id).length >= Math.ceil(ts.length / 3);
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.hero, { backgroundColor: genre.color, paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <Text style={styles.name}>{genre.name}</Text>
      </View>

      {playlists.length ? (
        <>
          <Text style={styles.section}>Playlists</Text>
          <View style={styles.grid}>
            {playlists.map((p) => (
              <SquareCard
                key={p.id}
                coverKey={p.cover}
                title={p.title}
                size={164}
                onPress={() => router.push(`/playlist/${p.id}`)}
              />
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.section}>Popular in {genre.name}</Text>
      {genreTracks.length ? (
        genreTracks.map((t, i) => (
          <TrackRow
            key={t.id}
            track={t}
            index={i}
            showIndex
            contextTracks={genreTracks.map((x) => x.id)}
            contextLabel={genre.name}
          />
        ))
      ) : (
        <Text style={styles.emptyLine}>No tracks tagged {genre.name} yet — browse a neighboring shelf from Search.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
  missing: { flex: 1, backgroundColor: theme.colors.canvas, justifyContent: 'center' },
  hero: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl, minHeight: 170, justifyContent: 'space-between' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontSize: 30, fontWeight: theme.fontWeight.extrabold },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyLine: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, paddingHorizontal: theme.spacing.lg },
});
