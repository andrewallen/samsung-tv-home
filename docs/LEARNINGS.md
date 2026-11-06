# Learnings

What we found out building this, roughly in the order we hit it. Each item says what happened and what to do about it.

## The TVs

- **Model year sets the web engine.** The 2017 UE50MU6120 runs Tizen 3.0 with Chromium M47. Its REST description says firmware "Unknown". The UPnP description (`http://<tv>:9197/dmr`) shows `Y2017`, and `sdb capability` confirms `platform_version:3.0`. Write for the oldest TV and everything newer works.
- **The TV can take about a minute to answer** after waking. Retry before deciding it's offline.
- **The REST API on port 8001** (`/api/v2/`) is a reliable, read-only way to check a TV: model, developer mode, developer IP, and whether an app is running (`/api/v2/applications/<id>`).

## Installing (developer mode and certificates)

- **Samsung certificates are tied to device IDs.** An app installs only on TVs whose DUIDs are in the distributor certificate. Every new TV means editing the certificate profile with a Samsung account. Get a DUID with `python3 tools/deploy.py duid <ip>`.
- **The TV only accepts the Mac at its developer IP.** When the Mac's address changed through a DHCP renewal, every install failed silently, because the TV reset the connection straight after the handshake. **Check this first** (`deploy.py check`). The lasting fix is a DHCP reservation on the router.
- **Samsung's `sdb` tool on the Mac stopped connecting** even after the IP was fixed. Its server never opened a connection, while Python on the same Mac connected fine. We wrote `tools/tvlink.py`, which speaks the protocol directly (connect, sync push, `0 vd_appinstall`, `0 was_execute`), and it has worked every time since. See [ADR 0003](adr/0003-direct-developer-protocol-client.md).
- **Signing profile names matter.** The profile was created as `default`, not the planned `OfficeTV`. `tizen package` silently produced an unsigned package with the wrong name. That name now lives in `tvs.json`.

## What a sideloaded app can't do on this TV

- **Become the default app at power-on.** Not possible on consumer Samsung TVs. *Autorun Last App* is the nearest option, but it follows whatever app was used last.
- **Open the Sources menu directly.** We tried a lot of routes:
  - `KEY_HDMI1` and `KEY_HDMI2` through the remote-control service did nothing on this model.
  - `KEY_SOURCE` works, but only over `wss://<tv>:8002` with a pairing token. Port 8001 refuses remote control on this TV.
  - From inside the app, `wss://` to the TV's LAN IP is refused, because the self-signed SmartViewSDK certificate is rejected, and `127.0.0.1:8002` times out.
  - Launching `org.tizen.SMSourceAPP`, `tv-viewer`, `function-osd`, `hdmicec` or app-control variants either did nothing or opened nothing visible. We tested nine variants on the TV.
  - **`org.volt.firstscreen` (Samsung's home bar) does open.** It's what the TV Menu box uses. Source is its first tile.
- **Open the live TV channels.** The Samsung TV Plus package only opens its privacy preferences, and the native viewer isn't launchable from the REST service.

## Building the experience

- **"Subtle" has to be visible from the sofa within seconds.** Two-minute zooms and faint mist read as a static photo. Effects now start about 1.5 seconds after any scene appears, including after exploring with Left and Right.
- **Don't let the weather mute the scene.** The overcast setting was suppressing birds, stars and glints, so the screen looked dead on cloudy days. The photos show their own sky, so the weather now only adds a light wash.
- **Effects must belong to the image.** Fog sits where the photos have fog, the sun glow sits on the painted sun, and lake glints sit on the lake. Generic full-width mist bands looked fake.
- **Believability beats spectacle.** A large "hawk" looked unrealistic and was removed. Birds look right when their wings beat and then glide, rather than flip. Aircraft need the real light pattern: a double white strobe and a red beacon.
- **Graphics memory is limited.** Several full-screen animated layers probably caused a reload. Explore layers are now only drawn while exploring.
- **Images:** supply backgrounds at 1920x1080. The web app renders at 1080p, so 4K is wasted. A set supplied at 1672x941 had to be scaled up.
- **Number keys** reach the app only after `tizen.tvinputdevice.registerKey()`.
- **Listener order:** on M47, capture and bubble listeners on `document` fire in the order they were registered. Modules that must win, such as settings, stop propagation explicitly.

## Working with Andrew (preferences that shaped the design)

- British English throughout.
- Clean and calm: no greeting text, weather as a secondary line, and a clear time and date.
- Ask before adding UI he didn't request. The HDMI boxes were added back without asking, and that was a mistake.
- Show a short plan of files before creating them, and never overwrite existing files.
- Keep temporary experiments on a branch, so the stable version can be restored in a minute.
