#!/usr/bin/env bash
# inventory-choco.sh -- enumerate all Chocolatey packages with versions.
#
# Output: one JSON object per line to stdout.
#   {id, name, version, source}
#
# Usage:
#     bash inventory-choco.sh > choco-inventory.json
#
# NOTE: choco is a Windows package manager. On a Windows host this runs fine.
# In WSL it is skipped (choco not on PATH). The file below is the canonical
# script you can copy to your Windows machine and run there.
set -euo pipefail

choco list --local-only --limit-output --ignore-checksums 2>/dev/null |
  awk -F'|' '{print "{\"id\":\""$1"\",\"name\":\""$1"\",\"version\":\""$2"\",\"source\":\"chocolatey\"}"}' |
  jq -s '.'
