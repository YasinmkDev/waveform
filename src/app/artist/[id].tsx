import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shuffle } from 'lucide-react-native';

import { ArtistCard, SquareCard } from '../../components/Cards';
import { PlayDisc } from '../../components/PlayDisc';
import { TrackRow, formatDuration } from '../../components/TrackRow';
import { EmptyState, PressableScale, StaggerItem } from '../../components/ui';
import { ARTISTS, art, artistAlbums, artistTracks, getArtist } from '../../data/catalog';
import { formatCount } from '../../lib/stats';
import { useLibraryStore } from '../../store/library';
import { usePlayerStore } from '../../store/player';
import { theme } from '../../theme';

/**
 * Artist page (PLAN §6.5): circle hero (shape code at hero scale),
 * Follow as the investment action, Popular list with real sample play
 * counts, discography, and "fans also like" by shared genre.
 */
export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const artist = getArtist(id ?? '');
  const following = useLibraryStore((s) => (artist ? s.followedArtistIds.includes(artist.id) : false));
  const toggleFollow = useLibraryStore((s) => s.toggleFollow);
  const playContext = usePlayerStore((s) => s.playContext);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const storeShuffle = usePlayerStore((s) => s.shuffle);
  const currentId = usePlayerStore((s) => s.queue[s.index]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  if (!artist) {
    return (
      <View style={styles.missing}>
        <EmptyState title="Artist not found" body="They may have left the catalog." ctaLabel="Go back" onCta={() => router.back()} />
      </View>
    );
  }

  const tracks = artistTracks(artist.id);
  const albums = artistAlbums(artist.id);
  const trackIds = tracks.map((t) => t.id);
  const isThisArtist = tracks.some((t) => t.id === currentId);
  const alsoLike = ARTISTS.filter(
    (a) => a.id !== artist.id && a.genreIds.some((g) => artist.genreIds.includes(g)),
  ).slice(0, 6);

  const onPlay = (shuffle: boolean) => {
    if (isThisArtist && !shuffle) {
      togglePlay();
      return;
    }
    if (shuffle !== storeShuffle) toggleShuffle();
    playContext(trackIds, 0, artist.name);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={[styles.hero, { paddingTop: insets.top + theme.spacing.sm }]}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <ArrowLeft size={24} color={theme.colors.text} />
        </PressableScale>
        <Image source={art(artist.image)} style={styles.heroImg} contentFit="cover" />
        <Text style={styles.name}>{artist.name}</Text>
        <Text style={styles.listeners}>{formatCount(artist.monthlyListeners)} monthly listeners</Text>
        <Text style={styles.bio} numberOfLines={3}>
          {artist.bio}
        </Text>
        <View style={styles.actionRow}>
          <PressableScale
            onPress={() => toggleFollow(artist.id)}
            style={[styles.followBtn, following && styles.followBtnOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.followText, following && { color: theme.colors.text }]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </PressableScale>
          <PressableScale style={styles.iconBtn} onPress={() => onPlay(true)} accessibilityLabel="Shuffle play">
            <Shuffle size={22} color={theme.colors.textSecondary} />
          </PressableScale>
          <PlayDisc isPlaying={isThisArtist && isPlaying} onPress={() => onPlay(false)} />
        </View>
      </View>

      <Text style={styles.section}>Popular</Text>
      {tracks.map((t, i) => (
        <StaggerItem key={t.id} index={i} layout>
          <TrackRow track={t} index={i} showIndex contextTracks={trackIds} contextLabel={artist.name} />
          <Text style={styles.playCount}>
            {formatCount(t.playCount)} plays · {formatDuration(t.duration)}
          </Text>
        </StaggerItem>
      ))}

      {albums.length ? (
        <>
          <Text style={styles.section}>Discography</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {albums.map((a, i) => (
              <StaggerItem key={a.id} index={i}>
                <SquareCard
                  coverKey={a.cover}
                  title={a.title}
                  caption={`${a.year} · Album`}
                  onPress={() => router.push(`/album/${a.id}`)}
                />
              </StaggerItem>
            ))}
          </ScrollView>
        </>
      ) : null}

      {alsoLike.length ? (
        <>
          <Text style={styles.section}>Fans also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {alsoLike.map((a, i) => (
              <StaggerItem key={a.id} index={i}>
                <ArtistCard imageKey={a.image} name={a.name} onPress={() => router.push(`/artist/${a.id}`)} />
              </StaggerItem>
            ))}
          </ScrollView>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
  missing: { flex: 1, backgroundColor: theme.colors.canvas, justifyContent: 'center' },
  hero: { paddingHorizontal: theme.spacing.lg, alignItems: 'flex-start' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heroImg: { width: theme.layout.artworkArtistHero, height: theme.layout.artworkArtistHero, borderRadius: theme.layout.artworkArtistHero / 2, alignSelf: 'center', marginVertical: theme.spacing.md },
  name: { color: theme.colors.text, fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.extrabold, alignSelf: 'center', letterSpacing: -0.5, lineHeight: 36 },
  listeners: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, alignSelf: 'center', marginTop: 4 },
  bio: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, lineHeight: 19, marginTop: theme.spacing.md },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  followBtn: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  followBtnOn: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  followText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.small },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.sm,
  },
  playCount: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    paddingLeft: 76,
    marginTop: -6,
    marginBottom: 2,
  },
  rail: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
});
