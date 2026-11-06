# 0001. Build a Tizen web app for the oldest TV's engine

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

The house has several Samsung TVs. The oldest is a 2017 UE50MU6120 on Tizen 3.0, with a Chromium M47 web engine. Samsung TVs run either Tizen web apps or native apps, and native development is heavier and tied more closely to model and version.

## Decision

Build a Tizen **web app** in plain HTML, CSS and **ES5** JavaScript, with **no build step**. Target the M47 engine, so every newer TV runs it unchanged.

## Consequences

- What's in the repository is exactly what runs on the TV, with no toolchain to rot.
- CSS Grid, custom properties, `backdrop-filter`, flexbox `gap`, modern syntax and Intersection Observer are unavailable. Layouts use flexbox and absolute positioning, and animation uses `transform` and `opacity`.
- ES5 is enforced by convention and `npx acorn --ecma5`.

## Alternatives considered

- **A native Tizen app:** more power, but a heavier toolchain and less portable across model years.
- **Modern JS with a transpiler:** nicer syntax, but adds a build step and polyfills for little gain at this size.
