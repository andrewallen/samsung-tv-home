# Operations

## Setting up a new Mac

1. **Install Tizen Studio's command-line tools.** Get the CLI installer for macOS from download.tizen.org. It runs under Rosetta on Apple silicon and bundles its own Java. Install it to `~/tizen-studio`.
2. **Add the Samsung packages** with the package manager:

   ```bash
   ~/tizen-studio/package-manager/package-manager-cli.bin install --accept-license Certificate-Manager cert-add-on TV-SAMSUNG-Public-WebAppDevelopment
   ```

3. **Restore or create the signing profile.**
   - **To restore:** copy `~/SamsungCertificate/<profile>/` and `~/tizen-studio-data/profile/profiles.xml` from the old Mac.
   - **To create:** open `~/tizen-studio/tools/certificate-manager/certificate-manager.app`, choose **+**, then **Samsung**, then **TV**, sign in with the Samsung account, and add every TV's DUID.

   Set the profile name in `tvs.json`.
4. **Fix the Mac's IP address** with a DHCP reservation on the router. Then set that IP as the Host PC IP on every TV.

## Deploying

```bash
python3 tools/deploy.py check
```

```bash
python3 tools/deploy.py
```

```bash
python3 tools/deploy.py --tv "Office TV"
```

`check` should report every TV as `ready` before you deploy. The second command builds and signs once, then installs on every enabled TV. The third installs on one TV only.

The app's settings on each TV (location, hidden apps, private mode and so on) survive reinstalls.

## Adding a TV

1. On the TV, open **Apps** and type **1 2 3 4 5**. Turn **Developer mode** on, set the Host PC IP to the Mac's address, and restart the TV.
2. Add the TV to `tvs.json` with its name, IP address, model, year and Tizen version. On a new Mac, copy `tvs.example.json` to `tvs.json` first, and keep a private backup of it, because it isn't in git.
3. Run `python3 tools/deploy.py duid <ip>` to get its device ID.
4. In Certificate Manager, edit the signing profile's distributor certificate and **add** the new DUID, keeping the existing ones.
5. Run `deploy.py check`, then `deploy.py`.
6. On the new TV, check the app list (`local.apps` in `tvs.json`) against what's installed. List a TV's apps with:

   ```bash
   python3 tools/deploy.py apps <ip>
   ```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `deploy.py check` says "developer IP is X but this computer is Y" | The Mac's address changed | Update the TV's Host PC IP, or reserve the Mac's address on the router |
| "not reachable" | The TV is off, asleep, or has a new IP | Wake it and wait a minute; check the router for its address |
| Install fails with a certificate or signature error | The TV's DUID isn't in the certificate | Add the DUID in Certificate Manager and redeploy |
| The package isn't signed, or `.wgt` is missing | Wrong profile name | Check `signing_profile` in `tvs.json` against Certificate Manager |
| The app opens but tiles do nothing | That TV lacks the app ID | Fix `local.apps` in `tvs.json`, or hide the app in that TV's settings |
| The old icon still shows on the TV | Icon cache | Restart the TV by holding the power button |
| The screen reloads now and then | Graphics memory pressure | Reduce full-screen animated layers; see LEARNINGS |

## Rolling back

Every release is tagged. To put an earlier version back on the TVs:

```bash
git checkout <tag>
```

```bash
python3 tools/deploy.py
```

```bash
git checkout main
```

Experiments live on `experiment/*` branches. Deploy from the branch, then check out `main` and deploy again to restore. The design tool's cache folder (`.impeccable/`) is ignored, so it can't block a checkout.
