import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil } from 'lucide-react-native';

import { CollectionView } from '../../components/CollectionView';
import { EmptyState } from '../../components/ui';
import { LIKED_ID, getPlaylist } from '../../data/catalog';
import { buildTaste, weeklyMixPlaylist } from '../../lib/mix';
import { useHistoryStore } from '../../store/history';
import { useLibraryStore } from '../../store/library';
import { usePrefsStore } from '../../store/prefs';
import { theme } from '../../theme';

/**
 * Playlist detail — one route, four kinds:
 *  - system playlists from the catalog
 *  - 'weekly-mix': generated live from the user's taste + history
 *  - 'liked': the user's Liked Songs
 *  - user playlists (id from the library store), with rename/delete
 */
export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const renamePlaylist = useLibraryStore((s) => s.renamePlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const events = useHistoryStore((s) => s.events);
  const tasteArtistIds = usePrefsStore((s) => s.tasteArtistIds);
  const tasteGenreIds = usePrefsStore((s) => s.tasteGenreIds);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  if (id === LIKED_ID) {
    return (
      <CollectionView
        title="Liked Songs"
        subtitle="Every song you have saved with a heart — your collection, in the order you found it."
        coverKey="playlist-liked"
        trackIds={likedTrackIds}
        contextLabel="Liked Songs"
        emptyCta={{ label: 'Find songs to like', onPress: () => router.push('/(tabs)/search') }}
      />
    );
  }

  if (id === 'weekly-mix') {
    const taste = buildTaste(events, { tasteArtistIds, tasteGenreIds, likedTrackIds });
    const weekly = weeklyMixPlaylist(events, taste);
    return (
      <CollectionView
        title={weekly.title}
        subtitle="Made from your likes, your plays and the artists you picked — refreshed every Monday."
        coverKey={weekly.cover}
        trackIds={weekly.trackIds}
        contextLabel={weekly.title}
        saveKey="playlist:weekly-mix"
        downloadKey="playlist:weekly-mix"
      />
    );
  }

  const user = userPlaylists.find((p) => p.id === id);
  if (user) {
    return (
      <View style={{ flex: 1 }}>
        <CollectionView
          title={user.title}
          subtitle="Your playlist"
          coverKey={user.trackIds.length ? 'playlist-top-hits' : 'playlist-liked'}
          trackIds={user.trackIds}
          contextLabel={user.title}
          saveKey={`user:${user.id}`}
          removablePlaylistId={user.id}
          emptyCta={{ label: 'Find songs', onPress: () => router.push('/(tabs)/search') }}
          headerExtra={
            <Pressable
              style={styles.editBtn}
              onPress={() => {
                setDraftTitle(user.title);
                setEditing((v) => !v);
              }}
              accessibilityLabel="Edit playlist"
            >
              <Pencil size={20} color={theme.colors.text} />
            </Pressable>
          }
        />
        {editing ? (
          <View style={styles.editBar}>
            <TextInput
              value={draftTitle}
              onChangeText={setDraftTitle}
              style={styles.input}
              placeholder="Playlist name"
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
            />
            <Pressable
              style={styles.saveBtn}
              onPress={() => {
                renamePlaylist(user.id, draftTitle);
                setEditing(false);
              }}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
            <Pressable
              style={styles.deleteBtn}
              onPress={() =>
                Alert.alert('Delete playlist?', `"${user.title}" will be removed from your library.`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deletePlaylist(user.id);
                      router.back();
                    },
                  },
                ])
              }
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  const playlist = getPlaylist(id ?? '');
  if (!playlist) {
    return (
      <View style={styles.missing}>
        <EmptyState
          title="Playlist not found"
          body="It may have been removed."
          ctaLabel="Go back"
          onCta={() => router.back()}
        />
      </View>
    );
  }
  return (
    <CollectionView
      title={playlist.title}
      subtitle={playlist.description}
      coverKey={playlist.cover}
      trackIds={playlist.trackIds}
      contextLabel={playlist.title}
      saveKey={`playlist:${playlist.id}`}
      downloadKey={`playlist:${playlist.id}`}
    />
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: theme.colors.canvas, justifyContent: 'center' },
  editBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  editBar: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 120,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.text,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.fontSize.body,
  },
  saveBtn: { backgroundColor: theme.colors.text, borderRadius: theme.radii.pill, paddingVertical: 11, alignItems: 'center' },
  saveText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.bold },
  deleteBtn: { paddingVertical: 8, alignItems: 'center' },
  deleteText: { color: theme.colors.danger, fontWeight: theme.fontWeight.semibold },
});
