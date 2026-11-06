# Home for Samsung TVs

A custom home screen for Samsung Tizen TVs, and the tools to install and update it on every TV in the house.

The app shows a list of apps, the time, date and weather. The background is a mountain scene that changes with the real time of day, with gentle movement: drifting fog and clouds, birds by day, and stars and meteors by night.

It's written for the oldest TV in the house, a 2017 model running Tizen 3.0, so it runs on that TV and on newer ones.

## Using it

| On the remote | What it does |
| --- | --- |
| Up and Down | Move through the apps. Down past the last app reaches **TV Menu**, which opens Samsung's home bar. |
| OK | Open the selected app |
| Left and Right | Explore the times of day. It returns to the live scene after 30 seconds. |
| Return | Settings: location, clock, date, weather, background, motion, sounds and the app list |
| Your private code | Private mode: hides the apps you choose and locks settings. Type it again to undo. Set it in `tvs.json`. |

## Managing the TVs

Every TV is listed in `tvs.json`, along with your private settings: the app list, default location and private-mode code. It isn't tracked by git, so copy `tvs.example.json` to start. One command builds and signs the app once, then installs it on every enabled TV:

```bash
python3 tools/deploy.py
```

Other commands:

```bash
python3 tools/deploy.py check
```

```bash
python3 tools/deploy.py --tv "Office TV"
```

```bash
python3 tools/deploy.py duid <tv ip>
```

- `check` shows which TVs are reachable and ready.
- `--tv` installs on one TV only.
- `duid` prints a TV's device ID, which you need for the certificate.

### What you need on the Mac

- **Tizen Studio command-line tools** in `~/tizen-studio`, with the *Samsung Certificate Extension* and *TV Extensions* installed through its package manager.
- **A Samsung signing profile**, made in Certificate Manager with a Samsung account. Its name goes in `tvs.json` as `signing_profile`. It's currently `default`.

The signing certificates live in `~/SamsungCertificate` and are deliberately **not** in this repository.

### Adding another TV

1. **Turn on developer mode** on the TV: open **Apps**, type **1 2 3 4 5** on the remote, switch Developer mode **On**, enter this Mac's IP address (`ipconfig getifaddr en0`), and restart the TV.
2. **Add the TV to `tvs.json`** with a name, its IP address and its model.
3. **Get its device ID:** `python3 tools/deploy.py duid <tv ip>`.
4. **Add the device ID to the certificate.** Samsung only lets an app install on TVs whose device IDs are in the distributor certificate. In Certificate Manager, edit the profile and add the new ID, keeping the existing ones. Then re-sign by running the deploy again.
5. **Run `python3 tools/deploy.py check`**, then `python3 tools/deploy.py`.

### If installs stop working

Almost always, the Mac's IP address has changed, so it no longer matches the Host PC IP in a TV's developer mode. `deploy.py check` will say so. Either update the TV, or give the Mac a fixed address on the router.

## Changing the app

- **Apps in the list:** `tvs.json` under `local.apps`. `js/apps.js` holds only a public example. List a TV's app IDs with `python3 tools/deploy.py apps <tv ip>`. Each TV may have different apps installed. Apps that aren't present can be hidden in that TV's settings.
- **Default location, private code, start app:** `tvs.json` under `local`. Each TV can also set its own location in settings.
- **Backgrounds:** `img/bg/`, eight 1920x1080 images of one scene, from pre-dawn to night. Per-scene effects (sun position, fog, birds and so on) are in the `SCENES` table in `js/scene.js`.

Preview in a browser by opening `index.html` at 1920x1080. The arrow keys and Enter stand in for the remote, but the remote's Return key has no keyboard equivalent.

### Writing for the 2017 TV

Stick to ES5 JavaScript with no build step. Use flexbox, and animate only `transform` and `opacity`. CSS Grid, custom properties, `backdrop-filter`, flexbox `gap` and Intersection Observer aren't available on its web engine.

## Known limits

- A sideloaded app can't be made the TV's default at power-on. Samsung's *Autorun Last App* setting is the nearest option.
- An app can't open the Sources menu directly. TV Menu opens Samsung's home bar, where Source is the first tile.
- Developer-mode installs are tied to the certificate's device IDs, as described above.

## Documentation

See [docs/](docs/README.md) for the architecture, operations runbook, learnings, governance and decision records, and [CHANGELOG.md](CHANGELOG.md) for the history.

## Credits

- **Font:** Hanken Grotesk, under the SIL Open Font License (`fonts/OFL.txt`).
- **Weather:** [Open-Meteo](https://open-meteo.com).
- **Postcode lookup:** [postcodes.io](https://postcodes.io).
