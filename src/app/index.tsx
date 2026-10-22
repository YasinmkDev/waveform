import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

import { usePrefsStore } from '../store/prefs';
import { theme } from '../theme';

/**
 * Entry gate: wait for the persisted prefs to hydrate, then route to
 * Taste Onboarding on first run, or straight into the tabs.
 */
export default function Entry() {
  const onboarded = usePrefsStore((s) => s.onboarded);
  const [hydrated, setHydrated] = useState(() => usePrefsStore.persist.hasHydrated());

  useEffect(() => usePrefsStore.persist.onFinishHydration(() => setHydrated(true)), []);

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.canvas }} />;
  }
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
