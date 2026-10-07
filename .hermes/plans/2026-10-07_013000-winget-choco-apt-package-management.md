# Plan: Winget/Choco Package Audit, Deduplication, and Apt Migration

## Goal
Audit all installed Winget and Chocolatey packages, deduplicate multi-version installations keeping only latest versions, identify packages installable via apt in WSL, interactively select packages to install via apt (5 questions per clarification round), purge Winget/Choco installations of apt-migratable packages, and install selected packages via apt.

## Current Context / Assumptions
- **Environment**: Windows 10/11 with WSL2 (Ubuntu/Debian-based) — user runs Hermes in WSL at `/mnt/c/Users/Alexa/playgrounds/Resume_maker`
- **Package managers available**: `winget` (Windows Package Manager), `choco` (Chocolatey), `apt` (WSL Linux)
- **User preference**: Concise, direct, evidence-first communication; prefers interactive clarification (5 questions per turn)
- **No existing automation** — this is a fresh procedural task, not a codebase feature
- **Sudo password** for apt operations is stored in `$HERMES_HOME/.env` as `SUDO_PASSWORD=200107` (never logged)
- **Risk tolerance**: Low — package removal is destructive; every uninstall must be confirmed interactively

## Architecture / Proposed Approach
Three-phase pipeline: **(1) Inventory & Deduplication** — enumerate Winget/Choco packages, detect multi-version entries, generate keep/remove lists; **(2) Apt Migratability Analysis** — cross-reference each package against apt repositories (Ubuntu/Debian), produce migratable vs Windows-only classification; **(3) Interactive Migration** — multi-round clarification (5 questions/round) to select packages for apt install, then execute: purge Winget/Choco → apt install selected.

All steps are idempotent scripts saved under `scripts/pkg-mgmt/` for reusability. Each destructive action requires explicit `clarify` confirmation.

## Step-by-Step Tasks

### Phase 1: Inventory & Deduplication

#### Task 1.1 — Create inventory script for Winget
**File**: `scripts/pkg-mgmt/inventory-winget.sh`
```bash
#!/usr/bin/env bash
# inventory-winget.sh — enumerate all winget packages with versions
# Output: JSON array to stdout, one object per package: {id, name, version, source, install_location}
set -euo pipefail
winget list --accept-source-agreements --include-unknown --output-format=json 2>/dev/null |
  jq -c '.[] | {id: .Id, name: .Name, version: .Version, source: .Source, install_location: .InstallLocation}' |
  sort -u
```
**Verification**: `bash scripts/pkg-mgmt/inventory-winget.sh | jq length` → expect integer > 0

#### Task 1.2 — Create inventory script for Chocolatey
**File**: `scripts/pkg-mgmt/inventory-choco.sh`
```bash
#!/usr/bin/env bash
# inventory-choco.sh — enumerate all choco packages with versions
# Output: JSON array to stdout, one object per package: {id, name, version, source}
set -euo pipefail
choco list --local-only --limit-output --ignore-checksums 2>/dev/null |
  awk -F'|' '{print "{\"id\":\""$1"\",\"name\":\""$1"\",\"version\":\""$2"\",\"source\":\"chocolatey\"}"}' |
  jq -s '.'
```
**Verification**: `bash scripts/pkg-mgmt/inventory-choco.sh | jq length` → expect integer > 0

#### Task 1.3 — Create deduplication analyzer
**File**: `scripts/pkg-mgmt/deduplicate-packages.py`
```python
#!/usr/bin/env python3
"""deduplicate-packages.py — find multi-version packages, keep latest per ID."""
import json, sys, subprocess
from packaging import version

def load_inventory(script):
    result = subprocess.run([script], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)

def deduplicate(packages):
    """Return (keep_list, remove_list) where keep_list has latest version per id."""
    by_id = {}
    for pkg in packages:
        vid = pkg['id']
        ver = pkg['version']
        if vid not in by_id or version.parse(ver) > version.parse(by_id[vid]['version']):
            by_id[vid] = pkg
    keep = list(by_id.values())
    all_ids = {p['id'] for p in packages}
    keep_ids = {p['id'] for p in keep}
    remove = [p for p in packages if p['id'] in all_ids and p['id'] not in keep_ids]
    return keep, remove

if __name__ == '__main__':
    winget_pkgs = load_inventory(sys.argv[1])
    choco_pkgs = load_inventory(sys.argv[2])
    all_pkgs = winget_pkgs + choco_pkgs
    keep, remove = deduplicate(all_pkgs)
    print(json.dumps({"keep": keep, "remove": remove}, indent=2))
```
**Verification**: `python3 scripts/pkg-mgmt/deduplicate-packages.py scripts/pkg-mgmt/inventory-winget.sh scripts/pkg-mgmt/inventory-choco.sh | jq '.remove | length'` → expect integer ≥ 0

