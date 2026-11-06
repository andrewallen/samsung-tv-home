# Governance

## Ownership

- **Owner and decision-maker:** Andrew. He owns the TVs, the Samsung account and the signing certificates.
- **Repository:** `github.com/andrewallen/samsung-tv-home`, private.
- **Secrets:** Samsung signing certificates and their passwords stay on the deploying Mac (`~/SamsungCertificate`, `~/tizen-studio-data`). They must never be committed.

## How a change is made

1. **Branch** from `main`: `feature/<name>`, `fix/<name>`, `docs/<name>`, or `experiment/<name>` for temporary changes.
2. **Write for the 2017 engine.** That means ES5, flexbox, and animating only `transform` and `opacity` (see ARCHITECTURE). Check the syntax with `npx acorn --ecma5 js/*.js`.
3. **Preview** `index.html` in a browser at 1920x1080, in each time of day you touched. Use Left and Right to explore scenes.
4. **Test on one TV** with `python3 tools/deploy.py --tv "Office TV"`, and have a person look at the screen. Screenshots can't show motion or performance.
5. **Open a pull request** into `main` that describes what changed and what was tested on a TV.
6. **Merge, tag and deploy everywhere** (see Releases).

Temporary experiments are never merged. Deploy them from their branch, then restore `main`.

## Releases

- **Version:** bump `version` in `config.xml` (semantic: major.minor.patch) for anything that reaches the TVs.
- **Tag:** tag the merged commit `vX.Y.Z`. The first restore point is `stable-2026-11-06`.
- **Changelog:** record the change in `CHANGELOG.md`, in plain words.
- **Deploy:** run `python3 tools/deploy.py`, and confirm on at least one TV.

## Decisions

Significant or hard-to-reverse choices are recorded as ADRs in `docs/adr/`, as `NNNN-short-title.md`, using the template in [adr/0000-template.md](adr/0000-template.md). Write one when:

- choosing or replacing a technology, service or protocol;
- accepting a platform limit, such as "the app can't open Sources";
- changing how the app is installed, signed or deployed;
- choosing something a future maintainer would otherwise undo by mistake.

An ADR isn't edited after it's accepted. If a decision changes, write a new ADR that supersedes it and mark the old one *Superseded by NNNN*.

## Design principles

1. **Calm and believable.** Movement should look like a live scene, not an effect. If it looks fake, remove it.
2. **Visible from the sofa.** Text is large, the selection is unmistakable, and something moves within seconds.
3. **Each effect belongs to its scene.** Fog where there's fog, glints on the lake, birds only in daylight.
4. **Nothing added without asking.** New UI elements are agreed with the owner first.
5. **British English** in all copy and documentation.
6. **Works on the oldest TV.** No feature may break the 2017 model.

## Third-party services and assets

| Item | Use | Terms |
| --- | --- | --- |
| Open-Meteo | weather and sunrise or sunset times | free, no key, non-commercial |
| postcodes.io | UK postcode to location | free, no key |
| Hanken Grotesk | interface font | SIL Open Font License |
| Background images | supplied by Andrew, generated for this project | for personal use on his TVs |

## Privacy and security notes

- **Private mode** is discretion, not security. It hides chosen apps and locks settings on screen, but anyone who knows the code can reverse it. The code and the app list live only in the untracked `tvs.json`.
- **Never commit `tvs.json` or `js/local.js`.** They hold the household's app list, location, private code and TV addresses.
- **Each TV stores its location** (from a postcode) in `localStorage`. Nothing is sent anywhere except the weather and postcode lookups.
- **TV developer mode** lets the Mac at the Host PC IP install apps. Keep the Mac's address fixed and trusted.
