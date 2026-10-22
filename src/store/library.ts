import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserPlaylist {
  id: string;
  title: string;
  trackIds: string[];
  createdAt: number;
}

/** Library entries are typed keys: 'playlist:<id>' | 'album:<id>' | 'artist:<id>' | 'user:<id>'. */
export type LibraryKey = string;

interface LibraryState {
  likedTrackIds: string[];
  followedArtistIds: string[];
  pinnedKeys: LibraryKey[];
  userPlaylists: UserPlaylist[];
  downloadedKeys: LibraryKey[];
  recentSearches: string[];
  toggleLike: (trackId: string) => boolean;
  toggleFollow: (artistId: string) => boolean;
  togglePin: (key: LibraryKey) => void;
  toggleDownload: (key: LibraryKey) => void;
  createPlaylist: (title: string) => string;
  renamePlaylist: (id: string, title: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  setPlaylistTracks: (playlistId: string, trackIds: string[]) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedTrackIds: [],
      followedArtistIds: [],
      pinnedKeys: [],
      userPlaylists: [],
      downloadedKeys: [],
      recentSearches: [],
      toggleLike: (trackId) => {
        const liked = get().likedTrackIds.includes(trackId);
        set((s) => ({
          likedTrackIds: liked
            ? s.likedTrackIds.filter((id) => id !== trackId)
            : [trackId, ...s.likedTrackIds],
        }));
        return !liked;
      },
      toggleFollow: (artistId) => {
        const following = get().followedArtistIds.includes(artistId);
        set((s) => ({
          followedArtistIds: following
            ? s.followedArtistIds.filter((id) => id !== artistId)
            : [artistId, ...s.followedArtistIds],
        }));
        return !following;
      },
      togglePin: (key) =>
        set((s) => ({
          pinnedKeys: s.pinnedKeys.includes(key)
            ? s.pinnedKeys.filter((k) => k !== key)
            : [key, ...s.pinnedKeys],
        })),
      toggleDownload: (key) =>
        set((s) => ({
          downloadedKeys: s.downloadedKeys.includes(key)
            ? s.downloadedKeys.filter((k) => k !== key)
            : [key, ...s.downloadedKeys],
        })),
      createPlaylist: (title) => {
        const id = `u${Date.now().toString(36)}`;
        set((s) => ({
          userPlaylists: [{ id, title: title.trim() || 'My Playlist', trackIds: [], createdAt: Date.now() }, ...s.userPlaylists],
        }));
        return id;
      },
      renamePlaylist: (id, title) =>
        set((s) => ({
          userPlaylists: s.userPlaylists.map((p) => (p.id === id ? { ...p, title: title.trim() || p.title } : p)),
        })),
      deletePlaylist: (id) =>
        set((s) => ({
          userPlaylists: s.userPlaylists.filter((p) => p.id !== id),
          pinnedKeys: s.pinnedKeys.filter((k) => k !== `user:${id}`),
        })),
      addToPlaylist: (playlistId, trackId) =>
        set((s) => ({
          userPlaylists: s.userPlaylists.map((p) =>
            p.id === playlistId && !p.trackIds.includes(trackId)
              ? { ...p, trackIds: [...p.trackIds, trackId] }
              : p,
          ),
        })),
      removeFromPlaylist: (playlistId, trackId) =>
        set((s) => ({
          userPlaylists: s.userPlaylists.map((p) =>
            p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p,
          ),
        })),
      setPlaylistTracks: (playlistId, trackIds) =>
        set((s) => ({
          userPlaylists: s.userPlaylists.map((p) => (p.id === playlistId ? { ...p, trackIds } : p)),
        })),
      addRecentSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      reset: () =>
        set({ likedTrackIds: [], followedArtistIds: [], pinnedKeys: [], userPlaylists: [], downloadedKeys: [], recentSearches: [] }),
    }),
    { name: 'waveform-library', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