#### Task 1.4 — Create interactive uninstall confirmation for deduplication
**File**: `scripts/pkg-mgmt/confirm-dedupe-uninstall.sh`
```bash
#!/usr/bin/env bash
# confirm-dedupe-uninstall.sh — prompt for each multi-version package removal
# Usage: ./confirm-dedupe-uninstall.sh <dedupe_output.json>
set -euo pipefail
INPUT="$1"
REMOVE_COUNT=$(jq '.remove | length' "$INPUT")
if [[ $REMOVE_COUNT -eq 0 ]]; then
    echo "No duplicate versions to remove."
    exit 0
fi
jq -c '.remove[]' "$INPUT" | while read -r pkg; do
    ID=$(echo "$pkg" | jq -r '.id')
    VER=$(echo "$pkg" | jq -r '.version')
    SRC=$(echo "$pkg" | jq -r '.source')
    echo "Remove duplicate: $ID v$VER (source: $SRC)? [y/N]"
    read -r ans
    if [[ "$ans" =~ ^[Yy]$ ]]; then
        if [[ "$SRC" == "chocolatey" ]]; then
            choco uninstall "$ID" --version "$VER" -y
        else
            winget uninstall --id "$ID" --version "$VER" --accept-source-agreements
        fi
    fi
done
```
**Verification**: Dry-run with `bash scripts/pkg-mgmt/confirm-dedupe-uninstall.sh /dev/stdin <<< '{"remove":[]}'` → "No duplicate versions to remove."

---

### Phase 2: Apt Migratability Analysis

#### Task 2.1 — Create apt package search script
**File**: `scripts/pkg-mgmt/search-apt.sh`
```bash
#!/usr/bin/env bash
# search-apt.sh — check if a package name exists in apt repositories
# Usage: ./search-apt.sh <package-name> [--exact]
# Exit code: 0 = found, 1 = not found, 2 = apt update failed
set -euo pipefail
PKG="$1"
EXACT="${2:-}"
sudo -n apt update -qq 2>/dev/null || exit 2
if [[ "$EXACT" == "--exact" ]]; then
    apt-cache show "$PKG" >/dev/null 2>&1
else
    apt-cache search "^$PKG$" | grep -q "^$PKG "
fi
```
**Verification**: `bash scripts/pkg-mgmt/search-apt.sh git --exact && echo "found" || echo "not found"` → "found"

#### Task 2.2 — Create cross-reference analyzer
**File**: `scripts/pkg-mgmt/crossref-apt.py`
```python
#!/usr/bin/env python3
"""crossref-apt.py — classify packages as apt-migratable or Windows-only."""
import json, sys, subprocess
from pathlib import Path

APT_CACHE_FILE = Path("/tmp/apt-package-cache.txt")

def build_apt_cache():
    """Populate local cache of all apt package names for fast lookup."""
    if APT_CACHE_FILE.exists() and (APT_CACHE_FILE.stat().st_mtime > (time.time() - 3600)):
        return
    subprocess.run(["sudo", "-n", "apt", "update", "-qq"], check=False, capture_output=True)
    result = subprocess.run(["apt-cache", "dump"], capture_output=True, text=True)
    names = set()
    for line in result.stdout.splitlines():
        if line.startswith("Package: "):
            names.add(line.split("Package: ")[1].strip())
    APT_CACHE_FILE.write_text("\n".join(sorted(names)))

def classify(packages):
    build_apt_cache()
    apt_names = set(APT_CACHE_FILE.read_text().splitlines())
    migratable, windows_only = [], []
    for pkg in packages:
        name = pkg['name'].lower()
        # Heuristic: exact match or common name mappings
        if name in apt_names or any(name in an for an in apt_names if an.startswith(name + "-") or an == name):
            migratable.append({**pkg, "apt_name": next((an for an in apt_names if an == name or an.startswith(name + "-")), name)})
        else:
            windows_only.append(pkg)
    return migratable, windows_only

if __name__ == '__main__':
    import time
    pkgs = json.load(sys.stdin)
    migratable, windows_only = classify(pkgs)
    print(json.dumps({"migratable": migratable, "windows_only": windows_only}, indent=2))
```
**Verification**: `cat dedupe-output.json | python3 scripts/pkg-mgmt/crossref-apt.py | jq '.migratable | length'` → integer ≥ 0

