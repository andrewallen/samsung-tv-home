# Documentation

Start here if you're picking this project up from scratch.

| Document | Read it for |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the app is built: modules, the scene system, settings, and the 2017 engine's limits |
| [OPERATIONS.md](OPERATIONS.md) | Day-to-day running: deploying, adding a TV, certificates, troubleshooting, rolling back |
| [LEARNINGS.md](LEARNINGS.md) | What we found out the hard way, so nobody has to again |
| [GOVERNANCE.md](GOVERNANCE.md) | How changes are made, tested, released and recorded |
| [adr/](adr/) | Architecture decision records: the significant choices and why we made them |
| [../CHANGELOG.md](../CHANGELOG.md) | What changed and when |

## The project in one paragraph

This is a custom home screen for Samsung Tizen TVs, sideloaded through developer mode. It's a plain web app (HTML, CSS and ES5 JavaScript, with no build step), written for the oldest TV in the house, a 2017 UE50MU6120 on Tizen 3.0, so it also runs on newer models. A Python script builds and signs it once, then installs it on every TV listed in `tvs.json`. It talks to each TV's developer connection directly, because Samsung's own tool proved unreliable.

## Quick start for a new maintainer

1. Install Tizen Studio's command-line tools, with the Samsung Certificate Extension and TV Extensions. See [OPERATIONS.md](OPERATIONS.md#setting-up-a-new-mac).
2. Create or restore the Samsung signing profile. The certificates are **not** in this repository.
3. Open `index.html` in a browser at 1920x1080 to preview.
4. Run `python3 tools/deploy.py check`, then `python3 tools/deploy.py`.
