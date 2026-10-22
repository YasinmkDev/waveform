# Content sources & licenses

## Audio
All playable tracks stream the **SoundHelix example songs** (composed by
T. Schürger, https://www.soundhelix.com), a long-standing public demo set
used for audio-player development. In Waveform they are presented under
original fictional artist/album/track names as a sample catalog.
Durations were verified against the served files with ffprobe on
2026-10-22. Track-to-file mapping lives in `src/data/catalog.ts`
(`helix(n)` = SoundHelix-Song-n).

## Artwork
All covers, artist images, playlist art and the app icon are generated
locally by `scripts/generate_artwork.py` (flat geometric compositions,
deterministic seeds). No third-party images are used or hotlinked.

## Catalog fiction
Artist names, bios, monthly-listener and play-count figures are sample
editorial data for the demo catalog (disclosed in-app under
Settings → About).
