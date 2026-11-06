"""Build, sign and install the Home app on the TVs listed in tvs.json.

Usage:
  python3 tools/deploy.py                 build once, install on every enabled TV
  python3 tools/deploy.py --tv "Office TV"  install on one TV only
  python3 tools/deploy.py check           show which TVs are reachable and ready
  python3 tools/deploy.py duid <host>     print a TV's device ID (for the certificate)
  python3 tools/deploy.py apps <host>     list the apps installed on a TV (for the app list)

Your TVs and private settings live in tvs.json (not tracked by git; copy
tvs.example.json to start). Its "local" section (app list, default location,
private-mode code) is written to js/local.js before each build.

Needs Tizen Studio's command-line tools in ~/tizen-studio (for building and
signing) and a Samsung signing profile whose distributor certificate lists
every TV's device ID.
"""
import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from tvlink import TV  # noqa: E402

TIZEN = os.path.expanduser('~/tizen-studio/tools/ide/bin/tizen')
EXCLUDE = ['README.md', 'CHANGELOG.md', 'docs/*', 'tools/*', 'tvs.json', 'tvs.example.json', '.git/*', '.gitignore', '.impeccable/*', '.github/*']


def load_config():
    path = os.path.join(ROOT, 'tvs.json')
    if not os.path.exists(path):
        raise SystemExit('No tvs.json yet. Copy tvs.example.json to tvs.json and fill it in.')
    with open(path) as f:
        return json.load(f)


def write_local(cfg):
    """Write the private, per-household settings into js/local.js for the build."""
    local = cfg.get('local', {})
    with open(os.path.join(ROOT, 'js', 'local.js'), 'w') as f:
        f.write('// Written by tools/deploy.py from tvs.json. Not tracked by git.\n')
        f.write('window.HOME_LOCAL = ' + json.dumps(local, indent=2) + ';\n')


def my_ip_towards(host):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect((host, 26101))
        return s.getsockname()[0]
    finally:
        s.close()


def tv_info(host):
    """Read the TV's own description (model, developer mode, developer IP)."""
    try:
        with urllib.request.urlopen('http://%s:8001/api/v2/' % host, timeout=5) as r:
            return json.load(r).get('device', {})
    except Exception:
        return None


def build_and_sign(profile):
    out = tempfile.mkdtemp(prefix='home-build-')
    cmd = [TIZEN, 'build-web', '-out', out]
    for e in EXCLUDE:
        cmd[2:2] = ['-e', e]
    subprocess.run(cmd, cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    subprocess.run([TIZEN, 'package', '-t', 'wgt', '-s', profile, '--', out], check=True, stdout=subprocess.DEVNULL)
    wgts = [f for f in os.listdir(out) if f.endswith('.wgt')]
    if not wgts:
        raise SystemExit('Packaging produced no .wgt. Check the signing profile name in tvs.json.')
    return out, os.path.join(out, wgts[0])


def check(tvs):
    ok = True
    for t in tvs:
        info = tv_info(t['host'])
        if info is None:
            print('%-16s %-16s not reachable (off, asleep, or wrong address)' % (t['name'], t['host']))
            ok = False
            continue
        mine = my_ip_towards(t['host'])
        dev = info.get('developerMode') == '1'
        ip_ok = info.get('developerIP') == mine
        status = 'ready' if dev and ip_ok else (
            'developer mode is off' if not dev else
            'developer IP is %s but this computer is %s' % (info.get('developerIP'), mine))
        print('%-16s %-16s %-12s %s' % (t['name'], t['host'], info.get('modelName', '?'), status))
        ok = ok and dev and ip_ok
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('command', nargs='?', default='deploy', choices=['deploy', 'check', 'duid', 'apps'])
    ap.add_argument('host', nargs='?')
    ap.add_argument('--tv', help='name of a single TV from tvs.json')
    args = ap.parse_args()

    if args.command in ('duid', 'apps'):
        if not args.host:
            raise SystemExit('Usage: deploy.py %s <host>' % args.command)
        with TV(args.host) as tv:
            print(tv.duid() if args.command == 'duid' else tv.shell('0 applist'))
        return

    cfg = load_config()
    tvs = [t for t in cfg['tvs'] if t.get('enabled', True)]
    if args.tv:
        tvs = [t for t in cfg['tvs'] if t['name'] == args.tv]
        if not tvs:
            raise SystemExit('No TV called %r in tvs.json' % args.tv)

    if args.command == 'check':
        check(tvs)
        return

    write_local(cfg)
    out, wgt = build_and_sign(cfg.get('signing_profile', 'default'))
    print('Built and signed %s' % os.path.basename(wgt))
    results = []
    try:
        for t in tvs:
            try:
                with TV(t['host']) as tv:
                    log = tv.install(wgt, cfg['app_id'])
                    if 'install completed' not in log:
                        raise RuntimeError(log.strip().splitlines()[-1] if log.strip() else 'no installer output')
                    tv.launch(cfg['app_id'])
                results.append((t['name'], 'installed'))
            except Exception as e:  # keep going with the other TVs
                results.append((t['name'], 'FAILED: %s' % e))
    finally:
        shutil.rmtree(out, ignore_errors=True)
    for name, res in results:
        print('%-16s %s' % (name, res))
    if any(r.startswith('FAILED') for _, r in results):
        print('\nFor a failed TV, run: python3 tools/deploy.py check')
        sys.exit(1)


if __name__ == '__main__':
    main()
