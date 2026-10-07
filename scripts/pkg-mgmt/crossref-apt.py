#!/usr/bin/env python3
"""crossref-apt.py -- classify packages as apt-migratable or Windows-only.

Usage:
    cat dedupe-result.json | python3 crossref-apt.py > crossref-result.json

Reads a JSON object with a "keep" array (from deduplicate-packages.py) on
stdin and writes {"migratable": [...], "windows_only": [...]} on stdout.

Heuristic mapping:
  - The package name is looked up in the local apt cache (built via `apt-cache
    dump` after a non-blocking `apt update`).
  - A package is migratable if its name matches an apt package exactly, or
    starts with an apt package name followed by "-".
  - Migratable entries carry an "apt_name" field; unmigrated ones keep their
    original name and are recorded as Windows-only.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

APT_CACHE_FILE = Path("/tmp/apt-package-cache.txt")


def build_apt_cache():
    """Populate local cache of all apt package names for fast lookup.

    Reads the existing apt package lists (no permission needed) via `apt-cache
    dump`.  If the lists are missing, fall back to a non-blocking `apt update`
    (which requires sudo) and then `apt-cache dump`.
    """
    if APT_CACHE_FILE.exists():
        if time.time() - APT_CACHE_FILE.stat().st_mtime < 3600:
            return
    result = subprocess.run(["apt-cache", "dump"], capture_output=True, text=True)
    if result.returncode != 0:
        # Fall back to a non-blocking apt update; it may fail if sudo is blocked.
        subprocess.run(["sudo", "-n", "apt", "update", "-qq"], check=False, capture_output=True)
        result = subprocess.run(["apt-cache", "dump"], capture_output=True, text=True)
    names = set()
    for line in result.stdout.splitlines():
        if line.startswith("Package: "):
            names.add(line.split("Package: ")[1].strip())
    APT_CACHE_FILE.write_text("\n".join(sorted(names)))


def _find_apt_name(pkg_name):
    apt_names = set(APT_CACHE_FILE.read_text().splitlines()) if APT_CACHE_FILE.exists() else set()
    n = pkg_name.lower()
    if n in apt_names:
        return n
    # e.g. azure-cli -> azure-cli; but git is git. Prefer an apt name that the
    # pkg name is a prefix of, or that matches a trailing "-<pkg>" segment.
    for an in sorted(apt_names):
        if an == n or (an.lower().endswith("-" + n) and an.count("-") >= 1):
            return an
    return None


def classify(packages):
    build_apt_cache()
    apt_names = set(APT_CACHE_FILE.read_text().splitlines()) if APT_CACHE_FILE.exists() else set()
    migratable, windows_only = [], []
    for pkg in packages:
        name = pkg.get("name") or pkg.get("id") or pkg.get("version", "")
        name_lower = name.lower()
        apt_name = _find_apt_name(name_lower)
        entry = dict(pkg)
        entry["apt_name"] = apt_name if apt_name else name_lower
        if apt_name:
            migratable.append(entry)
        else:
            windows_only.append(entry)
    return migratable, windows_only


def main():
    data = json.load(sys.stdin)
    pkgs = data.get("keep", [])
    migratable, windows_only = classify(pkgs)
    print(json.dumps({"migratable": migratable, "windows_only": windows_only}, indent=2))


if __name__ == "__main__":
    main()
