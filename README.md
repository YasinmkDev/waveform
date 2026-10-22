# Waveform

A study of Spotify's product system, rebuilt from scratch in **React Native + Expo (SDK 57)** — not a skin, a working system: real playback, a real queue, and personalization that is honestly computed from the listener's own behavior on-device.

Built as a portfolio project. The full pre-build product & UX plan — dissection of Spotify's design DNA and engagement loops, screen specs, design tokens, roadmap — lives in [PLAN.md](PLAN.md).

## What actually works

- **Playback engine** (expo-audio): queue with Spotify's shuffle semantics (current track pinned), repeat off/all/one, seek scrubber, next-track fades, error skip-and-recover, state persisted across app restarts.
- **Algorithmic intimacy, honestly**: *Your Weekly Mix* is generated locally from onboarding taste picks, likes, completions and <30s skips (skips are a negative signal). Stats, top artists and the listening streak (with auto-applied **streak freezes** — the mercy valve) are pure functions over a real local play-event log. Nothing shown is invented.
- **Every surface**: Home (resume grid, Made For You, streak saver), Search (live grouped results, genre browse, recents), Your Library (filters, sort, grid/list, pins), playlist/album/artist/genre detail, Now Playing with gesture artwork-swipe, queue with reorder, taste onboarding, profile with a shareable *Month in Music* card, settings, and a Premium paywall whose benefits (no house ads, downloads, 6s crossfade) are genuinely wired through the app.
- **Motion language**: tokenized springs/durations, press-scale grammar, an animated equalizer playing-indicator, staggered shelf entrances, spring success moments — with the frequency rule enforced (100×/day actions get no flourish).

## Design rules this build follows

- One green, rationed to action and live state only. Hearts fill **white**.
- Square = album/playlist, circle = artist. No gradients anywhere. No dead controls.
- UX Strategy + Design Mastery playbooks applied; the pre-delivery audit ran as the Phase 5 gate.

## Content

Original fictional catalog: 8 artists, 8 albums, 16 tracks. Audio streams the SoundHelix example songs (T. Schürger) under original names — see [docs/CONTENT.md](docs/CONTENT.md). All artwork is generated in-project by `scripts/generate_artwork.py` (flat geometric, deterministic).

## Run it

```bash
npm install
npx expo start --tunnel   # scan with Expo Go (SDK 57)
```

Foreground playback in Expo Go; background/lock-screen audio intentionally skipped (documented in PLAN.md) — it requires a development build.

## Stack

Expo Router · TypeScript strict · Zustand (persisted stores) · Reanimated 4 · FlashList · expo-audio · lucide icons. Gates on every commit: `tsc --noEmit`, ESLint, `expo-doctor` 21/21.
