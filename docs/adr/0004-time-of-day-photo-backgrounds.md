# 0004. Use blended time-of-day photographs for the background

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

The background went from a flat gradient, to a continuous solar gradient, to a drawn SVG landscape. Andrew wanted the look of a real photograph that changes through the day, like macOS's Solar Gradients wallpaper.

## Decision

Use **eight aligned 1920x1080 photos of one scene** (pre-dawn to night), placed on the day relative to the **real sunrise and sunset** from the forecast. **Blend the two either side of now** continuously, instead of switching between them.

## Consequences

- It looks like a live view, and the timing follows the seasons automatically.
- The app grows by about 3.7 MB, and images must be supplied at 1080p and aligned.
- Changing the scene means supplying a new set of eight. Per-scene effect positions (sun, lake, fog) must be re-mapped in `SCENES`.

## Alternatives considered

- **Gradient or drawn landscape:** lightweight and adapts to any time, but didn't look real enough.
- **Video loops:** too heavy for the 2017 TV's memory and decoder.
