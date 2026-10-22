# SPOTIFY CLONE — Product & UX Plan

**Document type:** Pre-build plan (product strategy, UX design, technical architecture, roadmap)
**Project:** `~/workspace/mobile-apps/spotify-clone` — Expo SDK 57 · React Native 0.86 · Expo Router · TypeScript strict
**Status:** Scaffold exists (verified: typecheck/lint clean, expo-doctor 21/21). This plan governs the full build-out. **No feature code is written until this plan is approved.**
**Governing playbooks:** UX Strategy Playbook (what/why) + Design Mastery Playbook (look/motion/engagement, clone method). Both apply to every phase; the Part 8 audit of the Design Mastery Playbook is a phase gate.

---

## 1. Product brief

### 1.1 What we are building
A portfolio-grade Spotify clone: a music streaming app that reproduces Spotify's *system* — its information architecture, playback experience, personalization rituals and engagement loops — with original code, original sample content, and our own data. It is a **demonstration of product craft**, built to the standard a hiring manager or Upwork client would judge: it must feel like the real thing within 10 seconds of opening it.

### 1.2 Why this app, why first
- Music is the most loop-dense consumer category that fits a solo portfolio: playback, discovery, library-building and identity (Wrapped) in one product.
- The scaffold is furthest along of the eight clones (working mini-player + full player UI already exist).
- It exercises the widest engineering surface: real audio playback, queue management, persistent state, long lists, gestures, background-safe UI state.

### 1.3 Success definition (portfolio context)
This is a portfolio build, not a commercial launch. Success =
1. A reviewer opening the app reaches **playing music they chose in ≤ 2 taps / ≤ 10 seconds**.
2. Every visible control works. Zero dead buttons, zero placeholder screens.
3. Playback survives tab switches, screen locks (UI state), queue changes and app restarts exactly where the user left off.
4. The build passes the Design Mastery pre-delivery audit with results shown.
5. Clean git history of small, conventional commits — the repo itself is part of the portfolio.

### 1.4 Non-goals (explicit)
- No real licensed music catalog; no Spotify API scraping. Content = a curated sample library of royalty-free / public-domain audio with generated artwork.
- No real payments. Premium is a designed paywall with a demo checkout state.
- No social graph with real users. Social proof surfaces use clearly-sample data presented as the app's own content (never fabricated live counters presented as real — Design Mastery 4.9).
- No backend in v1. Local-first: all state on device (see §8). A backend is a v2 decision, not a v1 dependency.

---

## 2. The dissection — what Spotify actually is (Clone Method, step 1–4)

From the 2026-10-22 teardown research (sources in the research notes). This is the system we replicate.

### 2.1 Spotify's design DNA
- **"Movie theatre" canvas:** near-black stage (`#121212`), artwork supplies almost all color. Chrome is monochrome so content glows.
- **One green, rationed:** `#1DB954`/`#1ED760` appears ONLY on action and state — the Play disc, playing indicators, selected pills, progress. Never decorative.
- **Shape code:** square = album/playlist, **circle = artist**. Users scan content type without reading a word. This is a signature component and is mandatory in our build.
- **The Play disc:** oversized circular green Play/Shuffle button floating over playlist/album headers — the single loudest interactive element in the product.
- **Card shelves:** horizontal rails of cards deliberately **cut off at the right edge** to signal scroll; 2–3 sections per screenful, never a wall.
- **3-tab nav:** Home / Search / Your Library (reduced from 5). Miniplayer floats above it, always present while anything plays.
- **Equalizer micro-signature:** the playing row's index number is replaced by 3 tiny animated green bars; its title turns green.
- **Type:** one grotesque family, weight doing hierarchy work; small display sizes because artwork carries the heft.

### 2.2 Spotify's loop arithmetic (Clone Method, step 4)
| Loop | Trigger | Action (cost) | Reward (variable how) | Investment | Cycle |
|---|---|---|---|---|---|
| Resume | Internal: commute/workout moment; greeting already correct | 1 tap on resume tile | Mostly familiar comfort + occasional novelty insert | Listening history itself; leaving = retraining a competitor | Daily |
| Discover Weekly | Calendared: Monday, expected not interruptive | 1 tap | 30 new tracks, 0–5 become favorites — **the variance is the mechanism** | Saves (→ Liked Songs) and <30s skips retrain next week | Weekly |
| Daily Mix | Same as resume, algorithm-branded | 1 tap | Familiar + novelty in branded mixes (Daily Mix 01–06) | Continued listening history | Daily |
| Wrapped | Annual, teased, limited window | Tap through Stories-format cards | Own stats reframed as **identity/awards** ("Top 1% of fans") | Share card (9:16, formatted for other platforms) distributes the product | Annual |
| Library building | Any listening session | 1 tap ♥ / + | Liked Songs grows; checkmark persists inline everywhere as a scanning cue | A collection that is expensive to abandon | Continuous |

