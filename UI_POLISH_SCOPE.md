# Waveform — UI Polish Scope: the "wow" pass (2026-10-24)

User brief: "polish the ui interface give me wow feeling search for inspo."
Research done first (2026-10-24). This pass is VISUAL polish only — motion from
the 2026-10-24 motion build stays untouched except where a visual change needs
a matching token. No behavior changes, no new features, no new dependencies.

## What the inspo actually says (and what we steal vs refuse)

- Spotify "Dark Immersive" direction: near-black #121212 stages, album color
  owning the screen, transitions flowing between rooms, heavy display type with
  tight tracking, uppercase wide-tracked labels, pill-and-circle geometry.
  STEAL: art-owns-the-screen + display type + kickers. (Source: designmd.app
  Spotify Dark Immersive library entry.)
- Spotify redesign concepts: function over ornament, strong hierarchy, large
  typography + thick outlines + flat components + high contrast for instant
  scannability. STEAL: bigger, bolder, tighter type; hairline definition on
  cards instead of shadows. (Source: Anirudh NV Spotify Redesign case study.)
- Music-app concepts: stretch the album artwork as far as it goes; users
  recognize art faster than text, so art leads and text follows.
  STEAL: bigger hero/player art, bigger shelf cards, art-led heroes.
- REFUSE, even though inspo shows it: glassmorphism, glow, gradients, neon.
  Standing user rule (2026-10-13, reinforced 2026-10-19): industry-grade clean,
  flat, ONE restrained accent. Wow here comes from scale, type, art and
  spacing — never from effects.

## Token changes first (src/theme.ts — everything else reads from here)

- Type scale: add `display: 34` and `hero: 44`; bump `section: 20 → 22`.
  Display/hero titles get `letterSpacing: -0.5` and tight line-height (≈1.05×).
- Consolidate orphans into tokens: artist name 28 → display, genre name 30 →
  display, onboarding 26 → display (or section where it is a subhead),
  premium title 26 → display, plan price 22 → section, profile statNum 20 →
  28 tabular extrabold (new `stat` size or inline token, not a magic number).
- Chip system (the single biggest discipline win): selected chip = WHITE
  background + BLACK text (Spotify-authentic); unselected = surfaceAlt +
  white text. Green is then reserved for actions + live state only, so it
  pops harder. Apply to Home chips, Search chips, Library chips, and
  onboarding taste bubbles (selected = white fill).
- Card definition without shadows: big surface cards (Home hero/cold/streak/ad,
  profile stats card, top-result card, premium plan cards) get a 1px hairline
  border in `border` (#2A2A2A) plus padding bumped to lg (16) where it is
  currently md (12). Lists/rows get NO borders (Spotify lists have none).
- MiniPlayer container: add the same 1px hairline border.

## Screen-by-screen polish

1. Home: greeting 24 → 32 extrabold tight. Weekly Mix hero = editorial card:
   art 76 → 96, title 20 → 24 extrabold, padding lg, hairline border, kicker
   unchanged. Resume tiles: art/minHeight 56 → 64. Streak card: add Flame icon
   (lucide, warning color already in theme) + border. Shelf titles use the
   new 22 section token. Ad card: border.
2. Now Playing (the stage): artwork fills the full content width (drop the
   380 cap; radius md → lg 12), track title 20 → 28 extrabold tight,
   artist body, transport spacing widened, PlayDisc 64 → 72. Flat album tint
   background stays — it IS the wow here, no gradient added.
3. CollectionView (playlist/album): hero art 232 → 264, title 24 → 32
   extrabold tight, subtitle small → body, hairline divider under the action
   row, PlayDisc 56 → 64. Add scroll parallax on the hero art (scale 1 →
   1.08 + slight fade across scroll 0→300, Animated scroll handler,
   useReducedMotion-safe; the sticky compact header behavior is unchanged).
4. Artist: name 28 → 34 display tight, circle hero 168 → 192, Follow becomes
   a real pill button — solid white + black text when not following,
   outlined surfaceAlt when following (read the current control first and
   keep its exact behavior).
5. Genre: name 30 → 36 display tight, hero block taller, motif larger.
6. Search: screen title 24 → 32, field height 48 → 52, genre tiles 104 →
   120 high with name body → section bold, top-result card art 64 → 80,
   name 20 → 24, padding lg + border.
7. Library: title 24 → 32, row art 52 → 56, row title medium → semibold,
   grid cards keep 150 (two-column rhythm is right).
8. Profile: name 24 → 32, stat numbers 20 → 28 tabular extrabold, stats card
   padding lg → xl + border, month card minHeight 300 → 320 (big 44 stays —
   it already uses the hero token), history art 44 → 48.
9. Premium: headline 26 → 34 display, price 22 → 28, plan cards get border
   with the SELECTED card getting an accent border + check (no fill change),
   done title 24 → 28.
10. Onboarding: title 26 → 32, build title 24 → 28, taste bubbles follow the
    new chip system (selected white).
11. Queue + create-playlist + settings: titles to display/section tokens,
    settings rows keep press scale; no layout changes.
12. EmptyState: add an optional lucide icon prop (large, textTertiary, above
    the title); use it on search-empty (Search), library-empty (Library),
    collection-empty (Music2/Music). Titles pick up the 22 section token.
13. Tab bar: inactive tint textTertiary → textSecondary for readability;
    active label stays semibold.

## Out of scope (do not do)

No gradients, glow, glass/blur, shadows stacks, neon, or new color accents.
No layout restructuring (no IA changes, no new screens, no tab bar rebuild).
No behavior or copy changes beyond the type/spacing/sizing above. No new
dependencies. Reduced Motion behavior unchanged.

## Rollout + gates

Meaningful commits (tokens → home/player/detail → search/library/profile/
premium/onboarding → empty states + tab bar), pushed to
github.com/YasinmkDev/waveform master. Gates before push: `npx tsc --noEmit`
clean, `npx eslint .` clean, `npx expo-doctor` 21/21, Design Mastery Part 8
audit recorded in PLAN.md build record. No tunnel restart, no QR delivery —
the parent handles delivery.
