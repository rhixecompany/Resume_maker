#!/usr/bin/env bash
# inventory-winget.sh -- enumerate all winget packages with versions.
#
# Output: one JSON object per line to stdout.
#   {id, name, version, source, install_location}
#
# Usage:
#     bash inventory-winget.sh > winget-inventory.json
#
# NOTE: winget is a Windows package manager. On a Windows host this runs fine.
# In WSL it is skipped (winget not on PATH). The file below is the canonical
# script you can copy to your Windows machine and run there.
set -euo pipefail

winget list --accept-source-agreements --include-unknown --output-format=json 2>/dev/null |
  jq -c '.[] | {id: .Id, name: .Name, version: .Version, source: .Source, install_location: .InstallLocation}' |
  sort -u
