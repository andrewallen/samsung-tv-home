# 0007. TV Menu opens Samsung's home bar instead of Sources

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Andrew wanted a box that opens the TV's Sources menu, and earlier, direct HDMI 1 and HDMI 2 buttons. On this TV:

- `KEY_HDMI1` and `KEY_HDMI2` do nothing.
- `KEY_SOURCE` works only over `wss://<tv>:8002` with a pairing token, and the app's engine rejects the TV's self-signed certificate.
- Launching the Sources app and eight other variants opened nothing visible.
- Only Samsung's home bar (`org.volt.firstscreen`) responded.

## Decision

The **TV Menu** box launches `org.volt.firstscreen`. Source is the first tile there.

## Consequences

- Inputs are one extra press away.
- If a future TV allows a direct route, this ADR should be superseded.

## Alternatives considered

- **Remove the box entirely:** the fallback if the home bar ever stops opening.
- **Show inputs inside the app with the TV Window API:** declined, because Andrew wanted Samsung's own Sources menu.
