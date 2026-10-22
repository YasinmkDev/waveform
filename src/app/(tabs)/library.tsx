import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownAZ, LayoutGrid, List, MoreHorizontal, Pin, Plus, Search, X } from 'lucide-react-native';

import { ArtistCard, SquareCard } from '../../components/Cards';
import { Chip, EmptyState } from '../../components/ui';
import { ALBUMS, PLAYLISTS, art, getArtist } from '../../data/catalog';
import { useHistoryStore } from '../../store/history';
import { useLibraryStore, type LibraryKey } from '../../store/library';
import { usePlayerStore } from '../../store/player';
import { theme } from '../../theme';

type LibFilter = 'all' | 'playlists' | 'artists' | 'albums';
type SortMode = 'recents' | 'az';

interface LibEntry {
  key: LibraryKey;
  kind: 'liked' | 'user' | 'playlist' | 'album' | 'artist';
  title: string;
  subtitle: string;
  coverKey?: string;
  circle?: boolean;
  route: string;
  rank: number;
}

/**
 * Your Library — the investment surface (PLAN §6.3). Liked Songs is
 * pinned first; everything else is what the user saved, followed,
 * created or played. Chips filter in place; sort and grid/list are real.
 */
export default function LibraryScreen() {
  const [filter, setFilter] = useState<LibFilter>('all');
  const [sort, setSort] = useState<SortMode>('recents');
  const [grid, setGrid] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuKey, setMenuKey] = useState<LibraryKey | null>(null);

  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const followedArtistIds = useLibraryStore((s) => s.followedArtistIds);
  const pinnedKeys = useLibraryStore((s) => s.pinnedKeys);
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const togglePin = useLibraryStore((s) => s.togglePin);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const events = useHistoryStore((s) => s.events);
  const hasTrack = usePlayerStore((s) => s.queue.length > 0);

  const entries = useMemo<LibEntry[]>(() => {
    const list: LibEntry[] = [];
    list.push({
      key: 'liked',
      kind: 'liked',
      title: 'Liked Songs',
      subtitle: `Playlist · ${likedTrackIds.length} songs`,
      coverKey: 'playlist-liked',
      route: '/playlist/liked',
      rank: Number.MAX_SAFE_INTEGER,
    });
    for (const p of userPlaylists) {
      list.push({
        key: `user:${p.id}`,
        kind: 'user',
        title: p.title,
        subtitle: `Playlist · ${p.trackIds.length} songs`,
        coverKey: 'playlist-top-hits',
        route: `/playlist/${p.id}`,
        rank: p.createdAt,
      });
    }
    // Contexts the user actually played join the library (recency = last play time).
    const playedAt = new Map<string, number>();
    for (const e of events) {
      if (e.ctxLabel) playedAt.set(e.ctxLabel, Math.max(playedAt.get(e.ctxLabel) ?? 0, e.at));
    }
    for (const p of PLAYLISTS) {
      const key = `playlist:${p.id}`;
      if (playedAt.has(p.title) || pinnedKeys.includes(key)) {
        list.push({
          key,
          kind: 'playlist',
          title: p.title,
          subtitle: `Playlist · ${p.owner}`,
          coverKey: p.cover,
          route: `/playlist/${p.id}`,
          rank: playedAt.get(p.title) ?? 1,
        });
      }
    }
    for (const a of ALBUMS) {
      const key = `album:${a.id}`;
      if (playedAt.has(a.title) || pinnedKeys.includes(key)) {
        list.push({
          key,
          kind: 'album',
          title: a.title,
          subtitle: `Album · ${getArtist(a.artistId)?.name ?? ''}`,
          coverKey: a.cover,
          route: `/album/${a.id}`,
          rank: playedAt.get(a.title) ?? 1,
        });
      }
    }
    for (const artistId of followedArtistIds) {
      const a = getArtist(artistId);
      if (!a) continue;
      list.push({
        key: `artist:${a.id}`,
        kind: 'artist',
        title: a.name,
        subtitle: 'Artist',
        coverKey: a.image,
        circle: true,
        route: `/artist/${a.id}`,
        rank: 2,
      });
    }
    const pinnedFirst = (e: LibEntry) =>
      e.kind === 'liked' ? 0 : pinnedKeys.includes(e.key) ? 1 : 2;
    return list.sort((x, y) => {
      const px = pinnedFirst(x);
      const py = pinnedFirst(y);
      if (px !== py) return px - py;
      if (sort === 'az') return x.title.localeCompare(y.title);
      return y.rank - x.rank;
    });
  }, [likedTrackIds, userPlaylists, events, pinnedKeys, followedArtistIds, sort]);

  const filtered = entries.filter((e) => {
    if (filter === 'playlists' && !(e.kind === 'liked' || e.kind === 'user' || e.kind === 'playlist')) return false;
    if (filter === 'artists' && e.kind !== 'artist') return false;
    if (filter === 'albums' && e.kind !== 'album') return false;
    if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const menuEntry = entries.find((e) => e.key === menuKey);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn} onPress={() => setSearchOpen((v) => !v)} accessibilityLabel="Search in library">
            <Search size={23} color={theme.colors.text} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/create-playlist')} accessibilityLabel="Create playlist">
            <Plus size={26} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      {searchOpen ? (
        <View style={styles.searchWrap}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your library"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
            autoFocus
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear">
              <X size={18} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.chips}>
        {(
          [
            ['all', 'All'],
            ['playlists', 'Playlists'],
            ['artists', 'Artists'],
            ['albums', 'Albums'],
          ] as [LibFilter, string][]
        ).map(([key, label]) => (
          <Chip key={key} label={label} selected={filter === key} onPress={() => setFilter(key)} />
        ))}
      </View>

      <View style={styles.sortRow}>
        <Pressable
          style={styles.sortBtn}
          onPress={() => setSort((s) => (s === 'recents' ? 'az' : 'recents'))}
          accessibilityLabel="Change sort"
        >
          <ArrowDownAZ size={16} color={theme.colors.text} />
          <Text style={styles.sortText}>{sort === 'recents' ? 'Recents' : 'A–Z'}</Text>
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setGrid((v) => !v)} accessibilityLabel="Toggle grid view">
          {grid ? <List size={20} color={theme.colors.text} /> : <LayoutGrid size={20} color={theme.colors.text} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: hasTrack ? 150 : 96 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title={query ? 'No matches in your library' : 'Start building your library'}
            body={
              query
                ? 'Try a different search.'
                : 'Like songs, follow artists and create playlists — they will all live here.'
            }
            ctaLabel={query ? undefined : 'Create a playlist'}
            onCta={query ? undefined : () => router.push('/create-playlist')}
          />
        ) : grid ? (
          <View style={styles.grid}>
            {filtered.map((e) =>
              e.circle ? (
                <ArtistCard key={e.key} imageKey={e.coverKey ?? ''} name={e.title} size={150} onPress={() => router.push(e.route as never)} />
              ) : (
                <SquareCard
                  key={e.key}
                  coverKey={e.coverKey ?? 'playlist-top-hits'}
                  title={e.title}
                  caption={e.subtitle}
                  size={150}
                  onPress={() => router.push(e.route as never)}
                />
              ),
            )}
          </View>
        ) : (
          filtered.map((e) => (
            <View key={e.key} style={styles.row}>
              <Pressable style={styles.rowMain} onPress={() => router.push(e.route as never)}>
                <Image
                  source={art(e.coverKey ?? 'playlist-top-hits')}
                  style={[styles.rowArt, e.circle && { borderRadius: 24 }]}
                  contentFit="cover"
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {pinnedKeys.includes(e.key) ? 'Pinned · ' : ''}
                    {e.subtitle}
                  </Text>
                </View>
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => setMenuKey(e.key)} accessibilityLabel={`Options for ${e.title}`}>
                <MoreHorizontal size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!menuEntry} transparent animationType="fade" onRequestClose={() => setMenuKey(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuKey(null)}>
          {menuEntry ? (
            <View style={styles.menu}>
              <Text style={styles.menuTitle} numberOfLines={1}>
                {menuEntry.title}
              </Text>
              {menuEntry.kind !== 'liked' ? (
                <Pressable
                  style={styles.menuRow}
                  onPress={() => {
                    togglePin(menuEntry.key);
                    setMenuKey(null);
                  }}
                >
                  <Pin size={20} color={theme.colors.text} />
                  <Text style={styles.menuText}>
                    {pinnedKeys.includes(menuEntry.key) ? 'Unpin' : 'Pin to top'}
                  </Text>
                </Pressable>
              ) : null}
              {menuEntry.kind === 'user' ? (
                <Pressable
                  style={styles.menuRow}
                  onPress={() => {
                    const id = menuEntry.key.replace('user:', '');
                    const title = menuEntry.title;
                    setMenuKey(null);
                    Alert.alert('Delete playlist?', `"${title}" will be removed from your library.`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(id) },
                    ]);
                  }}
                >
                  <X size={20} color={theme.colors.danger} />
                  <Text style={[styles.menuText, { color: theme.colors.danger }]}>Delete playlist</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.menuRow} onPress={() => setMenuKey(null)}>
                <Text style={styles.menuText}>Cancel</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: { color: theme.colors.text, fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.extrabold },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.body, height: '100%' },
  chips: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  sortText: { color: theme.colors.text, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: theme.spacing.sm },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 68,
  },
  rowArt: { width: 52, height: 52, borderRadius: theme.radii.sm },
  rowTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  rowSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menu: {
    backgroundColor: theme.colors.surfaceAlt,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xs,
  },
  menuTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold, paddingVertical: theme.spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: 12 },
  menuText: { color: theme.colors.text, fontSize: theme.fontSize.body },
});
