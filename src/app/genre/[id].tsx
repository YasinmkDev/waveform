import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { SquareCard } from '../../components/Cards';
import { PlayDisc } from '../../components/PlayDisc';
import { TrackRow } from '../../components/TrackRow';
import { EmptyState, PressableScale, StaggerItem } from '../../components/ui';
import { PLAYLISTS, TRACKS, getGenre, tracksOf } from '../../data/catalog';
import { usePlayerStore } from '../../store/player';
import { theme } from '../../theme';

/** Genre page: flat color field header, playlists that live in the genre, and its popular tracks. */
export default function GenreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const genre = getGenre(id ?? '');
  // Hooks before the missing-genre early return (rules of hooks).
  const playContext = usePlayerStore((s) => s.playContext);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const currentId = usePlayerStore((s) => s.queue[s.index]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

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
  const genreTrackIds = genreTracks.map((t) => t.id);
  const isThisGenre = genreTracks.some((t) => t.id === currentId);
  const onPlayAll = () => {
    if (isThisGenre) {
      togglePlay();
      return;
    }
    playContext(genreTrackIds, 0, genre.name);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.hero, { backgroundColor: genre.color, paddingTop: insets.top + theme.spacing.sm }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color="#fff" />
        </PressableScale>
        <View style={styles.heroBottom}>
          <Text style={styles.name}>{genre.name}</Text>
          {genreTracks.length ? (
            <PlayDisc isPlaying={isThisGenre && isPlaying} onPress={onPlayAll} />
          ) : null}
        </View>
      </View>

      {playlists.length ? (
        <>
          <Text style={styles.section}>Playlists</Text>
          <View style={styles.grid}>
            {playlists.map((p, i) => (
              <StaggerItem key={p.id} index={i}>
                <SquareCard
                  coverKey={p.cover}
                  title={p.title}
                  size={164}
                  onPress={() => router.push(`/playlist/${p.id}`)}
                />
              </StaggerItem>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.section}>Popular in {genre.name}</Text>
      {genreTracks.length ? (
        genreTracks.map((t, i) => (
          <StaggerItem key={t.id} index={i} layout>
            <TrackRow
              track={t}
              index={i}
              showIndex
              contextTracks={genreTrackIds}
              contextLabel={genre.name}
            />
          </StaggerItem>
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
  hero: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxxl, minHeight: 170, justifyContent: 'space-between' },
  heroBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: theme.spacing.md },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontSize: theme.fontSize.displayXl, fontWeight: theme.fontWeight.extrabold, letterSpacing: -0.5, lineHeight: 38 },
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
