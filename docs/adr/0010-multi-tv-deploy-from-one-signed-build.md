# 0010. Deploy one signed build to every TV from a list

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

There are several Samsung TVs of different models around the house, and updates should reach all of them with one command.

## Decision

`tvs.json` lists the TVs. **`tools/deploy.py`** builds and signs once, then installs on every enabled TV, carrying on past failures and summarising. `check` reports reachability and whether each TV's developer IP matches this Mac. `duid` prints a TV's device ID for the certificate.

## Consequences

- One command updates the house, and the most common failure (a changed IP) is diagnosed automatically.
- All TVs get the same app list. TVs lacking an app hide it in settings, or per-TV app lists may come later.

## Alternatives considered

- **Installing to each TV by hand:** error-prone, and doesn't scale.
