/**
 * Spotify Clone design tokens — dark music-player system.
 * Near-black canvas, raised dark surfaces, hairline borders, ONE flat
 * green accent. No gradients, no glow. All components read from here;
 * no hardcoded colors or spacing in screens.
 */
export const theme = {
  colors: {
    canvas: '#121212',
    surface: '#181818',
    surfaceAlt: '#232323',
    surfaceRaised: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#6A6A6A',
    border: '#2A2A2A',
    borderStrong: '#3A3A3A',
    accent: '#1DB954',
    accentText: '#000000',
    onAccent: '#000000',
    danger: '#F15E6C',
    dangerTint: '#3A1D20',
    success: '#1DB954',
    warning: '#F59E0C',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radii: { sm: 4, md: 8, lg: 12, xl: 16, pill: 999 },
  fontSize: {
    caption: 12,
    small: 13,
    body: 15,
    section: 20,
    title: 24,
    display: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  layout: {
    tabBarHeight: 56,
    miniPlayerHeight: 56,
    artworkSm: 48,
    artworkMd: 64,
    artworkLg: 152,
  },
  /** Flat genre tile colors for the Search browse grid. */
  genrePalette: [
    '#E13300',
    '#7358FF',
    '#1E3264',
    '#E8115B',
    '#477D95',
    '#777777',
    '#8D67AB',
    '#BA5D07',
  ],
};

export type Theme = typeof theme;
