# 0002. Sideload through developer mode, signed with a Samsung certificate

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

The app is personal and won't be published to Samsung's store. Retail Samsung TVs only install third-party packages in developer mode, signed with a Samsung distributor certificate that lists each TV's device ID (DUID).

## Decision

Install through **TV developer mode**, signed with a **Samsung certificate profile** created in Tizen Studio's Certificate Manager under Andrew's Samsung account. The profile name is kept in `tvs.json`.

## Consequences

- Every new TV needs its DUID added to the certificate, which takes a Samsung sign-in.
- Each TV's developer mode must name the deploying Mac's IP as Host PC IP, so the Mac needs a fixed address.
- Certificates and passwords stay on the Mac and are never committed.

## Alternatives considered

- **Samsung's app store:** a review process, public listing, and not suitable for a personal home screen.
- **Rooting or jailbreaking the TVs:** could allow more, such as default-at-boot, but risks bricking, depends on firmware, and voids warranties. Rejected.
