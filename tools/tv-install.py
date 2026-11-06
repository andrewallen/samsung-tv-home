"""Install a signed .wgt on one TV and launch it.

Usage: python3 tools/tv-install.py <package.wgt> <app id> <tv host>
For several TVs, use tools/deploy.py instead.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tvlink import TV  # noqa: E402

if len(sys.argv) < 4:
    raise SystemExit(__doc__)
wgt, app_id, host = sys.argv[1], sys.argv[2], sys.argv[3]
with TV(host) as tv:
    print('connected:', tv.device)
    print(tv.install(wgt, app_id).strip()[-400:])
    print(tv.launch(app_id).strip()[-200:])
