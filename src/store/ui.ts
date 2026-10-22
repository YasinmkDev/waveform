import { create } from 'zustand';

interface UiState {
  toast: string | null;
  toastNonce: number;
  showToast: (message: string) => void;
  clearToast: () => void;
}

/** Tiny global toast store — confirmations that must never block (Mastery 6.6 #6). */
export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  toastNonce: 0,
  showToast: (message) => set((s) => ({ toast: message, toastNonce: s.toastNonce + 1 })),
  clearToast: () => set({ toast: null }),
}));