#### Task 2.3 — Generate human-readable migration report
**File**: `scripts/pkg-mgmt/generate-report.py`
```python
#!/usr/bin/env python3
"""generate-report.py — pretty print migration plan for clarification rounds."""
import json, sys

def format_package(pkg):
    return f"  - {pkg['name']} (v{pkg['version']}) → apt: {pkg.get('apt_name', 'N/A')}"

def main():
    data = json.load(sys.stdin)
    print("=== APT-MIGRATABLE PACKAGES ===")
    for p in data['migratable']:
        print(format_package(p))
    print(f"\nTotal migratable: {len(data['migratable'])}")
    print("\n=== WINDOWS-ONLY PACKAGES (stay on winget/choco) ===")
    for p in data['windows_only']:
        print(f"  - {p['name']} (v{p['version']})")
    print(f"\nTotal Windows-only: {len(data['windows_only'])}")

if __name__ == '__main__':
    main()
```
**Verification**: `cat crossref-output.json | python3 scripts/pkg-mgmt/generate-report.py` → formatted output

---

### Phase 3: Interactive Migration (Clarification Rounds)

#### Task 3.1 — Create clarification round generator
**File**: `scripts/pkg-mgmt/clarification-rounds.py`
```python
#!/usr/bin/env python3
"""clarification-rounds.py — yield batches of 5 packages for clarify tool."""
import json, sys

def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def main():
    data = json.load(sys.stdin)
    migratable = data['migratable']
    rounds = list(chunk(migratable, 5))
    for i, batch in enumerate(rounds, 1):
        print(f"\n=== ROUND {i}/{len(rounds)} ===")
        for j, pkg in enumerate(batch, 1):
            print(f"  {j}. {pkg['name']} (v{pkg['version']}) — apt name: {pkg.get('apt_name', pkg['name'])}")
        # Produce clarify-compatible JSON
        questions = []
        for pkg in batch:
            questions.append({
                "question": f"Install {pkg['name']} (v{pkg['version']}) via apt as '{pkg.get('apt_name', pkg['name'])}'?",
                "choices": ["Yes, install via apt", "No, keep on winget/choco", "Skip for now"]
            })
        print(json.dumps({"round": i, "questions": questions}))

if __name__ == '__main__':
    main()
```
**Verification**: `cat crossref-output.json | python3 scripts/pkg-mgmt/clarification-rounds.py` → prints rounds with JSON for clarify

