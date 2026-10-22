import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '../components/ui';
import { initEngine } from '../player/engine';
import { usePlayerStore } from '../store/player';
import { usePrefsStore } from '../store/prefs';
import { theme } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    initEngine((status) => usePlayerStore.getState()._onStatus(status));
    usePrefsStore.getState().bumpSession();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.canvas },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="player" options={{ presentation: 'modal' }} />
          <Stack.Screen name="queue" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create-playlist" options={{ presentation: 'modal' }} />
          <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
});
