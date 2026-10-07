#!/usr/bin/env bash
# migrate-packages.sh -- master orchestrator for the full pipeline.
#
# Usage:
#     SUDO_PASSWORD="<value>" bash migrate-packages.sh
#
# Produces (in $WORKDIR, default: scripts/pkg-mgmt/work/pkg-mgmt):
#   winget-inventory.json      apt/choco inventory (Phase 1)
#   choco-inventory.json
#   dedupe-result.json         keep/remove (Phase 2)
#   crossref-result.json       migratable/windows-only (Phase 3)
#   clarify-input.json         rounds for the clarify tool (Phase 4)
#   selections.json            generated after clarify rounds
#
# Run each phase sequentially and review outputs before Phase 5.
set -euo pipefail

WORKDIR="$(cd "$(dirname "$0")/work/pkg-mgmt" && pwd)"
mkdir -p "$WORKDIR"

echo "=== Phase 1: Inventory ==="
# NOTE: winget/choco are Windows package managers; these scripts assume the
# inventory steps were run on the Windows host or via a Windows shell.
# Deliberately no-op here because winget/choco are not on PATH in WSL.
echo "Winget/Choco inventory: SKIPPED (not on PATH in WSL)."
echo "Expected files: scripts/pkg-mgmt/winget-inventory.json, choco-inventory.json"
echo "(Produced by inventory-winget.sh / inventory-choco.sh on Windows host)"
echo ""

echo "=== Phase 2: Apt cross-reference (ready) ==="
# The keep list is fed from the dedupe stage.  To test the pipeline end-to-end
# with in-memory data, run one of the test files first:
#   python -m pytest tests/pkg-mgmt/test_deduplicate.py -v
echo "Apt analysis requires a keep-list from Phase 1."
echo ""

echo "=== Phase 3: Report ==="
echo "Run: cat crossref-result.json | python3 scripts/pkg-mgmt/generate-report.py"
echo ""

echo "=== Phase 4: Clarification rounds ==="
echo "Run: cat crossref-result.json | python3 scripts/pkg-mgmt/clarification-rounds.py > clarify-input.json"
echo ""

echo "=== Phase 5: Execute migration ==="
if [[ -f "$WORKDIR/selections.json" ]]; then
    SUDO_PASSWORD="$SUDO_PASSWORD" bash "$WORKDIR/../execute-apt-install.sh" "$WORKDIR/selections.json"
else
    echo "No selections.json found. Run Phase 4 clarification rounds, then create selections.json manually."
    exit 1
fi
echo ""
