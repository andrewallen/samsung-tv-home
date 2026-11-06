# 0009. Private mode toggled by a number-key code

- **Status:** Accepted
- **Date:** 2026-11-06

## Context

Andrew wanted to hide some apps and stop settings being opened when others are watching, with an easy, discreet way to switch back.

## Decision

Typing a **private code** on the remote's number keys toggles **private mode**. The code and the apps to hide are set in the untracked `tvs.json` (`local.privateCode`, `local.privateHide`). It hides those apps, locks the Return-to-settings route, and trims the hint. The only confirmation is two quiet tones. It's saved, so it survives restarts.

## Consequences

- It's discreet and needs no menu.
- It's not security: anyone who knows the code can reverse it. Keeping the code out of the repository, in `tvs.json`, stops it being published.
- Number keys must be requested with `tvinputdevice.registerKey`.

## Alternatives considered

- **A settings toggle:** less discreet, and settings themselves needed locking.
- **A PIN prompt:** visible, and draws attention.