**Healthy-session definition for our clone (Clone Method, step 5):** a session is good if the user found something to play in ≤10s, played it without friction, and left with their library slightly more theirs than when they arrived. The session ends when the music ends or the user leaves — we design no infinite-scroll trap; music apps end at the queue's end and that is fine.

### 2.3 What we deliberately do NOT copy
- Spotify's brand marks, name, logo, and proprietary artwork. Our app is presented as a clone study (working name in-app stays "Spotify Clone" only in repo/docs; in-app branding uses a neutral placeholder brand decided in Phase 0 — see Open Decisions).
- Spotify's exact copy, playlist editorial text, and artist data. All content is our sample library.

---

## 3. Users & jobs

### 3.1 Primary persona — "The Daily Listener" (the reviewer plays this role)
- Opens the app 2–4×/day, usually with intent already formed ("my playlist", "that artist").
- Job: *get my music playing fast, then get out of the app's way.*
- Design consequence: resume-first home, one-tap play, persistent miniplayer, zero forced discovery before playback.

### 3.2 Secondary persona — "The Explorer"
- Opens without a specific target; wants the app to choose well.
- Job: *surprise me with something I'll like, cheaply.*
- Design consequence: Made-For-You shelves, genre browse, radio-style "Made For You Mix" rows; every exploratory surface still resolves to one tap → playing.

### 3.3 Jobs-to-be-done (ranked)
1. Resume what I was hearing, instantly.
2. Play a specific song/artist/playlist I have in mind (search).
3. Keep a collection that is mine (library, likes, playlists).
4. Discover new music with low effort and low risk.
5. Control playback precisely (queue, shuffle, repeat, seek).
6. See myself in my music (stats/profile/Wrapped-style card).

---

## 4. Information architecture

