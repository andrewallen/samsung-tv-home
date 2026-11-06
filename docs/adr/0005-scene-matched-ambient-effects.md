# 0005. Make movement with scene-matched CSS and SVG overlays

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

A still photo looks static. The TV is often on with nobody watching closely, so movement must be obvious within seconds, believable, and cheap on old hardware.

## Decision

Add **overlays** over the photo:

- push-in and sky drift, fog, glints, stars, sun glow and rays;
- **life events**: birds, geese, jets, meteors, aircraft, satellites and a rare aurora.

They're configured **per time of day** in `SCENES` and `RAYS`, and use only `transform` and `opacity` animation. Events restart within about 1.5 seconds of any scene change, including in explore mode. Weather never mutes the scene.

## Consequences

- It feels like a live view without video.
- Effects must be placed to match each image, by hand.
- Each effect has to be judged on the real TV. Some, like the large hawk, were removed for looking fake.
- **Calm** mode turns off the life events.

## Alternatives considered

- **Generic full-screen particles or mist:** looked fake.
- **Pre-rendered video overlays:** too heavy.
