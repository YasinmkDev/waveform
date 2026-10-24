import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Check, Disc3, Heart, ListMusic, ListPlus, Moon, Play, Plus, Share2, User, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { art, coverOfTrack, getAlbum, getArtist, type Track } from '../data/catalog';
import { copyTrackLink } from '../lib/share';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { useUiStore } from '../store/ui';
import { sheetSlideIn, sheetSlideOut, sheetSnap } from './motion';
import { theme } from '../theme';
import { PressableScale } from './ui';

/**
 * Spring bottom sheet. Exits are shared-value driven, not `exiting`
 * props: a Modal unmounts its whole native subtree instantly, so an
 * exit animation declared on it can never play. Instead the sheet
 * slides down + the backdrop fades, and only then does onClose fire
 * (backdrop path) or the Modal unmount (prop-driven path).
 */
export function SheetShell({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const reduced = useReducedMotion();
  const sheetY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);
  const exitingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const animateIn = () => {
    exitingRef.current = false;
    if (reduced) {
      sheetSnap(sheetY, backdropOpacity, 0, 1);
      return;
    }
    sheetSlideIn(sheetY, backdropOpacity);
  };

  const animateOut = (done: () => void) => {
    if (exitingRef.current) {
      done();
      return;
    }
    exitingRef.current = true;
    if (reduced) {
      done();
      return;
    }
    sheetSlideOut(sheetY, backdropOpacity);
    timerRef.current = setTimeout(done, 260);
  };

  // Open: mount, then spring up. The Modal is a native view outside the
  // React tree, so mounting it must follow the visible prop here.
  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setMounted(true);
      animateIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Prop-driven close (e.g. picker opening over the menu): slide out, then unmount.
  useEffect(() => {
    if (!visible && mounted) {
      animateOut(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mounted]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  // Backdrop / hardware-back close: slide out first, then tell the parent.
  const requestClose = () => animateOut(onClose);

  if (!mounted) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdropDim, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function SheetRow({
  icon,
  label,
  onPress,
  active = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.sheetRow} accessibilityRole="button">
      {icon}
      <Text
        style={[
          styles.sheetRowText,
          active && { color: theme.colors.accent },
          danger && { color: theme.colors.danger },
        ]}
      >
        {label}
      </Text>
      {active ? <Check size={18} color={theme.colors.accent} /> : null}
    </PressableScale>
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

/* ------------------------------ Sleep timer ------------------------------- */

/**
 * Sleep timer sheet: 15 / 30 / 60 minutes or Off. The player store holds
 * `sleepUntil`; the engine stops playback when it is reached, across
 * track changes, and the Now Playing footer shows the countdown.
 */
export function SleepTimerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const sleepUntil = usePlayerStore((s) => s.sleepUntil);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const showToast = useUiStore((s) => s.showToast);

  const pick = (minutes: number | null) => {
    setSleepTimer(minutes);
    showToast(minutes == null ? 'Sleep timer off' : `Sleep timer set for ${minutes} minutes`);
    onClose();
  };

  // Active choice is read at open time; the sheet remounts on every open.
  // eslint-disable-next-line react-hooks/purity -- current time read is the feature here
  const activeMinutes = sleepUntil != null ? Math.round((sleepUntil - Date.now()) / 60000) : null;

  return (
    <SheetShell visible={visible} onClose={onClose}>
      <Text style={styles.sheetTitle}>Sleep timer</Text>
      <Text style={styles.sheetHint}>Playback stops when the timer ends, even mid-playlist.</Text>
      {[15, 30, 60].map((m) => (
        <SheetRow
          key={m}
          icon={<Moon size={22} color={theme.colors.textSecondary} />}
          label={`${m} minutes`}
          active={activeMinutes === m}
          onPress={() => pick(m)}
        />
      ))}
      {sleepUntil != null ? (
        <SheetRow
          icon={<X size={22} color={theme.colors.textSecondary} />}
          label="Turn off timer"
          onPress={() => pick(null)}
        />
      ) : null}
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
  const playNext = usePlayerStore((s) => s.playNext);
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
          label="Play next"
          onPress={() => {
            playNext(track.id);
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
            void copyTrackLink(track).then(() => {
              showToast('Link copied to clipboard');
              close();
            });
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
    justifyContent: 'flex-end',
  },
  backdropDim: { backgroundColor: 'rgba(0,0,0,0.6)' },
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
