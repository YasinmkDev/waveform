import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Search as SearchIcon, X } from 'lucide-react-native';

import { PlayDisc } from '../../components/PlayDisc';
import { TrackRow } from '../../components/TrackRow';
import { Chip, EmptyState, PressableScale, StaggerItem } from '../../components/ui';
import {
  GENRES,
  art,
  coverOfTrack,
  getArtist,
  searchCatalog,
} from '../../data/catalog';
import { useLibraryStore } from '../../store/library';
import { usePlayerStore } from '../../store/player';
import { theme } from '../../theme';

type ResultFilter = 'all' | 'tracks' | 'artists' | 'albums' | 'playlists';

/**
 * Search — find a specific thing fast; browse by genre when intent is
 * vague (PLAN §6.2). Results group as Top result → Songs → Artists →
 * Albums → Playlists, filterable by chips. Typing filters live.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ResultFilter>('all');
  const recentSearches = useLibraryStore((s) => s.recentSearches);
  const addRecentSearch = useLibraryStore((s) => s.addRecentSearch);
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches);
  const playContext = usePlayerStore((s) => s.playContext);
  const hasTrack = usePlayerStore((s) => s.queue.length > 0);

  const results = useMemo(() => searchCatalog(query), [query]);
  const searching = query.trim().length > 0;
  const resultTrackIds = results.tracks.map((t) => t.id);
  const topTrack = results.tracks[0];
  const topArtist = results.artists[0];
  const nothing =
    searching && !results.tracks.length && !results.artists.length && !results.albums.length && !results.playlists.length;

  const showTracks = filter === 'all' || filter === 'tracks';
  const showArtists = filter === 'all' || filter === 'artists';
  const showAlbums = filter === 'all' || filter === 'albums';
  const showPlaylists = filter === 'all' || filter === 'playlists';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Search</Text>
      <View style={styles.fieldWrap}>
        <SearchIcon size={20} color={theme.colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="What do you want to listen to?"
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (query.trim()) addRecentSearch(query.trim());
          }}
          autoCorrect={false}
        />
        {query ? (
          <PressableScale onPress={() => setQuery('')} scale={0.9} hitSlop={8} accessibilityLabel="Clear search">
            <X size={18} color={theme.colors.textSecondary} />
          </PressableScale>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: hasTrack ? 150 : 96 }}>
        {!searching ? (
          <>
            {recentSearches.length ? (
              <View style={styles.recentsHead}>
                <Text style={styles.section}>Recent searches</Text>
                <Pressable onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              </View>
            ) : null}
            {recentSearches.map((r, i) => (
              <StaggerItem key={r} index={i} layout>
                <PressableScale style={styles.recentRow} onPress={() => setQuery(r)}>
                  <Clock size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.recentText}>{r}</Text>
                </PressableScale>
              </StaggerItem>
            ))}
            <Text style={styles.section}>Browse all</Text>
            <View style={styles.genreGrid}>
              {GENRES.map((g, i) => (
                <StaggerItem key={g.id} index={i} style={{ width: '47.8%' }}>
                  <PressableScale
                    style={[styles.genreTile, { backgroundColor: g.color }]}
                    onPress={() => router.push(`/genre/${g.id}`)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.genreName}>{g.name}</Text>
                    <View style={styles.genreMotif} />
                  </PressableScale>
                </StaggerItem>
              ))}
            </View>
          </>
        ) : nothing ? (
          <EmptyState
            icon={<SearchIcon size={40} color={theme.colors.textTertiary} />}
            title={`No results for "${query.trim()}"`}
            body="Check the spelling, or try an artist, song or album name from the catalog."
          />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {(
                [
                  ['all', 'All'],
                  ['tracks', 'Songs'],
                  ['artists', 'Artists'],
                  ['albums', 'Albums'],
                  ['playlists', 'Playlists'],
                ] as [ResultFilter, string][]
              ).map(([key, label]) => (
                <Chip key={key} label={label} selected={filter === key} onPress={() => setFilter(key)} />
              ))}
            </ScrollView>

            {filter === 'all' && (topArtist || topTrack) ? (
              <>
                <Text style={styles.section}>Top result</Text>
                {topArtist ? (
                  <PressableScale style={styles.topCard} onPress={() => router.push(`/artist/${topArtist.id}`)}>
                    <Image source={art(topArtist.image)} style={styles.topArtistImg} contentFit="cover" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.topName} numberOfLines={1}>
                        {topArtist.name}
                      </Text>
                      <Text style={styles.topType}>Artist</Text>
                    </View>
                  </PressableScale>
                ) : topTrack ? (
                  <PressableScale style={styles.topCard} onPress={() => playContext(resultTrackIds, 0, 'Search results')}>
                    <Image source={art(coverOfTrack(topTrack))} style={styles.topTrackImg} contentFit="cover" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.topName} numberOfLines={1}>
                        {topTrack.title}
                      </Text>
                      <Text style={styles.topType}>Song · {getArtist(topTrack.artistId)?.name}</Text>
                    </View>
                    <PlayDisc
                      size={48}
                      isPlaying={false}
                      onPress={() => playContext(resultTrackIds, 0, 'Search results')}
                    />
                  </PressableScale>
                ) : null}
              </>
            ) : null}

            {showTracks && results.tracks.length ? (
              <>
                <Text style={styles.section}>Songs</Text>
                {results.tracks.map((t, i) => (
                  <StaggerItem key={t.id} index={i} layout>
                    <TrackRow track={t} contextTracks={resultTrackIds} contextLabel="Search results" />
                  </StaggerItem>
                ))}
              </>
            ) : null}

            {showArtists && results.artists.length ? (
              <>
                <Text style={styles.section}>Artists</Text>
                {results.artists.map((a, i) => (
                  <StaggerItem key={a.id} index={i} layout>
                    <PressableScale style={styles.entityRow} onPress={() => router.push(`/artist/${a.id}`)}>
                      <Image source={art(a.image)} style={styles.entityCircle} contentFit="cover" />
                      <View>
                        <Text style={styles.entityName}>{a.name}</Text>
                        <Text style={styles.entityType}>Artist</Text>
                      </View>
                    </PressableScale>
                  </StaggerItem>
                ))}
              </>
            ) : null}

            {showAlbums && results.albums.length ? (
              <>
                <Text style={styles.section}>Albums</Text>
                {results.albums.map((a, i) => (
                  <StaggerItem key={a.id} index={i} layout>
                    <PressableScale style={styles.entityRow} onPress={() => router.push(`/album/${a.id}`)}>
                      <Image source={art(a.cover)} style={styles.entitySquare} contentFit="cover" />
                      <View>
                        <Text style={styles.entityName}>{a.title}</Text>
                        <Text style={styles.entityType}>Album · {getArtist(a.artistId)?.name}</Text>
                      </View>
                    </PressableScale>
                  </StaggerItem>
                ))}
              </>
            ) : null}

            {showPlaylists && results.playlists.length ? (
              <>
                <Text style={styles.section}>Playlists</Text>
                {results.playlists.map((p, i) => (
                  <StaggerItem key={p.id} index={i} layout>
                    <PressableScale style={styles.entityRow} onPress={() => router.push(`/playlist/${p.id}`)}>
                      <Image source={art(p.cover)} style={styles.entitySquare} contentFit="cover" />
                      <View>
                        <Text style={styles.entityName}>{p.title}</Text>
                        <Text style={styles.entityType}>Playlist · {p.owner}</Text>
                      </View>
                    </PressableScale>
                  </StaggerItem>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.headline,
    fontWeight: theme.fontWeight.extrabold,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    height: theme.layout.searchFieldHeight,
  },
  input: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.body, height: '100%' },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  recentsHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: theme.spacing.lg,
  },
  clearText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  recentText: { color: theme.colors.text, fontSize: theme.fontSize.body },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  genreTile: {
    height: theme.layout.genreTileHeight,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  genreName: { color: '#fff', fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  genreMotif: {
    position: 'absolute',
    right: -theme.layout.genreMotif / 4,
    bottom: -theme.layout.genreMotif / 4,
    width: theme.layout.genreMotif,
    height: theme.layout.genreMotif,
    borderRadius: theme.layout.genreMotif / 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '24deg' }],
  },
  chips: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topArtistImg: { width: theme.layout.artworkTop, height: theme.layout.artworkTop, borderRadius: theme.layout.artworkTop / 2 },
  topTrackImg: { width: theme.layout.artworkTop, height: theme.layout.artworkTop, borderRadius: theme.radii.md },
  topName: { color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.extrabold },
  topType: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 64,
  },
  entityCircle: { width: 48, height: 48, borderRadius: 24 },
  entitySquare: { width: 48, height: 48, borderRadius: theme.radii.sm },
  entityName: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  entityType: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
});