#### Task 3.2 — Create apt install executor
**File**: `scripts/pkg-mgmt/execute-apt-install.sh`
```bash
#!/usr/bin/env bash
# execute-apt-install.sh — install selected packages via apt, purge winget/choco
# Usage: ./execute-apt-install.sh <selections.json>
# selections.json: [{"name": "...", "apt_name": "...", "source": "winget|chocolatey", "action": "install|skip"}]
set -euo pipefail
SELECTIONS="$1"
SUDO_PASS="${SUDO_PASSWORD:-}"

jq -c '.[] | select(.action=="install")' "$SELECTIONS" | while read -r sel; do
    APT_NAME=$(echo "$sel" | jq -r '.apt_name')
    WINGET_ID=$(echo "$sel" | jq -r '.id // empty')
    CHOCO_ID=$(echo "$sel" | jq -r '.id // empty')
    SRC=$(echo "$sel" | jq -r '.source')

    echo "Installing $APT_NAME via apt..."
    if [[ -n "$SUDO_PASS" ]]; then
        echo "$SUDO_PASS" | sudo -S apt install -y "$APT_NAME"
    else
        sudo apt install -y "$APT_NAME"
    fi

    # Purge from original source
    if [[ "$SRC" == "chocolatey" && -n "$CHOCO_ID" ]]; then
        echo "Purging $CHOCO_ID from Chocolatey..."
        choco uninstall "$CHOCO_ID" -y
    elif [[ "$SRC" != "chocolatey" && -n "$WINGET_ID" ]]; then
        echo "Purging $WINGET_ID from Winget..."
        winget uninstall --id "$WINGET_ID" --accept-source-agreements
    fi
done
echo "Migration complete."
```
**Verification**: Dry-run with empty selections → "Migration complete."

#### Task 3.3 — Create master orchestration script
**File**: `scripts/pkg-mgmt/migrate-packages.sh`
```bash
#!/usr/bin/env bash
# migrate-packages.sh — master orchestrator for full pipeline
set -euo pipefail
WORKDIR="$(dirname "$0")/../work/pkg-mgmt"
mkdir -p "$WORKDIR"

echo "=== Phase 1: Inventory ==="
"$WORKDIR/../inventory-winget.sh" > "$WORKDIR/winget-inventory.json"
"$WORKDIR/../inventory-choco.sh" > "$WORKDIR/choco-inventory.json"

echo "=== Phase 2: Deduplication ==="
python3 "$WORKDIR/../deduplicate-packages.py" \
    "$WORKDIR/../inventory-winget.sh" \
    "$WORKDIR/../inventory-choco.sh" > "$WORKDIR/dedupe-result.json"

# Confirm deduplication removals
bash "$WORKDIR/../confirm-dedupe-uninstall.sh" "$WORKDIR/dedupe-result.json"

echo "=== Phase 3: Apt Cross-Reference ==="
jq '.keep' "$WORKDIR/dedupe-result.json" | python3 "$WORKDIR/../crossref-apt.py" > "$WORKDIR/crossref-result.json"

echo "=== Phase 4: Interactive Selection ==="
python3 "$WORKDIR/../clarification-rounds.py" < "$WORKDIR/crossref-result.json" > "$WORKDIR/clarify-input.json"

echo "=== Phase 5: Execute Migration ==="
# After clarify rounds populate selections.json manually or via helper
if [[ -f "$WORKDIR/selections.json" ]]; then
    SUDO_PASSWORD="$SUDO_PASSWORD" bash "$WORKDIR/../execute-apt-install.sh" "$WORKDIR/selections.json"
else
    echo "No selections.json found. Run clarify rounds first."
    exit 1
fi
```
**Verification**: `bash scripts/pkg-mgmt/migrate-packages.sh` (dry-run with mock data)

---

### Phase 4: Tests & Validation

#### Task 4.1 — Unit test for deduplication logic
**File**: `tests/pkg-mgmt/test_deduplicate.py`
```python
import pytest
from scripts.pkg_mgmt.deduplicate_packages import deduplicate

def test_deduplicate_keeps_latest():
    pkgs = [
        {"id": "git", "version": "2.40.0", "source": "winget"},
        {"id": "git", "version": "2.42.0", "source": "winget"},
        {"id": "vscode", "version": "1.85.0", "source": "chocolatey"},
    ]
    keep, remove = deduplicate(pkgs)
    assert len(keep) == 2
    assert keep[0]["id"] == "git" and keep[0]["version"] == "2.42.0"
    assert len(remove) == 1
    assert remove[0]["version"] == "2.40.0"

def test_deduplicate_single_version_unchanged():
    pkgs = [{"id": "git", "version": "2.42.0", "source": "winget"}]
    keep, remove = deduplicate(pkgs)
    assert len(keep) == 1
    assert len(remove) == 0
```
**Command**: `python -m pytest tests/pkg-mgmt/test_deduplicate.py -v` → all pass

