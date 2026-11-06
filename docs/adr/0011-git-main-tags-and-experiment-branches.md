# 0011. Git workflow: main, release tags and experiment branches

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

Andrew wanted to try temporary, just-for-fun changes and restore the stable app quickly. The project then moved to GitHub for long-term maintenance.

## Decision

`main` holds the deployable app, and releases are tagged (`stable-2026-11-06`, then `vX.Y.Z`). Temporary changes go on `experiment/*` branches and are never merged. Other work uses `feature/`, `fix/` and `docs/` branches, merged by pull request. Tool caches such as `.impeccable/` are ignored, so they can't block checkouts.

## Consequences

- Rolling back means checking out a tag and running deploy.
- It needs a little discipline: always restore `main` on the TVs after an experiment.

## Alternatives considered

- **Working directly on the files with no history:** that's how the project began, and it couldn't roll back.
