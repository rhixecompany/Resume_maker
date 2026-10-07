#!/usr/bin/env bash
# search-apt.sh -- check whether a package name exists in apt repositories.
#
# Usage:
#     bash search-apt.sh <package-name> [--exact]
#
# Exit codes:
#   0 = package found
#   1 = package not found
#   2 = apt update failed
set -euo pipefail

PKG="${1:?Usage: $0 <package-name> [--exact]}"
EXACT="${2:-}"

# `apt update` needs privileged access (sudo). Prefer a non-blocking attempt.
if sudo -n apt update -qq 2>/dev/null; then
    :
else
    # Fall back to the existing apt lists (no sudo / no refresh).
    :
fi

if [[ "$EXACT" == "--exact" ]]; then
    apt-cache show "$PKG" >/dev/null 2>&1
else
    apt-cache search "^$PKG$" | grep -q "^$PKG "
fi