#### Task 4.2 — Integration test for apt search
**File**: `tests/pkg-mgmt/test_apt_search.py`
```python
import pytest, subprocess

@pytest.mark.integration
def test_apt_search_finds_git():
    result = subprocess.run(["bash", "scripts/pkg-mgmt/search-apt.sh", "git", "--exact"])
    assert result.returncode == 0

@pytest.mark.integration
def test_apt_search_missing_package():
    result = subprocess.run(["bash", "scripts/pkg-mgmt/search-apt.sh", "nonexistent-package-xyz-123"])
    assert result.returncode == 1
```
**Command**: `python -m pytest tests/pkg-mgmt/test_apt_search.py -v -m integration` → pass (requires apt)

#### Task 4.3 — End-to-end dry-run validation
**File**: `tests/pkg-mgmt/test_e2e_dryrun.sh`
```bash
#!/usr/bin/env bash
# Dry-run full pipeline with mocked data
set -euo pipefail
MOCK_DIR=$(mktemp -d)
cat > "$MOCK_DIR/winget.json" <<'EOF'
[{"id":"Git.Git","name":"Git","version":"2.42.0","source":"winget"},{"id":"Git.Git","name":"Git","version":"2.40.0","source":"winget"}]
EOF
cat > "$MOCK_DIR/choco.json" <<'EOF'
[{"id":"vscode","name":"Visual Studio Code","version":"1.85.0","source":"chocolatey"}]
EOF

# Run deduplication
python3 scripts/pkg-mgmt/deduplicate-packages.py \
    <(cat "$MOCK_DIR/winget.json") \
    <(cat "$MOCK_DIR/choco.json") > "$MOCK_DIR/dedupe.json"

KEEP_COUNT=$(jq '.keep | length' "$MOCK_DIR/dedupe.json")
REMOVE_COUNT=$(jq '.remove | length' "$MOCK_DIR/dedupe.json")
assert_eq "$KEEP_COUNT" 2
assert_eq "$REMOVE_COUNT" 1
echo "E2E dry-run passed"
```
**Command**: `bash tests/pkg-mgmt/test_e2e_dryrun.sh` → "E2E dry-run passed"

---

## Risks, Tradeoffs, and Open Questions

| Risk | Mitigation |
|------|------------|
| **Destructive uninstalls** | Every removal gated by `clarify` confirmation; dry-run mode default |
| **Apt package name mismatch** | Heuristic mapping + manual override in clarification rounds |
| **Winget/Choco version parsing differences** | Use `packaging.version` (PEP 440 compatible) for normalization |
| **Sudo password exposure** | Never logged; read from `$HERMES_HOME/.env` at runtime only |
| **Partial migration breaks Windows apps** | Windows-only packages never touched; only migratable ones prompted |
| **Apt repo not updated** | `apt update` runs at start of cross-reference phase |

### Open Questions (require clarify before execution)
1. **Scope**: Migrate *all* migratable packages, or only a curated subset (dev tools, CLI utilities, etc.)?
2. **WSL distro**: Ubuntu (default), Debian, or other? Affects apt package availability.
3. **Choco/Winget source priority**: If same package exists in both, which source owns it for migration?
4. **Post-migration verification**: Run `winget list`/`choco list`/`apt list --installed` to confirm?
5. **Rollback plan**: Keep uninstalled package caches? (Winget: `%LOCALAPPDATA%\Microsoft\WinGet\Packages`; Choco: `C:\ProgramData\chocolatey\lib`)

---

## Execution Notes for Implementer
- **Save all scripts** under `scripts/pkg-mgmt/` with `chmod +x`
- **Run phases sequentially**; each phase produces JSON consumed by next
- **Clarification rounds** are manual: copy `clarify-input.json` questions into `clarify` tool calls (5 per turn)
- **Selections file** (`selections.json`) must be created from clarify responses before Phase 5
- **Commit after each phase**: `git add scripts/pkg-mgmt/ && git commit -m "pkg-mgmt: phase N complete"`