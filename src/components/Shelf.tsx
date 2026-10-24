import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { theme } from '../theme';
import { StaggerItem } from './ui';

/**
 * A home shelf: section title + horizontal rail. Cards render at their
 * natural width and are CUT at the right edge of the screen — the cut is
 * the scroll signal (PLAN §6.1). No "see all" unless a destination exists.
 * Cards stagger in (40 ms/item, first 8); the shelf root carries a layout
 * animation so siblings slide when a section above appears/disappears.
 */
export function Shelf<T>({
  title,
  data,
  renderItem,
  keyExtractor,
}: {
  title: string;
  data: T[];
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T) => string;
}) {
  if (!data.length) return null;
  return (
    <Animated.View style={styles.shelf} layout={LinearTransition.springify()}>
      <Text style={styles.title}>{title}</Text>
      <FlashList
        horizontal
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => <StaggerItem index={index}>{renderItem(item, index)}</StaggerItem>}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: theme.spacing.lg }} />}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shelf: { marginTop: theme.spacing.xxl, gap: theme.spacing.md },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.lg,
  },
});