### 4.1 Navigation model
- **3 tabs** (matching the dissection; the scaffold's 4th Profile tab is removed — profile/settings move behind the avatar in the Home/Search headers, exactly as Spotify does it):
  1. **Home** — greeting, resume, Made For You, shelves.
  2. **Search** — search field + browse-all genre grid; results view replaces the tab content while searching.
  3. **Your Library** — pinned + recent, filter chips, sort, the user's collection.
- **Player layer (global, above tabs):** MiniPlayer (persistent, floats above tab bar) → expands to **Now Playing** (modal sheet). Queue is a sub-view of Now Playing.
- **Stack screens (pushed over tabs):** Playlist detail, Album detail, Artist page, Genre page, Liked Songs, Create Playlist, Settings, Profile/Stats, Premium (paywall), Taste Onboarding (first run only).

### 4.2 Route map (Expo Router)
```
src/app/
  index.tsx                  → redirect: first-run ? /onboarding : /(tabs)
  onboarding.tsx             → taste onboarding (3 steps, skippable)
  (tabs)/
    _layout.tsx              → 3 tabs + MiniPlayer host
    index.tsx                → Home
    search.tsx               → Search + browse
    library.tsx              → Your Library
  playlist/[id].tsx          → playlist detail (incl. Liked Songs as id=liked)
  album/[id].tsx             → album detail
  artist/[id].tsx            → artist page
  genre/[id].tsx             → genre page (shelf collections)
  create-playlist.tsx        → create/edit playlist (modal)
  player.tsx                 → Now Playing (modal, full screen)
  queue.tsx                  → queue view (from player)
  profile.tsx                → profile + Your Stats (pushed from avatar)
  settings.tsx               → settings
  premium.tsx                → paywall (modal)
```
The existing scaffold's `src/app/(tabs)/profile.tsx` is deleted in Phase 1 and its useful content moves to `profile.tsx` (pushed) + `settings.tsx`.

### 4.3 Content model (what exists in the app)
- **Track** — title, artist(s), album, duration, audio URL (sample library), artwork, liked state, play count (local).
- **Album** — title, artist, year, artwork, track list.
- **Artist** — name, circular artwork, monthly-listener line (sample data), top tracks, albums.
- **Playlist** — system (Made For You, genre mixes) and user-created; cover = artwork or 2×2 collage of track art.
- **Genre** — name + flat tile color (from `genrePalette`).
- **Library entries** — typed references (playlist/album/artist/track) with pinned order + recency.

Sample library target: **≥ 60 tracks, ≥ 8 artists, ≥ 6 albums, ≥ 10 system playlists** across ≥ 6 genres — enough that shelves, search and mixes never feel empty or repeated.

---

## 5. Core flows (step-by-step, with the rule each obeys)

### 5.1 First run → first play (the money flow)
1. Splash → **Taste Onboarding step 1:** "What do you love?" — bubble grid of ≥ 12 artists; select ≥ 3 (counter shows endowed progress: "2 of 3"). *[Declared personalization, Spotify's cold-start solution.]*
2. Step 2: pick 2+ genres (chips). Step 3: "Your mix is ready" — generated: a personal "Made For You" playlist + tailored Home shelves. *[IKEA effect: an artifact they built, on Home forever.]*
3. Land on Home → greeting + **their** playlist is the hero tile → one tap → playing. **Target: ≤ 60 seconds install-to-music, ≤ 3 decisions.**
4. Account: **none in v1.** No signup wall (value before account — Duolingo/Airbnb rule). A dismissible "Save your library" card appears in Library after the user likes 3+ tracks (protecting what they earned, not gating).
*Skip path: "Skip for now" on every step → Home with default shelves. Skipping is a first-class flow, not an error.*

### 5.2 Resume flow (daily loop)
Open → Home greeting correct for time of day → quick-resume grid (6 tiles, most recent contexts) → 1 tap → playing, miniplayer present. **No intermediate screens. Target ≤ 2 seconds to sound on a warm start.**

### 5.3 Search flow
Tap Search tab → field focused, keyboard up, recent searches + browse grid visible → type → results grouped top-result card + Songs / Artists / Albums / Playlists sections → tap result → detail or direct play from row (play affordance on rows). Voice search icon present but in v1 shows an honest "coming soon" toast — or is omitted entirely (decide in Phase 0; dead-looking controls are forbidden, so the default is **omit**).

### 5.4 Play flow
Tap any Play disc / row → playback starts ≤ 300ms after tap (audio preloaded per §8.3) → row shows equalizer + green title → MiniPlayer appears with spring (Design Mastery 6) → tap MiniPlayer → Now Playing expands (shared-element artwork) → controls: seek, skip, shuffle, repeat (off/all/one), like, queue, playback speed? (no — out of scope), add-to-playlist sheet.

### 5.5 Like / save flow
♥ tap → optimistic fill + pop + Impact Light haptic, count/state persist instantly, zero spinners/toasts (Mastery 6.6 #3). Liked Songs count on Library updates in place. Unlike = same control, reverse state, no confirmation (reversible = fear-free).

### 5.6 Create playlist flow
Library → "+" → sheet: name field (auto-focused) → Create → empty playlist detail with **"Find songs" CTA** (designed empty state, never a blank screen) → search-and-add mode with + buttons → Done. Playlist appears pinned at Library top (recency rule).

### 5.7 Queue flow
Now Playing → queue icon → "Now Playing" row + "Next in Queue" list (long-press drag to reorder, swipe to remove) + "Recently Played" below. Edits apply to the live queue immediately.

### 5.8 Premium flow (designed, demo)
Profile/Settings or contextual upsell (after value moments only — never on first open, never mid-playback) → paywall: 3 tiers (Free vs Premium table), plan cards, CTA → demo checkout sheet → success state (≤600ms check animation) → Premium badge in profile; ads row (see 5.9) disappears. Restore/close always visible (no roach motel).

### 5.9 Free-tier ads (designed surface)
Portfolio-realism decision: Free tier shows a slim "ad" banner card in Home (clearly our own house promo for the Premium plan, labeled "Ad") — it demonstrates the upsell surface honestly without fake third-party ads. Skippable audio ads are **out of scope**.

---

## 6. Screen-by-screen specification

Every screen lists: purpose · primary action · anatomy (top→bottom) · states. Universal rules: all data surfaces ship ideal/empty/loading/error/partial states; skeletons match final geometry exactly; no control exists that does nothing.

### 6.1 Home
- **Purpose:** get the right music playing in one tap; prove the app knows the user.
- **Primary action:** tap a resume tile → play.
- **Anatomy:**
  1. Header row: time-aware greeting ("Good evening") 24px bold + right icons: notification bell (dot = new release), history (clock), settings gear, avatar (→ Profile). *[Scaffold header evolves to this; the avatar replaces the Profile tab.]*
  2. Filter chips: All / Music / Podcasts — re-filter Home **in place** (content crossfades 200ms; Podcasts filter shows our spoken-word sample rows, so the chip is real). Selected chip = green fill, black text.
  3. Quick-resume grid: 6–8 compact tiles (artwork 48 + title 2-line clamp), 2 columns. Data: most recent contexts.
  4. Shelf 1 — "Made For You": large cards (Daily Mix–style, generated covers), cut at right edge.
  5. Shelf 2 — "Jump back in": square album/playlist cards 152px.
  6. House-ad card (Free tier only, labeled "Ad") — dismissible per session.
  7. Shelf 3 — "Your top artists": **circular** cards (shape code).
  8. Shelf 4 — "New releases for you": square cards + release-date caption.
  - Bottom padding = MiniPlayer height + tab bar + 24, always.
- **States:** first-run (post-onboarding, shelves reordered so "Your mix" is shelf 1) · returning · empty-library variant (resume grid replaced by "Start listening" hero card) · loading = skeleton shelves in exact geometry · error (offline sample-data failure) = inline retry card, never a full-screen dead end.
- **Micro-specs:** shelf cards never wrap text past 2 lines (`numberOfLines`, flex containment — standing guard); section headers 20px bold with no "See all" unless the destination exists (genre page does; therefore "See all" appears only on shelves that map to a genre/mix page).

### 6.2 Search
- **Purpose:** find a specific thing fast; browse by genre when intent is vague.
- **Primary action:** tap search field → type → tap result.
- **Anatomy:** header "Search" 24px · search pill (surface-raised fill, search icon, placeholder "What do you want to listen to?") · **Browse all** section: genre tiles 2-col grid, flat `genrePalette` color, genre name bold bottom-left, small rotated artwork motif bottom-right (flat shapes only — no photos needed) · recent searches list (when field focused & query empty) with per-row remove + "Clear all".
- **Results state (query non-empty):** Top result card (large artwork, type label, Play disc) → Songs (rows with per-row ♥ state) → Artists (circular rows) → Albums → Playlists. Filter chips on results: All / Songs / Artists / Albums / Playlists. Live filtering (no submit) with 150ms debounce; empty-query-results state = "No results for 'x'" + suggestions row (never a blank).
- **States:** idle-browse · focused-empty (recents) · results · no-results · loading (skeleton rows while filtering long lists — with our local data this resolves instantly; skeletons shown only on simulated cold load).

### 6.3 Your Library
- **Purpose:** the user's own collection; the investment surface.
- **Primary action:** tap an entry → its detail/play.
- **Anatomy:** header "Your Library" + search-in-library icon + **+** (create playlist) · filter chips: Playlists / Artists / Albums / Liked (filters list in place) · sort row ("Recents" + list/grid toggle — both views fully implemented) · **Liked Songs pinned card** (gradient-free flat purple-tint surface from palette, count) → pinned items → recent items. Rows: artwork (square; circle for artists), title, type + count caption ("Playlist · 24 songs"), pinned icon where pinned.
- **States:** brand-new user (only Liked Songs=0 + "Playlists you'll build" empty state with Create CTA) · populated · filtered-empty ("No artists yet — artists you follow land here" + Browse CTA) · library search mode.
- **Rules:** long-press row → context sheet (Pin/Unpin, Remove from library, Share→ toast "Link copied" demo). Everything in the sheet works locally.

### 6.4 Playlist detail (also Album, Liked Songs)
- **Purpose:** one collection, playable as a unit.
- **Primary action:** the **Play disc** (56px, green, floating right over the header's lower edge).
- **Anatomy:** hero header: centered artwork 232px (album/playlist) or tint field with big ♥ (Liked Songs); title 24–28 bold; creator/artist line; meta caption (duration total · count). Action row: ♥ (playlist-level like/follow), Download toggle (demo state, persists), **Shuffle toggle** (dot indicator when on), **Play disc** right-aligned. Track rows: index/artwork, title (green + equalizer when playing), artist caption, ♥, duration, ⋯ menu. Sticky mini-header on scroll (title + small Play disc) once hero scrolls off.
- **Album variant:** adds release year + artist row (tap → Artist page), "More by [artist]" shelf at bottom.
- **User-playlist variant:** owner = "You", Edit affordance (rename, reorder via drag, remove tracks), empty state per §5.6.
- **Track ⋯ sheet:** Add to playlist (→ picker sheet listing user playlists + Create), Add to queue, Go to artist, Go to album, Share (demo toast). All functional locally.

### 6.5 Artist page
- **Anatomy:** hero: circular artwork 152 centered (shape code at hero scale) or wide banner art; name 28 extrabold; "X monthly listeners" caption (sample data). Play disc + Shuffle + Follow toggle (Follow = library investment; artist enters Library artists filter). **Popular** list (top 5 tracks, play counts) → **Discography** shelf (albums) → **Fans also like** shelf (circular artists).
- **States:** following/not · loading skeleton.

### 6.6 Now Playing (the flagship screen)
- **Purpose:** full control + the emotional peak surface of the app.
- **Primary action:** play/pause (64px white disc — note: white on this screen, green is for list contexts; matches Spotify).
- **Anatomy:** top bar: collapse chevron · context label ("Playing from playlist / Daily Mix 01" small caps) · ⋯ menu. Artwork: large square (screen width − 48), 8px radius, subtle scale-in on track change (shared element from MiniPlayer). Title 20 bold + artist 16 secondary (marquee-scroll if overflowing — never truncate a playing title). ♥ + Add buttons row. **Progress bar:** custom scrubber — thin track, filled portion white, thumb appears on drag, times both sides (tabular numerals); scrubbing previews time live. Controls row: Shuffle (green + dot when active) · Prev · **Play/Pause 64** · Next · Repeat (green when on; badge "1" on repeat-one). Bottom row: device icon (demo sheet listing "This phone" only — honest), Share (demo), **Queue icon → Queue screen**. Background: flat canvas with a very subtle artwork-tinted wash (solid tint derived from artwork's dominant color, **not** a gradient — standing design rule).
- **Interactions:** swipe artwork left/right = next/prev with slide animation; drag down on the sheet = collapse to MiniPlayer (spring, damping 0.8); progress auto-updates via playback store subscription at 500ms ticks, re-render isolated to the progress component (performance rule §8.4).
- **States:** playing · paused · buffering (spinner replaces play glyph only if load > 400ms) · track-ended auto-advance · queue-empty end state (stops, shows "Up next: —" and a "Keep listening: radio mix" CTA that enqueues the genre mix — a designed end, not a dead stop).

### 6.7 Queue
- Anatomy: "Now Playing" card row → "Next in Queue" (drag handles, swipe-remove) → "Recently played" (tap = play now). Clear-queue button (with confirm only because it is destructive-ish; reversible via Recently Played). All edits live.

### 6.8 MiniPlayer (global component)
- 56–64px bar floating 8px above the tab bar, surface-raised, 8px radius: artwork 40 · title/artist (title green when playing? no — white; green reserved) · ♥ · play/pause · next. Tap → expand to Now Playing. Swipe right on it = next track (gesture with haptic tick). Progress hairline (2px, white) along its top edge. Appears/disappears with spring; hides on Now Playing route and during onboarding.

### 6.9 Onboarding (Taste)
- 3 steps per §5.1. Progress shown as 3-segment bar (endowed progress: segment 1 pre-filled "Account — done" is not applicable in v1 no-account; instead step bar starts at "Step 1 of 3" with the bar 33% pre-filled after first selection). Artist bubbles: circular 72px, selected = green ring + check + scale pop. Continue button disabled until minimum met, with the remaining count in its label ("Pick 1 more"). Final step: 600ms "Building your mix…" shimmer → success check → "Start listening" → Home. Motion budget lives here (Mastery 6.4: rare/first-time = delight allowed).

### 6.10 Profile & Stats
- Avatar, display name ("Guest Listener"), plan badge (Free/Premium). **Your Stats card:** minutes listened (local), top artist, top genre, current streak of listening days (with freeze count — the mercy valve, visible) — all computed from real local play history, never invented. Listening-history list (recent plays). Wrapped-style share card button → generates a 9:16-styled card screen ("Your Month in Music") with share (demo) — the viral surface, built from real local stats.

### 6.11 Settings
- Rows: Playback (crossfade slider 0–12s — real, applies to expo-audio transitions where supported; gapless toggle = demo-persisted), Data saver toggle (lowers artwork resolution), Notifications toggles (new releases / weekly mix — schedule local notifications, §7.3), About (version, "Clone study — not affiliated with Spotify" line, mandatory honesty), Reset demo data (confirm → reseed).

### 6.12 Premium paywall
- Per §5.8. Comparison table Free vs Premium: rows (Ad-free, On-demand playback, Offline downloads (demo), Queue control, Stats card). Plan cards: Monthly / Yearly (yearly = "Best value" badge — a badge that changes a decision, allowed). CTA → demo checkout → success animation → plan state persists; Settings gains "Restore purchase" (demo success). Close (X) always visible; no countdown timers, no fake scarcity (audit line).

---

## 7. Design system (tokens — extends the existing `src/theme.ts`)

The scaffold's theme is the base; these are the rulings that complete it.

### 7.1 Color roles
- Canvas `#121212` · surface `#181818` · surfaceAlt `#232323` · surfaceRaised `#2A2A2A` (MiniPlayer, sheets) · text `#FFFFFF` · secondary `#B3B3B3` · tertiary `#6A6A6A` (captions only, never body) · hairlines `#2A2A2A`/`#3A3A3A`.
- **Accent `#1DB954` — permitted uses only:** Play discs, playing-state (equalizer, playing title, progress on MiniPlayer? no — MiniPlayer progress is white; green = play *controls and live state in lists*), selected chips, active toggles (shuffle/repeat indicators), Follow/like active states are **white** (♥ fills white — Spotify's actual grammar; green stays for action/state, not affection). This discipline is the design.
- Danger `#F15E6C` only for destructive confirmations. Genre tiles use `genrePalette` flat colors — the only place saturated color appears besides artwork.
- Generated playlist covers (Daily Mix etc.): flat palette color + bold typography + simple shapes. **No gradients anywhere in the app** (standing rule; Spotify's own header gradients are consciously NOT reproduced — our headers use flat tint fields).

### 7.2 Typography ladder (single family: platform grotesque, e.g. Inter/system with intent — final font decision in Phase 0; if Inter is used it must be a *decision recorded here*, not a default)
| Step | Size/Weight | Use |
|---|---|---|
| display | 32/800 | Stats numbers, onboarding headlines |
| title | 24/700–800 | Screen titles, playlist hero titles |
| section | 20/700 | Shelf headers |
| body | 15/400–500 | Row titles, body text |
| caption | 13/400 | Meta lines (secondary color) |
| micro | 11–12/600 uppercase +0.6 tracking | Kickers ("MADE FOR YOU"), badges, context labels |
Headings line-height 1.15–1.25; body 1.45; tabular numerals for durations, timers, stats.

### 7.3 Spacing & layout
8pt scale already in theme (4/8/12/16/20/24/32). Screen margin 16. **Card/shelf artwork sizes fixed per type:** resume tile art 48 · shelf card 152 (square) / 152 circle (artist) · row art 48 · hero art 232 · player art = width−48. Shelf gap 16; section gap 32. Radius vocabulary: 4 (rows/chips small) · 8 (cards, MiniPlayer, tiles) · 12–16 (sheets, modals) · 999 (chips, discs, pills). Targets ≥ 44pt; Play discs 56/64.

### 7.4 Iconography
Lucide throughout (installed). No emoji icons. Playing equalizer is a custom 3-bar animated view (Reanimated), the one bespoke icon-animation in the app.

### 7.5 Motion tokens (from Design Mastery Part 6 — applied)
- press: scale 0.97, 120ms · tab content crossfade 180ms · MiniPlayer appear: spring (stiffness 260, damping 26) · player expand: shared-element + spring damping 0.85 · sheet present 350ms / dismiss 250ms · list stagger on Home first load: 40ms/item, ≤ 8 items, total ≤ 500ms · success (premium/like milestones): ≤ 600ms.
- Frequency rule enforced: play/pause, like, tab switches get **no flourish** — these are 100×/day actions. Delight budget is spent on: onboarding, first-play, Wrapped card, premium success.
- Haptics: play/pause = none (too frequent); like = Impact Light; tab = none; queue reorder drop = Selection; errors = Notification Error.
- Reduced Motion: crossfades replace springs/slides; equalizer becomes a static 3-bar glyph.

---

## 8. Engagement architecture (loops as built features)

Each loop from §2.2 becomes a named feature with an owner surface. Nothing here is decoration; each row is buildable and testable.

### 8.1 Loop → feature map
| Loop | Feature in our build | Surface |
|---|---|---|
| Resume | Quick-resume grid fed by real local play history (context = playlist/album/artist last played from) | Home §6.1 |
| Discover | **"Your Weekly Mix"** — generated every Monday from local taste data (onboarding picks + likes + play counts): 20 tracks the user hasn't played, seeded shuffle | Home shelf + Library; local notification Mon 09:00 |
| Daily Mix | 3 mixes (by top genres) regenerated daily from local data | Home "Made For You" |
| Library building | Likes, follows, pins, user playlists; ✓/♥ states persist inline in every list (scanning cue) | Everywhere |
| Identity | Stats card + "Your Month in Music" share card from real local history; listening-day streak **with 2 freezes shown** (mercy valve visible, per Mastery 4.3) | Profile §6.10 |

### 8.2 Personalization grades (Mastery 4.8)
- **Declared (day 1):** onboarding artists/genres → seeds mixes, shelf order, Weekly Mix pool.
- **Inferred (as data accrues):** play counts, completions vs <30s skips (a skip before 30s = negative signal), like rate per genre → reweights mix generation and "Jump back in" ordering. All computed on-device from the play-history log.
- **Invisible:** Home shelf order adapts (most-engaged shelf type rises); user never sees a "because you listened" label except on the Weekly Mix card where it builds trust ("Made from your likes and plays").

### 8.3 Trigger calendar (local notifications, all opt-in, asked AFTER first value)
- Monday 09:00 — "Your Weekly Mix is ready" (deep-links to the mix).
- Friday 17:00 — "New this week in your genres" (only when new sample content exists in their genres; otherwise silent — a notification that lies once trains users to ignore all).
- Listening streak saver at 20:00 **only** if: streak ≥ 3 days, no play today, notifications opted in. Copy is supportive, never shaming.
- Permission ask: after the 3rd listening session, on the Stats card ("Get your Weekly Mix the moment it drops") — contextual, routine-anchored, declinable without penalty.

### 8.4 The audit line, applied
Every mechanic above passes "would the user thank us if they understood it fully?" — mixes are honestly generated from their data, stats are real, no fake listener counts presented as live, no countdown/scarcity on the paywall, streak has visible freezes and a no-shame saver. Social-proof numbers on artist pages are labeled sample content in the About screen.

---

## 9. Data & technical architecture

### 9.1 Data layer
- **Static catalog:** `src/data/catalog.ts` — typed arrays (tracks, albums, artists, playlists, genres) with the sample library (§4.3 targets). Artwork: generated flat-design cover images stored in `assets/artwork/` (local files, no hotlinking). Audio: royalty-free/public-domain tracks as remote URLs from stable public sources, listed in the catalog with source/license note in `docs/CONTENT.md`; each track also gets a bundled short fallback clip so playback demos never hard-fail offline.
- **User state:** a single store (`src/store/`) with slices: `player`, `library` (likes/follows/pins/user playlists), `history` (play events), `prefs` (settings, onboarding, plan). Persistence: AsyncStorage (via expo install-approved package) with a versioned schema + reseed/migration guard. State survives restarts; play history is append-only event log capped at 2,000 events.
- **Derived data:** mixes, stats, resume grid = pure functions over catalog + history (`src/lib/mix.ts`, `src/lib/stats.ts`) — unit-testable in plain TS, no UI coupling.

### 9.2 Playback engine
- **expo-audio** (installed; SDK 57 API to be verified against v57 docs before coding — AGENTS.md rule). One global `AudioPlayer` instance owned by the player store; queue = array of track ids + index; shuffle maintains a shuffled order map (toggling shuffle mid-track keeps current track pinned, Spotify behavior); repeat modes cycle off→all→one.
- **Preload:** next track's player prepared when current passes 50% → gapless-feeling transitions; tap-to-sound target ≤ 300ms for catalog URLs on a warm connection.
- **Background/lock-screen:** expo-audio supports background playback + lock-screen controls via config; **requires a development build** (Expo Go limitation) — Phase plan handles this explicitly (§10, risks). In Expo Go, playback works in-foreground; the plan does not pretend otherwise.
- **Progress clock:** single interval in the player store (500ms), progress component subscribes narrowly; lists subscribe only to `currentTrackId + isPlaying` — row re-renders isolated (cheap-Android rule).
- **Interruption handling:** pause on audio-focus loss (call), resume per system defaults; failed URL → skip to next + one toast ("Couldn't load — skipped"), never a frozen player.

### 9.3 Component inventory (build once, reuse everywhere)
`Shelf` (title + horizontal FlashList) · `TrackRow` (variants: plain / with-art / index) · `CardSquare` / `CardCircle` · `PlayDisc` (sizes 48/56/64, states play/pause/buffering) · `EqualizerBars` · `LikeButton` (optimistic) · `Chip` (filter) · `GenreTile` · `MiniPlayer` (exists — refactor to store) · `TrackMenuSheet` · `PlaylistPickerSheet` · `SkeletonRows/SkeletonShelf` · `EmptyState` (icon + line + CTA) · `SectionHeader`.

Lists: FlashList for shelves and long lists; artwork via expo-image with cache policy `memory-disk`.

### 9.4 File structure additions
```
src/
  data/catalog.ts        data/artwork.ts (generated covers map)
  store/ player.ts library.ts history.ts prefs.ts index.ts
  lib/ mix.ts stats.ts format.ts (durations, time-ago)
  components/ (per §9.3)
  hooks/ usePlaybackProgress.ts useIsPlaying.ts
docs/ CONTENT.md (audio/artwork sources + licenses)
```

### 9.5 Quality gates (every phase, no exceptions)
`npx tsc --noEmit` clean · `eslint` clean · `expo-doctor` 21/21 · manual pass on the phase's flows · **Design Mastery Part 8 audit for all screens touched** · conventional commit per logical unit, pushed only on the user's word (repo is local-only until he says push — standing rule).

---

## 10. Roadmap (phases, each independently demoable)

**Phase 0 — Foundations (decisions + data)**
Decide: in-app brand placeholder name, font call (§7.2), voice-search omit (default: omit). Build catalog (≥60 tracks), artwork set, CONTENT.md. Token completion in theme.ts. *Exit: catalog plays via a throwaway harness; decisions recorded in this plan's changelog.*

**Phase 1 — Shell & navigation**
3-tab restructure (remove Profile tab, avatar routes), root redirect logic, MiniPlayer wired to a real (empty) player store, skeleton components. *Exit: app navigates everywhere; every route renders its designed skeleton/empty state.*

**Phase 2 — Playback core**
Player store + expo-audio engine, queue/shuffle/repeat, Now Playing full build, Queue screen, progress/seek, preload-next. *Exit: §5.4 and §5.7 flows pass end-to-end on device.*

**Phase 3 — Content surfaces**
Home (all shelves + resume logic), Playlist/Album/Artist/Liked detail, Search + browse + results, Library (filters/sort/views/pins). Likes/follows live (optimistic). *Exit: §5.2, §5.3, §5.5, §5.6 flows pass.*

**Phase 4 — Personalization & identity**
Onboarding (taste), mix generation, Weekly Mix + notification calendar, Stats + streak/freezes, Month-in-Music card, Create Playlist full flow. *Exit: a fresh install produces a personal Home ≤ 60s (§5.1); returning user sees data-driven shelves.*

**Phase 5 — Premium & polish**
Paywall + demo checkout + plan state, Settings (all real), house-ad card, Reduced-Motion pass, cheap-Android performance pass (list profiling, render isolation), full Part 8 audit with published results. *Exit: audit passes; zero dead controls anywhere.*

**Phase 6 — Delivery**
README with screenshots + architecture notes, tunnel demo for the user's phone, push to GitHub **only on the user's word**. Optional (separate approval): EAS dev build for background audio/lock-screen controls.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Expo Go can't do background/lock-screen audio | Foreground playback in Go; dev build is Phase 6 optional with user's approval — disclosed, not hidden |
| Sample audio URLs rot | Bundled fallback clips per track + CONTENT.md sources; catalog check script in Phase 0 |
| Scope creep (podcasts, video, social) | Non-goals §1.4 are binding; new ideas go to a v2 list, not into phases |
| Lists jank on cheap Android | FlashList everywhere, narrow store subscriptions, artwork caching, Phase 5 profiling gate |
| "Clone" reads as copy | Original code/content/branding placeholder; About line states it's a study; system fidelity, asset originality (§2.3) |

### Open decisions (need the user's word, or default applies at Phase 0)
1. In-app brand name — default: **"Waveform"** (neutral, music-true) until he names it.
2. Push to GitHub when done — default: local only, per standing rule.
3. EAS dev build for background audio — default: skip until he asks.

---
*Plan v1 — 2026-10-22. Changelog: v1 initial plan.*

## Build record (2026-10-22) — all 6 phases shipped

Built as planned; gates green at every phase (tsc, ESLint, expo-doctor 21/21) and pushed to github.com/YasinmkDev/waveform in meaningful per-phase commits. **Design Mastery Part 8 audit: PASS** — token sheet, one-accent discipline (hearts unified to white fill after audit caught a green save-heart), shape code, no dead controls verified screen by screen, loop features shipped (Weekly Mix from real local data, streak + visible freezes, resume grid, Month-in-Music card), motion tokens applied with the frequency rule, thank-you test passed (paywall has no scarcity theater; stats are real).

**Recorded deviations from v1 (deliberate, with reasons):**
1. **Catalog = 16 verified tracks** (8 artists × 2), not 60: only 16 stable, license-clear audio files could be verified live; playlists/mixes reuse tracks across contexts, as real editorial playlists do. Expanding the catalog is a content task, not an architecture change.
2. **Home chips** are All / Mixes / Albums / Artists (real in-place shelf filters) instead of Spotify's All / Music / Podcasts — the catalog has no podcasts, and a chip that filters to nothing would be a dead control.
3. **Notifications are in-app surfaces** (bell dot, streak-saver card, contextual ask on Profile), not OS pushes: expo-notifications is unreliable inside Expo Go on SDK 57, and the loops work through the in-app triggers. Scheduling can be added behind the same prefs toggles in a dev build.
4. **Queue reorder is tap-to-place** (long-press lifts a row, tap drops it) instead of drag: no extra dependency, fully functional in Expo Go.
5. **Crossfade** is implemented as engine fade-out/fade-in around transitions (single player), capped at 2s on Free and 6s on Premium — a real, audible effect, labeled honestly in Settings copy.
6. **Data Saver** setting was dropped rather than shipped as a fake toggle; Settings contains only controls with real effects.
