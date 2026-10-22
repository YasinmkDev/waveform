import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Check, Disc3, Heart, ListMusic, ListPlus, Play, Plus, Share2, User, X } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { art, coverOfTrack, getAlbum, getArtist, type Track } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { useUiStore } from '../store/ui';
import { theme } from '../theme';

function SheetShell({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View entering={SlideInDown.duration(theme.motion.durationSheet)} style={styles.sheet}>
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function SheetRow({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.sheetRow} accessibilityRole="button">
      {icon}
      <Text style={[styles.sheetRowText, active && { color: theme.colors.accent }]}>{label}</Text>
      {active ? <Check size={18} color={theme.colors.accent} /> : null}
    </Pressable>
  );
}

/* ----------------------------- Playlist picker ---------------------------- */

export function PlaylistPicker({
  track,
  visible,
  onClose,
}: {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
}) {
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const showToast = useUiStore((s) => s.showToast);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  if (!track) return null;

  const pick = (playlistId: string, title: string) => {
    addToPlaylist(playlistId, track.id);
    showToast(`Added to ${title}`);
    onClose();
  };

  return (
    <SheetShell visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Add to playlist</Text>
      <SheetRow
        icon={<Plus size={22} color={theme.colors.text} />}
        label="New playlist"
        onPress={() => setCreating(true)}
      />
      {creating ? (
        <View style={styles.createBox}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={theme.colors.textTertiary}
            autoFocus
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              const id = createPlaylist(name || 'My Playlist');
              pick(id, name || 'My Playlist');
              setCreating(false);
              setName('');
            }}
          />
        </View>
      ) : null}
      <ScrollView style={{ maxHeight: 300 }}>
        {userPlaylists.map((p) => (
          <SheetRow
            key={p.id}
            icon={<ListMusic size={22} color={theme.colors.textSecondary} />}
            label={`${p.title} · ${p.trackIds.length} songs`}
            onPress={() => pick(p.id, p.title)}
          />
        ))}
        {userPlaylists.length === 0 && !creating ? (
          <Text style={styles.sheetHint}>No playlists yet — create your first one above.</Text>
        ) : null}
      </ScrollView>
    </SheetShell>
  );
}

/* ------------------------------- Track menu ------------------------------- */

export function TrackMenu({
  track,
  visible,
  onClose,
  onRemoveFromPlaylist,
}: {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
  onRemoveFromPlaylist?: () => void;
}) {
  const liked = useLibraryStore((s) => (track ? s.likedTrackIds.includes(track.id) : false));
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const showToast = useUiStore((s) => s.showToast);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!track) return null;
  const artist = getArtist(track.artistId);
  const album = getAlbum(track.albumId);

  const close = () => {
    setPickerOpen(false);
    onClose();
  };

  return (
    <>
      <SheetShell visible={visible && !pickerOpen} onClose={close}>
        <View style={styles.trackHead}>
          <Image source={art(coverOfTrack(track))} style={styles.trackArt} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {artist?.name}
            </Text>
          </View>
        </View>
        <SheetRow
          icon={<Heart size={22} color={liked ? theme.colors.text : theme.colors.textSecondary} fill={liked ? theme.colors.text : 'transparent'} />}
          label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
          active={liked}
          onPress={() => {
            toggleLike(track.id);
            close();
          }}
        />
        <SheetRow
          icon={<ListPlus size={22} color={theme.colors.textSecondary} />}
          label="Add to playlist"
          onPress={() => setPickerOpen(true)}
        />
        <SheetRow
          icon={<Play size={22} color={theme.colors.textSecondary} />}
          label="Play next (add to queue)"
          onPress={() => {
            addToQueue(track.id);
            close();
          }}
        />
        <SheetRow
          icon={<User size={22} color={theme.colors.textSecondary} />}
          label={`Go to artist · ${artist?.name ?? ''}`}
          onPress={() => {
            close();
            router.push(`/artist/${track.artistId}`);
          }}
        />
        <SheetRow
          icon={<Disc3 size={22} color={theme.colors.textSecondary} />}
          label={`Go to album · ${album?.title ?? ''}`}
          onPress={() => {
            close();
            router.push(`/album/${track.albumId}`);
          }}
        />
        <SheetRow
          icon={<Share2 size={22} color={theme.colors.textSecondary} />}
          label="Share"
          onPress={() => {
            showToast('Link copied to clipboard');
            close();
          }}
        />
        {onRemoveFromPlaylist ? (
          <SheetRow
            icon={<X size={22} color={theme.colors.danger} />}
            label="Remove from this playlist"
            onPress={() => {
              onRemoveFromPlaylist();
              close();
            }}
          />
        ) : null}
      </SheetShell>
      <PlaylistPicker track={track} visible={pickerOpen} onClose={close} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surfaceAlt,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    maxHeight: '82%',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.md,
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingVertical: theme.spacing.sm,
  },
  sheetHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
    paddingVertical: theme.spacing.md,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: 13,
  },
  sheetRowText: { color: theme.colors.text, fontSize: theme.fontSize.body, flex: 1 },
  trackHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  trackArt: { width: 52, height: 52, borderRadius: theme.radii.sm },
  trackTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.bold },
  trackArtist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  createBox: { paddingVertical: theme.spacing.sm },
  input: {
    backgroundColor: theme.colors.surfaceRaised,
    color: theme.colors.text,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.fontSize.body,
  },
});
