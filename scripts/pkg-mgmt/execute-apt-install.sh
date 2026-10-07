#!/usr/bin/env bash
# execute-apt-install.sh -- install selected packages via apt and purge them from winget/choco.
#
# Usage:
#     SUDO_PASSWORD="<value>" ./execute-apt-install.sh <selections.json>
#
# selections.json is a JSON array of objects:
#   {
#     "name":       "Git.Git",       # original package id (winget) or name (choco)
#     "apt_name":   "git",           # resolved apt package name
#     "source":     "winget|chocolatey",
#     "action":     "install|skip"
#   }
#
# Every install is preceded by a `clarify` confirmation round (5 per turn).
# The script never purges anything without an explicit selection of "install".
set -euo pipefail

SELECTIONS="${1:-}"
if [[ -z "$SELECTIONS" ]]; then
    echo "Usage: $0 <selections.json>" >&2
    exit 2
fi

if [[ -z "${SUDO_PASSWORD:-}" ]]; then
    echo "ERROR: SUDO_PASSWORD is not set in the environment." >&2
    echo "It is read from \$HERMES_HOME/.env at runtime (never logged here)." >&2
    exit 1
fi

SUDO_CMD=(sudo -S)

echo "=== Apt migration executor ==="
echo "Selections file: $SELECTIONS"
echo ""

jq -c '.[] | select(.action == "install")' "$SELECTIONS" | while read -r sel; do
    APT_NAME=$(printf '%s' "$sel" | jq -r '.apt_name // empty')
    WINGET_ID=$(printf '%s' "$sel" | jq -r '.id // empty')
    CHOCO_ID=$(printf '%s' "$sel" | jq -r '.choco_id // empty')
    SRC=$(printf '%s' "$sel" | jq -r '.source // "unknown"')

    echo ">>> Installing '$APT_NAME' via apt (origin: $SRC)"
    if command -v sudo &>/dev/null; then
        echo "$SUDO_PASSWORD" | "${SUDO_CMD[@]}" apt install -y "$APT_NAME"
    else
        apt install -y "$APT_NAME"
    fi
    echo "    -> apt install of '$APT_NAME' completed."
    echo ""

    # Purge the original Windows-side installation only if we installed via apt.
    if [[ "$SRC" == "chocolatey" && -n "$CHOCO_ID" ]]; then
        echo ">>> Purging Chocolatey '$CHOCO_ID' (origin of this package)"
        choco uninstall "$CHOCO_ID" -y --limit-output
        echo "    -> Chocolatey purge completed."
    elif [[ "$SRC" != "chocolatey" && -n "$WINGET_ID" ]]; then
        echo ">>> Purging Winget '$WINGET_ID' (origin of this package)"
        winget uninstall --id "$WINGET_ID" --accept-source-agreements 2>/dev/null || true
        echo "    -> Winget purge attempted."
    fi
    echo ""
done

echo "=== Migration complete ==="
