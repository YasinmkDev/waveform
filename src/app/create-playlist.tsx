import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { useLibraryStore } from '../store/library';
import { theme } from '../theme';

/** Create playlist — one field, one decision, straight into the playlist. */
export default function CreatePlaylistScreen() {
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const count = useLibraryStore((s) => s.userPlaylists.length);
  const [name, setName] = useState('');

  const create = () => {
    const id = createPlaylist(name.trim() || `My Playlist #${count + 1}`);
    router.replace(`/playlist/${id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.close} onPress={() => router.back()} accessibilityLabel="Cancel">
        <X size={26} color={theme.colors.text} />
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.title}>Give your playlist a name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={`My Playlist #${count + 1}`}
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.input}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={create}
          maxLength={60}
        />
        <View style={styles.underline} />
        <Pressable style={styles.cta} onPress={create}>
          <Text style={styles.ctaText}>Create</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.canvas, paddingHorizontal: theme.spacing.xl },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  body: { marginTop: 60, alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: theme.fontSize.section, fontWeight: theme.fontWeight.bold },
  input: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: theme.fontWeight.extrabold,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    minWidth: '80%',
  },
  underline: { height: 1, backgroundColor: theme.colors.borderStrong, alignSelf: 'stretch', marginTop: theme.spacing.md },
  cta: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 34,
    paddingVertical: 13,
    marginTop: theme.spacing.xxl,
  },
  ctaText: { color: theme.colors.onAccent, fontWeight: theme.fontWeight.extrabold, fontSize: theme.fontSize.body },
});
