#!/usr/bin/env bash
# test_e2e_dryrun.sh -- end-to-end dry-run of the deduplication pipeline
# with mocked data (no winget/choco required).
set -euo pipefail

MOCK_DIR=$(mktemp -d)
trap 'rm -rf "$MOCK_DIR"' EXIT

cat > "$MOCK_DIR/winget.json" <<'EOF'
[{"id":"Git.Git","name":"Git","version":"2.42.0","source":"winget"},{"id":"Git.Git","name":"Git","version":"2.40.0","source":"winget"}]
EOF
cat > "$MOCK_DIR/choco.json" <<'EOF'
[{"id":"vscode","name":"Visual Studio Code","version":"1.85.0","source":"chocolatey"}]
EOF

echo "=== Running dedup ==="
python3 scripts/pkg-mgmt/deduplicate-packages.py \
    "$MOCK_DIR/winget.json" \
    "$MOCK_DIR/choco.json" > "$MOCK_DIR/dedupe.json"

echo "=== Verifying output ==="
KEEP_COUNT=$(jq '.keep | length' "$MOCK_DIR/dedupe.json")
REMOVE_COUNT=$(jq '.remove | length' "$MOCK_DIR/dedupe.json")

if [[ "$KEEP_COUNT" -ne 2 ]]; then
    echo "FAIL: expected 2 keep entries, got $KEEP_COUNT"
    exit 1
fi
if [[ "$REMOVE_COUNT" -ne 1 ]]; then
    echo "FAIL: expected 1 remove entry, got $REMOVE_COUNT"
    exit 1
fi

echo "E2E dry-run passed: KEEP=$KEEP_COUNT REMOVE=$REMOVE_COUNT"
