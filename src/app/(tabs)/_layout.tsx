import { useEffect } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Library, Search, type LucideIcon } from 'lucide-react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { MiniPlayer } from '../../components/MiniPlayer';
import { popTo } from '../../components/motion';
import { theme } from '../../theme';

/** Tab icon: pops on focus (playful spring), still on blur. */
function TabIcon({
  Icon,
  focused,
  color,
  size,
}: {
  Icon: LucideIcon;
  focused: boolean;
  color: ColorValue;
  size: number;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused && !reduced) popTo(scale);
  }, [focused, reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={reduced ? undefined : style}>
      <Icon size={size} color={color as string} />
    </Animated.View>
  );
}

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
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabel: ({ focused, color, children }) => (
            <Animated.Text
              key={String(focused)}
              entering={FadeIn.duration(180)}
              style={{ color, fontSize: 11, fontWeight: '600' }}
            >
              {children}
            </Animated.Text>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Home} focused={focused} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Search} focused={focused} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Your Library',
            tabBarIcon: ({ color, size, focused }) => <TabIcon Icon={Library} focused={focused} color={color} size={size} />,
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
