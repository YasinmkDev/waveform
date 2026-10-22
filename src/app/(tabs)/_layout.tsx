import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Library, Search } from 'lucide-react-native';

import { MiniPlayer } from '../../components/MiniPlayer';
import { theme } from '../../theme';

/**
 * Three tabs — Home / Search / Your Library (the dissection's ruling:
 * profile lives behind the header avatar, not in the tab bar).
 */
export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.canvas,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: theme.layout.tabBarHeight,
          },
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Your Library',
            tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
});
