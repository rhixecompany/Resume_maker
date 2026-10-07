#!/usr/bin/env python3
"""deduplicate-packages.py -- find multi-version packages, keep latest per ID.

Usage:
    python3 deduplicate-packages.py <winget_inventory.sh_or_json> <choco_inventory.sh_or_json>

Inventory inputs may be:
  - a JSON array of package objects [{id, name, version, source, ...}], or
  - a shell script emitting one JSON object per line (for piping).

Output: JSON object {"keep": [...], "remove": [...]} where keep_list holds the
latest version per package id.
"""
import json
import subprocess
import sys


def _fallback_parse(v):
    """Parse a version string without the `packaging` module.

    Handles the common forms winget/choco emit (e.g. "2.42.0", "1:2.53.0-1",
    "1.85.0", "2.1.0.0").  Splits on non-digit/non-dot characters, normalises
    numeric segments to fixed-width zero-padded strings, then compares tuples.
    """
    parts = []
    for seg in str(v).replace(":", ".").split("."):
        num = "".join(ch for ch in seg if ch.isdigit())
        if num:
            parts.append(num.zfill(8))
        else:
            parts.append(seg)
    return tuple(parts)


def parse_version(v):
    """Parse a version string via packaging, falling back to a generic parser.

    winget/choco emit several non-PEP440 forms (e.g. "1:2.53.0-1", "2.1.0.0"),
    which packaging rejects with InvalidVersion.  In that case we fall back to
    a tolerant parser that normalises numeric segments and compares tuples.
    """
    try:
        import packaging.version  # noqa: F401

        return packaging.version.parse(v)
    except ImportError:
        pass
    except Exception:
        pass
    return _fallback_parse(v)


def _load_json_array(path):
    """Load a JSON array from a file or from a script whose stdout is a JSON array."""
    with open(path, "r", encoding="utf-8") as fh:
        text = fh.read().strip()
    if text.startswith("["):
        return json.loads(text)
    # Otherwise treat as a script producing newline-delimited JSON objects
    result = subprocess.run([sys.executable, path], capture_output=True, text=True, check=True)
    return [json.loads(line) for line in result.stdout.splitlines() if line.strip()]


def deduplicate(packages):
    """Return (keep_list, remove_list), latest version per id wins."""
    keep_by_id = {}
    for pkg in packages:
        vid = pkg.get("id") or pkg.get("name")
        ver = pkg.get("version", "")
        if not vid:
            continue
        if vid not in keep_by_id or parse_version(ver) > parse_version(keep_by_id[vid]["version"]):
            keep_by_id[vid] = pkg

    keep = list(keep_by_id.values())
    # Packages whose id matched a keep candidate, minus the exact kept object.
    removed_vids = set(keep_by_id.keys())
    remove = []
    for p in packages:
        vid = p.get("id") or p.get("name")
        if vid not in removed_vids:
            continue
        if p is keep_by_id[vid]:
            continue
        remove.append(p)
    return keep, remove


def main(argv):
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    winget_pkgs = _load_json_array(argv[1])
    choco_pkgs = _load_json_array(argv[2])
    all_pkgs = winget_pkgs + choco_pkgs
    keep, remove = deduplicate(all_pkgs)
    print(json.dumps({"keep": keep, "remove": remove}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
