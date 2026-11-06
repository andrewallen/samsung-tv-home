# 0003. Install through our own developer-protocol client

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Samsung's `sdb` tool on the Mac stopped making connections after the Mac's IP changed, even once the TV was corrected. Its server never opened a socket, while Python on the same Mac connected fine. The protocol is adb-style and simple.

## Decision

Use **`tools/tvlink.py`**, a small Python client that speaks the developer protocol directly. It handles the connect handshake, sync push to `/home/owner/share/tmp/sdk_tools/tmp/`, `0 vd_appinstall`, `0 was_execute`, `0 getduid` and `0 applist`. Tizen Studio is still used to **build and sign** (`tizen build-web`, `tizen package`).

## Consequences

- Installs no longer depend on the flaky `sdb` daemon, and the client is easy to script for many TVs.
- We own a small piece of protocol code. If a future firmware changes the protocol, fall back to `tizen install`.

## Alternatives considered

- **Keep debugging `sdb`:** we spent hours on it without a root cause.
- **Reinstall Tizen Studio:** might fix it, but gives no guarantee across macOS updates.
