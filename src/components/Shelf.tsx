import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { theme } from '../theme';

/**
 * A home shelf: section title + horizontal rail. Cards render at their
 * natural width and are CUT at the right edge of the screen — the cut is
 * the scroll signal (PLAN §6.1). No "see all" unless a destination exists.
 */
export function Shelf<T>({
  title,
  data,
  renderItem,
  keyExtractor,
}: {
  title: string;
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
}) {
  if (!data.length) return null;
  return (
    <View style={styles.shelf}>
      <Text style={styles.title}>{title}</Text>
      <FlashList
        horizontal
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => renderItem(item)}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: theme.spacing.lg }} />}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
      />
    </View>
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
