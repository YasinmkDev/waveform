import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronRight, Clock3, Settings, User } from 'lucide-react-native';

import { theme } from '../../theme';

interface MenuRow {
  id: string;
  label: string;
  detail: string;
}

const STATS = [
  { id: 's-1', value: '12', label: 'Playlists' },
  { id: 's-2', value: '248', label: 'Following' },
  { id: 's-3', value: '96', label: 'Followers' },
] as const;

const MENU: MenuRow[] = [
  { id: 'm-1', label: 'Recently played', detail: 'Your listening history' },
  { id: 'm-2', label: 'Notifications', detail: 'New releases and playlist updates' },
  { id: 'm-3', label: 'Settings', detail: 'Playback, downloads and account' },
];

/**
 * Profile — identity header (avatar, name, follower stats) and the
 * account menu. Placeholder until auth exists; the avatar is an initials
 * disc and every row is inert for now.
 */
export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <User size={36} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.plan}>Free plan · Upgrade to Premium</Text>
        </View>

        <View style={styles.stats}>
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {MENU.map((row) => (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowIcon}>
                {row.id === 'm-1' ? (
                  <Clock3 size={20} color={theme.colors.text} />
                ) : row.id === 'm-2' ? (
                  <Bell size={20} color={theme.colors.text} />
                ) : (
                  <Settings size={20} color={theme.colors.text} />
                )}
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDetail}>{row.detail}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textTertiary} />
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Placeholder profile — sign-in, public playlists and listening stats arrive with the
          account service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.layout.tabBarHeight + theme.layout.miniPlayerHeight + theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
  },
  plan: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.small,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.section,
    fontWeight: theme.fontWeight.bold,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
  },
  menu: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMeta: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
  },
  rowDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.caption,
  },
  note: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
  },
});
