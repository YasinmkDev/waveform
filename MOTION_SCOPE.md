# Waveform — Motion & Missing-Features Scope (2026-10-24)

User brief: "add motion in every card every component in every screen, search online,
make it exciting and fun UX, add features that are missing, scope the entire project."

Research (done 2026-10-24, before scoping):
- Reanimated 4 patterns: motion tokens in ONE file, screens never invent numbers;
  press-scale wrappers on cards/buttons; layout animations (LinearTransition) so
  inserted/removed rows slide instead of teleporting; skeletons over spinners;
  stagger 30–50 ms/item capped at ~500 ms total; exits shorter than enters;
  springs only for gesture-reactive motion; haptics on commitment actions only.
- Spotify motion logic: motion explains where the UI came from and where it is going
  (directional transitions, persistent playback, album color as state); playback
  indicators and play/pause state shifts are the highest-value micro-interactions;
  best motion is felt, not noticed — so "exciting" here means responsive, playful
  and physical, never looping decoration or animation on 100×/day taps.
- Standing rules that still bind: NO gradients/glow/glassmorphism; green rationed
  to action + live state; hearts fill WHITE; no fake controls — every new feature
  must be really wired; Reduced Motion honored (Equalizer already does this).

## Audit result: what motion exists today vs what is missing

Already animated (do not redo): PlayDisc press scale (0.94), LikeButton pop spring +
haptic, Equalizer bars, MiniPlayer swipe + FadeIn, Now Playing artwork FadeIn +
swipe, sheets SlideInDown, Home hero + resume-grid stagger, onboarding stagger +
step slides, premium ZoomIn success, toast fade, CollectionView compact header fade.
Everything else is static: cards, rows, chips, shelves, genre tiles, library rows,
search results, queue rows, tab icons, settings/premium/profile rows, skeletons
(static boxes, no pulse), sheet exits (no SlideOutDown), tab switches (no feedback).

## Motion system to build (shared, in src/components/motion.ts + ui.tsx)

1. `PressableScale` wrapper (scale 0.97, springUI; 0.94 for discs) applied to:
   SquareCard, ArtistCard, ResumeTile, genre tiles, entity rows, top-result cards,
   hero card, streak card, ad card, cold card, library rows, queue rows, settings
   rows, premium plan cards, profile stat cards, Month-in-Music card, chips
   (scale 0.96 + layout animation on select), search-field clear button pop.
2. `Stagger` helper (FadeInDown, 40 ms/item, first 8 items only, then plain) for:
   shelf cards, genre grid, search result groups, library list/grid, queue rows,
   collection track lists, profile stats, premium options, settings sections.
3. Layout animations (`LinearTransition.springify()`, exits FadeOut 150 ms) for:
   library filter/sort/grid switches, pin-to-top reorder, playlist delete,
   queue reorder/remove, search results changing with the query, ad dismiss
   (siblings slide up), home filter switches (shelves keyed by filter, FadeIn).
4. Sheets: springify SlideInDown + add SlideOutDown exit + backdrop fade (both
   TrackMenu and PlaylistPicker; library menu becomes the same spring sheet,
   replacing the plain Modal fade).
5. MiniPlayer: SlideInUp spring entrance; track-change artwork pop (scale 0.92→1
   springPlayful, keyed by track id); keep swipe next/prev; progress hairline as-is.
6. Now Playing: artwork drag feedback (translateX → scale 0.94 + rotate ±4° while
   dragging, spring back); directional track-change slide (next slides from right,
   prev from left — add `lastNavDirection` to the player store, set by next/prev);
   background tint crossfade on track change (keyed FadeIn overlay, no gradient);
   PlayDisc toggle pulse (scale 1.12 springPlayful on play/pause change);
   scrubber thumb grows to 1.4× while scrubbing; shuffle/repeat dot pops (ZoomIn);
   transport buttons get press scale.
7. Tabs: tab icon pop (scale spring on focus) + label fade; keep the native bar
   (no custom tab bar — out of scope, would risk the MiniPlayer layout).
8. Toast: SlideInUp + FadeIn entrance, SlideOutDown exit.
9. Skeletons: pulse loop (opacity 0.35↔0.7, 1.4 s) via withRepeat; used on every
   loading/empty-transition surface that currently shows a static box or spinner.
10. Reduced motion: all new primitives check `useReducedMotion()` and render
    plain (no scale, no stagger, crossfade only). Never animate a loop.

## Missing features to add (all real, no placeholders)

1. **Sleep timer** (player footer Moon button → sheet: 15 / 30 / 60 min / Off):
   player store holds `sleepUntil`; engine stops playback when reached; shown as
   a live countdown chip on Now Playing. Stops cleanly, survives track changes.
2. **Play next** in TrackMenu: inserts the track directly after the current one
   (new player-store action `playNext(trackId)`), toast confirms.
3. **Real share**: player Share button uses `expo-clipboard` (already in Expo Go)
   to copy a real Waveform track link and toasts the actual result — replacing
   today's fake "Link copied" toast. Profile Month-in-Music card uses RN `Share`
   API for real system sharing.
4. **Artist Play button**: artist screen gets a PlayDisc that plays that artist's
   tracks in order (today only Follow exists as an action).
5. **Genre Play-all**: genre screen header gets a PlayDisc playing the genre's
   tracks (today it is a browse-only list).
6. **Recently played shelf on Home**: horizontal shelf of the user's last played
   tracks (from history events, real data) under "Jump back in".
7. **Collection sort toggle**: playlist/album detail gets Recents/A–Z ordering
   for its track list (real reorder, layout-animated).
8. MiniPlayer drag-up to expand into Now Playing: P2 — include ONLY if it stays
   stable with the existing swipe gestures; drop it rather than destabilize.

Explicitly NOT added (would be fake or off-brief): lyrics (no data), podcasts,
real payments, push notifications, pull-to-refresh (local data), offline audio
files (catalog is remote samples; downloads stay a local collection flag, as now).

## Rollout + gates

Commits, each meaningful and pushed (repo github.com/YasinmkDev/waveform):
motion primitives → home/search/library → player/miniplayer/queue → detail
screens + sheets + tabs → new features → audit record. Gates before each push:
`npx tsc --noEmit` clean, `npx eslint .` clean, `npx expo-doctor` 21/21,
Design Mastery Part 8 audit recorded in PLAN.md build record. No new native
dependencies (expo-haptics, expo-clipboard, gesture-handler, Reanimated 4 all
already installed / in Expo Go). After the build: restart the tunnel on port
8091, verify manifest + tabs chunk, regenerate + decode-verify the QR, deliver.
