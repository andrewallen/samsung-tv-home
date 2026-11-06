# 0008. Keep per-TV settings in localStorage

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Each TV may want a different location, app order, hidden apps, and display options. There's no server, and the app must work offline apart from weather.

## Decision

Store settings on each TV in **`localStorage`** (`home.config.v1`), edited through the on-screen settings, which open with Return.

## Consequences

- There's no backend, and settings survive restarts and reinstalls.
- Settings are lost if the app is uninstalled, and they can't be managed centrally. Defaults live in `js/config.js` and `js/apps.js`.

## Alternatives considered

- **Per-TV config files baked in at deploy time:** a possible future step if central management is wanted.
