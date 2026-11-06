# 0012. Keep household-specific settings outside the repository

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

The repository was made public. Until then, the source held household details:

- the exact app list, which reveals what's watched;
- the private-mode code, and publishing it defeats the feature;
- precise home coordinates for the weather;
- the TVs' network addresses.

## Decision

Keep these in **`tvs.json`**, which is **untracked**. Its format is shown by `tvs.example.json`, which uses placeholders. Before each build, `tools/deploy.py` writes the `local` section to **`js/local.js`**, which is also untracked, as `window.HOME_LOCAL`. The app reads its app list, default location, private code, apps to hide and start app from there. Without it, the app falls back to safe public defaults.

The public repository was published with a **fresh history**, because earlier private commits contained these details.

## Consequences

- The code can be shared publicly without exposing the household.
- `tvs.json` must be backed up privately, because it isn't in git. Losing it means re-entering the TVs and settings.
- A plain browser preview from a public checkout shows the example list and London.

## Alternatives considered

- **Keep the repository private:** simpler, but Andrew wanted it public.
- **Environment variables at build time:** awkward for nested lists, and there's no build step to hook into.
