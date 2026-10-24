import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, GripVertical, X } from 'lucide-react-native';

import { EmptyState, PressableScale, StaggerItem } from '../components/ui';
import { art, coverOfTrack, getArtist, getTrack } from '../data/catalog';
import { useHistoryStore } from '../store/history';
import { usePlayerStore } from '../store/player';
import { useUiStore } from '../store/ui';
import { theme } from '../theme';

/**
 * Queue — Now Playing, then "Next in Queue". Reorder is tap-to-place:
 * long-press a row to pick it up (it lifts), tap another row to drop it
 * there. X removes a row. Everything edits the live queue immediately.
 */
export default function QueueScreen() {
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const contextLabel = usePlayerStore((s) => s.contextLabel);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const moveQueueItem = usePlayerStore((s) => s.moveQueueItem);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const playContext = usePlayerStore((s) => s.playContext);
  const events = useHistoryStore((s) => s.events);
  const showToast = useUiStore((s) => s.showToast);
  const [picked, setPicked] = useState<number | null>(null);

  const current = queue[index] ? getTrack(queue[index]) : undefined;
  const upcoming = queue.slice(index + 1);
  const recentIds = [...new Set([...events].reverse().map((e) => e.trackId))]
    .filter((id) => id !== current?.id)
    .slice(0, 6);

  const onRowTap = (absoluteIndex: number) => {
    if (picked == null) return;
    if (picked !== absoluteIndex) {
      moveQueueItem(picked, absoluteIndex);
      showToast('Queue updated');
    }
    setPicked(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <PressableScale style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Close queue">
          <ChevronDown size={28} color={theme.colors.text} />
        </PressableScale>
        <Text style={styles.title}>Queue</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        {!current ? (
          <EmptyState
            title="Your queue is empty"
            body="Play something and the queue will line up here."
            ctaLabel="Browse music"
            onCta={() => router.back()}
          />
        ) : (
          <>
            <Text style={styles.section}>Now playing</Text>
            <View style={styles.currentRow}>
              <Image source={art(coverOfTrack(current))} style={styles.art} contentFit="cover" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.rowTitle, { color: theme.colors.accent }]} numberOfLines={1}>
                  {current.title}
                </Text>
                <Text style={styles.rowArtist} numberOfLines={1}>
                  {getArtist(current.artistId)?.name} · {contextLabel}
                </Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.section}>Next in queue</Text>
              {upcoming.length > 1 ? (
                <PressableScale
                  onPress={() => {
                    clearQueue();
                    setPicked(null);
                    showToast('Queue cleared — current track keeps playing');
                  }}
                >
                  <Text style={styles.clear}>Clear</Text>
                </PressableScale>
              ) : null}
            </View>
            {picked != null ? (
              <Text style={styles.hint}>Tap a row to place “{getTrack(queue[picked])?.title}” there — tap it again to cancel.</Text>
            ) : (
              <Text style={styles.hint}>Long-press a row to reorder it.</Text>
            )}
            {upcoming.length === 0 ? (
              <Text style={styles.emptyLine}>Nothing lined up. Add tracks from any track menu (the ⋯ button).</Text>
            ) : (
              upcoming.map((id, i) => {
                const absolute = index + 1 + i;
                const t = getTrack(id);
                if (!t) return null;
                const isPicked = picked === absolute;
                return (
                  <StaggerItem key={`${id}-${absolute}`} index={i} layout>
                    <PressableScale
                      style={[styles.row, isPicked && styles.rowPicked]}
                      onPress={() => onRowTap(absolute)}
                      onLongPress={() => setPicked(isPicked ? null : absolute)}
                      delayLongPress={300}
                    >
                      <GripVertical size={18} color={theme.colors.textTertiary} />
                      <Image source={art(coverOfTrack(t))} style={styles.art} contentFit="cover" />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <Text style={styles.rowArtist} numberOfLines={1}>
                          {getArtist(t.artistId)?.name}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => removeFromQueue(absolute)}
                        hitSlop={8}
                        style={styles.iconBtn}
                        accessibilityLabel={`Remove ${t.title} from queue`}
                      >
                        <X size={18} color={theme.colors.textSecondary} />
                      </Pressable>
                    </PressableScale>
                  </StaggerItem>
                );
              })
            )}

            {recentIds.length ? (
              <>
                <Text style={[styles.section, { marginTop: theme.spacing.xxl }]}>Recently played</Text>
                {recentIds.map((id, i) => {
                  const t = getTrack(id);
                  if (!t) return null;
                  return (
                    <StaggerItem key={id} index={i} layout>
                      <PressableScale style={styles.row} onPress={() => playContext([id], 0, 'Recently played')}>
                        <Image source={art(coverOfTrack(t))} style={styles.art} contentFit="cover" />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.rowTitle} numberOfLines={1}>
                            {t.title}
                          </Text>
                          <Text style={styles.rowArtist} numberOfLines={1}>
                            {getArtist(t.artistId)?.name}
                          </Text>
                        </View>
                      </PressableScale>
                    </StaggerItem>
                  );
                })}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  section: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: theme.spacing.lg },
  clear: { color: theme.colors.textSecondary, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.semibold, marginTop: theme.spacing.lg },
  hint: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm },
  emptyLine: { color: theme.colors.textSecondary, fontSize: theme.fontSize.body, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 60,
  },
  rowPicked: { backgroundColor: theme.colors.surfaceRaised, borderRadius: theme.radii.md },
  art: { width: 44, height: 44, borderRadius: theme.radii.sm },
  rowTitle: { color: theme.colors.text, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  rowArtist: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
});
