import { StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

import { art } from '../data/catalog';
import { theme } from '../theme';
import { PressableScale } from './ui';

export function SquareCard({
  coverKey,
  title,
  caption,
  onPress,
  size = theme.layout.shelfCard,
}: {
  coverKey: string;
  title: string;
  caption?: string;
  onPress: () => void;
  size?: number;
}) {
  return (
    <PressableScale onPress={onPress} style={{ width: size }} accessibilityRole="button">
      <Image source={art(coverKey)} style={{ width: size, height: size, borderRadius: theme.radii.md }} contentFit="cover" transition={150} />
      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>
      {caption ? (
        <Text style={styles.cardCaption} numberOfLines={2}>
          {caption}
        </Text>
      ) : null}
    </PressableScale>
  );
}

/** Artists are CIRCLES, content is SQUARE — the shape code (PLAN §2.1). */
export function ArtistCard({
  imageKey,
  name,
  onPress,
  size = theme.layout.shelfCard,
}: {
  imageKey: string;
  name: string;
  onPress: () => void;
  size?: number;
}) {
  return (
    <PressableScale onPress={onPress} style={{ width: size, alignItems: 'center' }} accessibilityRole="button">
      <Image source={art(imageKey)} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" transition={150} />
      <Text style={[styles.cardTitle, { textAlign: 'center' }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.cardCaption}>Artist</Text>
    </PressableScale>
  );
}

export function ResumeTile({
  coverKey,
  title,
  onPress,
}: {
  coverKey: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      outerStyle={styles.tileOuter}
      style={styles.tileInner}
      accessibilityRole="button"
    >
      <Image source={art(coverKey)} style={styles.tileArt} contentFit="cover" transition={150} />
      <Text style={styles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  cardCaption: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  tileOuter: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    minHeight: 56,
  },
  tileInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  tileArt: { width: 56, height: 56 },
  tileTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semibold,
    paddingHorizontal: theme.spacing.sm,
  },
});
