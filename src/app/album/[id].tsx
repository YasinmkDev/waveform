import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable } from 'react-native';

import { CollectionView } from '../../components/CollectionView';
import { EmptyState } from '../../components/ui';
import { albumArtist, art, getAlbum } from '../../data/catalog';
import { theme } from '../../theme';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const album = getAlbum(id ?? '');

  if (!album) {
    return (
      <View style={styles.missing}>
        <EmptyState title="Album not found" body="It may have been removed." ctaLabel="Go back" onCta={() => router.back()} />
      </View>
    );
  }
  const artist = albumArtist(album);

  return (
    <CollectionView
      title={album.title}
      subtitle={`${album.year} · Album`}
      coverKey={album.cover}
      trackIds={album.trackIds}
      contextLabel={album.title}
      saveKey={`album:${album.id}`}
      downloadKey={`album:${album.id}`}
      headerExtra={undefined}
      childrenBottom={
        <Pressable
          style={styles.artistRow}
          onPress={() => router.push(`/artist/${artist.id}`)}
          accessibilityRole="button"
        >
          <Image source={art(artist.image)} style={styles.artistImg} contentFit="cover" />
          <View>
            <Text style={styles.artistLabel}>Artist</Text>
            <Text style={styles.artistName}>{artist.name}</Text>
          </View>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: theme.colors.canvas, justifyContent: 'center' },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  artistImg: { width: 52, height: 52, borderRadius: 26 },
  artistLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  artistName: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
});
