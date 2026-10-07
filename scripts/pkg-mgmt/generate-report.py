#!/usr/bin/env python3
"""generate-report.py -- pretty-print a migration plan for clarification rounds.

Usage:
    cat crossref-result.json | python3 generate-report.py
"""
import json
import sys


def format_package(pkg):
    apt_name = pkg.get("apt_name", "N/A")
    return f"  - {pkg['name']} (v{pkg['version']}) -> apt: {apt_name}"


def main():
    data = json.load(sys.stdin)
    migratable = data.get("migratable", [])
    windows_only = data.get("windows_only", [])

    print("=== APT-MIGRATABLE PACKAGES ===")
    for p in migratable:
        print(format_package(p))
    print(f"\nTotal migratable: {len(migratable)}")

    print("\n=== WINDOWS-ONLY PACKAGES (stay on winget/choco) ===")
    for p in windows_only:
        print(f"  - {p['name']} (v{p.get('version', 'unknown')})")
    print(f"\nTotal Windows-only: {len(windows_only)}")


if __name__ == "__main__":
    main()
