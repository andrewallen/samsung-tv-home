# Changelog

Notable changes, newest first. Dates are when the change reached the Office TV.

## Unreleased

- Added a documentation set: architecture, operations, learnings, governance and decision records.
- Removed an unused leftover script (`js/focus.js`).
- **Private details moved out of the repository:** the app list, default location, private-mode code and start app now live in `tvs.json` (untracked), and `deploy.py` writes them to `js/local.js`. `tvs.example.json` shows the format.

## 6 November 2026

- **Multi-TV management:** `tvs.json`, `tools/deploy.py` (deploy, check, duid) and `tools/tvlink.py`. The project moved to a private GitHub repository.
- **Private mode:** typing a private code on the number keys hides chosen apps and locks settings.
- **Interface sounds:** a tick when moving, a tone when choosing, a softer sound when exploring, and a Sounds on/off setting.
- **Realism pass:** birds that beat and glide, geese in a V at low sun, meteors with tails, real aircraft lights, satellites, jet contrails, a rare aurora, light rays at low sun, layered fog with parallax, varied lake glints and out-of-step stars.
- Removed the large hawk, which looked unrealistic.
- The selection now pulses gently.
- The app can open with a chosen app selected.
- Local version control started, with tag `stable-2026-11-06`.

## 5 November 2026

- **First version:** app list, date and time, and weather, on a time-of-day sky. Installed through developer mode.
- Switched to a vertical list with a gliding glass highlight, matching Andrew's reference design.
- **Backgrounds:** eight time-of-day photos blended by the real sunrise and sunset. The second, richer set replaced the first.
- **Movement:** push-in, drifting sky and fog, scene-matched effects, birds, meteors, aircraft and satellites.
- **Settings:** location by postcode, apps (show, hide, reorder), clock, date, weather, forecast, fixed background, and motion.
- **Explore mode:** Left and Right step through the times of day and return to live after 30 seconds.
- **Panel care:** slow drift and idle dimming.
- **TV Menu box:** opens Samsung's home bar. Samsung's Sources menu can't be opened from an app on this TV.
- App icon: "Home" with a house-and-mountains mark.
- The app list and default location were set for the first TV.
