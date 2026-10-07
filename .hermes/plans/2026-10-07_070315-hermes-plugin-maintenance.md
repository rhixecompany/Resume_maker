# Hermes plugin inventory, triage, update, enable, and evolve

- Plan ID: `2026-10-07_070315-hermes-plugin-maintenance`
- Status: Ready with an execution gate for the unsupported `--force` flag
- Owner/profile: default / Elena Vasquez
- Workspace: `/mnt/c/Users/Alexa/playgrounds/Resume_maker`
- Plan file: `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance.md`
- Hermes home: `/home/alexa/.hermes` at plan-authoring time
- Scope: Hermes plugin state and runtime only; no application source changes
- Source spec: None; this is an operational maintenance run, not a code feature

## Rules

- Execute from `/mnt/c/Users/Alexa/playgrounds/Resume_maker` and resolve the active Hermes home with `hermes config path`; do not hardcode another profile's home.
- Never read, print, archive, or modify `.env`, `auth.json`, provider keys, or other credential files.
- Use `hermes plugins list --json --no-bundled` as the source of truth immediately before mutation; never hardcode the current plugin names.
- Invoke each plugin update with an argument array or a quoted name; never construct an unquoted shell command from plugin names.
- Preserve per-plugin stdout, stderr, and exit status. Continue through the batch, but fail the final gate if any required operation failed.
- Do not pass `--allow-live-gateway`. If the gateway is active or its state is unknown, stop before updating.
- Use `--no-allow-tool-override` when enabling. Never grant a plugin permission to replace built-in tools without a separate explicit approval.
- `/evolve now` is the final state-changing action. Run it only after every update and enable gate passes.
- This is not a code change: do not create fake tests or commits. Use command receipts, state comparisons, and the plugin archive for rollback. Do not commit generated evidence or archives.

## Goal

Inventory and triage every non-bundled installed Hermes plugin, attempt the requested update and enable operation for each plugin with auditable results, and finally run `/evolve now` only after the resulting plugin state is verified.

## Current context / assumptions

- Read-only inspection at `2026-10-07_070315 WAT` found 82 non-bundled plugins: 73 enabled and 9 disabled.
- Source split at inspection time: 36 catalog plugins, 28 git plugins, and 18 user plugins; 6 reported an `unknown` version.
- Initially disabled names were: `agent-log`, `billing`, `compartment`, `cronalytics`, `hermes-structured-aux-models`, `jev-agent-router`, `jev-mcp-router`, `jev-memory-selector`, and `jev-model-router`.
- `hermes plugins update --help` currently accepts a plugin name and `--allow-live-gateway`; it does not expose `--force`. Therefore the literal requested command `hermes plugins update NAME --force` is invalid in the installed CLI.
- The default compatibility decision in this plan is to use the supported `hermes plugins update NAME` operation, but only through an explicit `ALLOW_PLAIN_UPDATE=1` waiver in the batch command. If literal `--force` semantics are mandatory, stop at the compatibility gate instead of silently substituting.
- `hermes plugins enable` supports `--no-allow-tool-override`; the plan uses it to avoid privilege escalation during bulk enablement.
- `hermes-evolve` is installed and enabled at version 1.3.0. Its local implementation documents that `/evolve now` reloads plugin modules, re-discovers/re-registers plugins, clears tool caches, and invalidates stored system-prompt snapshots in the shared Hermes state database.
- The gateway was reported stopped during planning, but this must be rechecked immediately before execution. The status output also reported an outdated service definition; do not repair or restart the gateway as an unrequested side effect.

## Architecture / proposed approach

Use a deterministic, data-driven maintenance pipeline: capture a JSON inventory, capability/doctor/update-check receipts, and a plugin-only rollback archive; then run update followed by enable for every name returned by the fresh inventory. Validate the complete batch by comparing names and statuses, and run the interactive `/evolve now` command as the final state-changing step so loaded modules and cached prompts reflect the verified plugin set.

## Subgoals

- SG-001: Establish the current CLI contract, active Hermes home, and gateway safety gate.
- SG-002: Produce a complete, machine-checkable inventory and triage receipt for all installed plugins.
- SG-003: Preserve enough non-secret state to restore plugin files and original enabled/disabled status.
- SG-004: Attempt update then enable for every inventoried plugin without suppressing failures.
- SG-005: Verify all plugins are enabled and only then run `/evolve now`.

## Steps

1. Run the preflight contract and gateway checks.
2. Capture baseline inventory, capabilities, update availability, and doctor results.
3. Review triage exceptions and accept or reject the `--force` compatibility waiver.
4. Archive only plugin files and record the original status map; leave credentials untouched.
5. Run the per-plugin update→enable executor with explicit no-tool-override behavior.
6. Re-list and validate names, statuses, receipts, and post-update health.
7. In an interactive Hermes session, run `/evolve status`, then `/evolve now`.
8. Preserve final receipts; if a gate fails, stop and use the rollback procedure rather than claiming completion.

## Todos

- [ ] TASK-001: Preflight CLI, profile, and gateway state.
- [ ] TASK-002: Capture baseline inventory and triage receipts.
- [ ] TASK-003: Resolve the missing `--force` flag and review exceptions.
- [ ] TASK-004: Create a non-secret plugin rollback archive.
- [ ] TASK-005: Execute update then enable for all current plugin names.
- [ ] TASK-006: Verify the complete batch and post-update health.
- [ ] TASK-007: Run `/evolve now` last in an interactive Hermes session.
- [ ] TASK-008: Record final evidence or execute rollback.

## Phases

### Phase 1 — Preflight and inventory

- Entry gate: the operator is in the workspace and has an active Hermes CLI.
- Exit gate: the current plugin list is valid JSON, the gateway is confirmed stopped, and the CLI flag mismatch is recorded.

### Phase 2 — Triage and preservation

- Entry gate: baseline inventory exists and has a unique name for every plugin.
- Exit gate: capabilities, update-check, and doctor results are recorded; compatibility and risk exceptions have an explicit decision; plugin archive exists.

### Phase 3 — Mutation

- Entry gate: Phase 2 exit gate passes and `ALLOW_PLAIN_UPDATE=1` is intentionally accepted if the installed CLI still lacks `--force`.
- Exit gate: one update receipt and one enable receipt exist for every baseline plugin.

### Phase 4 — Runtime evolution and closeout

- Entry gate: all plugins are enabled, enable receipts have exit code 0, and no unresolved hard failure remains.
- Exit gate: `/evolve now` returns its success summary with no reload/rediscovery/cache/prompt warning or error, and final inventory evidence is saved.

## Tasks

### TASK-001 — Establish execution context and safety gates

- Owner/profile: default / Elena Vasquez
- Timebox: 2–5 minutes
- Paths: `/mnt/c/Users/Alexa/playgrounds/Resume_maker`; `$HERMES_HOME` resolved from `hermes config path`
- Depends on: None
- Action: Run the following read-only commands from the workspace:

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
printf 'workspace=%s\n' "$PWD"
printf 'hermes_config=%s\n' "$(hermes config path)"
hermes --version
hermes plugins update --help
hermes plugins enable --help
hermes gateway status
```

- Expected result: `hermes config path` resolves to the active profile; update help confirms whether `--force` exists; enable help exposes `--no-allow-tool-override`; gateway status is explicitly stopped/inactive. A timeout, active gateway, or ambiguous gateway state is a hard stop.
- Output: preflight details recorded in the execution log, not in credentials.
- Acceptance test: `hermes plugins update --help` is inspected and `hermes gateway status` has a known safe result.
- Rollback: None; this task is read-only.

### TASK-002 — Capture and validate the complete baseline triage

- Owner/profile: default / Elena Vasquez
- Timebox: 5–15 minutes, depending on plugin count and doctor checks
- Paths:
  - Evidence directory: `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence`
  - Baseline inventory: `.../plugins-before.json`
  - Capabilities: `.../capabilities-before.txt`
  - Update check: `.../check-updates-before.json` plus `.../check-updates-before.stderr`
  - Doctor receipt: `.../doctor-before.jsonl`
- Depends on: TASK-001
- Action: Create the evidence directory and capture all inventory/triage data. The update check is read-only; preserve its nonzero result if the network is unavailable.

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
HERMES_CONFIG="$(hermes config path)"
HERMES_HOME="$(dirname "$HERMES_CONFIG")"
EVIDENCE_DIR="$PWD/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence"
umask 077
mkdir -p "$EVIDENCE_DIR/rollback"
hermes plugins list --json --no-bundled > "$EVIDENCE_DIR/plugins-before.json"
hermes plugins capabilities > "$EVIDENCE_DIR/capabilities-before.txt"
set +e
hermes plugins check-updates --json > "$EVIDENCE_DIR/check-updates-before.json" 2> "$EVIDENCE_DIR/check-updates-before.stderr"
CHECK_RC=$?
set -e
printf '%s\n' "$CHECK_RC" > "$EVIDENCE_DIR/check-updates-before.exit-code"
python3 - "$EVIDENCE_DIR/plugins-before.json" "$EVIDENCE_DIR/doctor-before.jsonl" <<'PY'
import json
import subprocess
import sys
from pathlib import Path

inventory_path = Path(sys.argv[1])
receipt_path = Path(sys.argv[2])
plugins = json.loads(inventory_path.read_text())
if not isinstance(plugins, list) or not plugins:
    raise SystemExit("baseline inventory is not a non-empty JSON list")
names = [item.get("name") for item in plugins]
if any(not isinstance(name, str) or not name for name in names):
    raise SystemExit("baseline inventory contains a missing or invalid plugin name")
if len(names) != len(set(names)):
    raise SystemExit("baseline inventory contains duplicate plugin names")

with receipt_path.open("w", encoding="utf-8") as output:
    for index, name in enumerate(names, start=1):
        result = subprocess.run(
            ["hermes", "plugins", "doctor", "--ci", name],
            capture_output=True,
            text=True,
            check=False,
        )
        output.write(json.dumps({
            "name": name,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }, ensure_ascii=False) + "\n")
        print(f"doctor {index}/{len(names)} {name} rc={result.returncode}")
print(f"doctor_records={len(names)}")
PY
```

- Expected result: `plugins-before.json` parses as a non-empty list with unique names; the doctor loop prints one line per plugin and ends with `doctor_records=82` for the observed baseline. A doctor failure is evidence for triage, not a fabricated success. Do not paste any credential-like output into the plan or chat.
- Output: complete baseline and triage receipts under the evidence directory.
- Acceptance test:

```bash
python3 - "$EVIDENCE_DIR/plugins-before.json" "$EVIDENCE_DIR/doctor-before.jsonl" <<'PY'
import json
import sys
from pathlib import Path

inventory = json.loads(Path(sys.argv[1]).read_text())
records = [json.loads(line) for line in Path(sys.argv[2]).read_text().splitlines() if line.strip()]
expected = [item["name"] for item in inventory]
actual = [item["name"] for item in records]
if actual != expected:
    raise SystemExit("doctor receipt order/names do not exactly match baseline inventory")
print(f"baseline_plugins={len(expected)} doctor_records={len(records)}")
print("status_counts=" + str({status: sum(item["status"] == status for item in inventory) for status in sorted({item["status"] for item in inventory})}))
print("triage=complete")
PY
```

- Rollback: Remove only the evidence directory if the operator explicitly wants cleanup; it contains no credentials by design.

### TASK-003 — Review compatibility and triage exceptions before mutation

- Owner/profile: default / Elena Vasquez with Marcus Chen security lens
- Timebox: 3–5 minutes
- Paths: `.../plugins-before.json`, `.../capabilities-before.txt`, `.../check-updates-before.*`, `.../doctor-before.jsonl`
- Depends on: TASK-002
- Action: Apply these gates:
  1. If update help contains `--force`, the executor must use `hermes plugins update NAME --force`.
  2. If update help does not contain `--force` (the observed current state), the operator must explicitly accept the supported plain update by setting `ALLOW_PLAIN_UPDATE=1`; otherwise stop and ask for a CLI upgrade or instruction change.
  3. Do not grant tool overrides. Any plugin that cannot enable with `--no-allow-tool-override` remains a hard failure and blocks `/evolve now`.
  4. Review all doctor failures, `unknown` versions, repaired-plugin descriptions, and user-source plugins with no update provenance. They may be attempted, but an update failure must remain visible and blocks the final gate.
  5. If the gateway is active or unknown, stop. Do not add `--allow-live-gateway` as a workaround.
- Expected result: the execution decision is explicit in the log: either `force_flag=supported` or `force_flag=absent; plain_update_waiver=accepted`, plus the list of triage exceptions.
- Output: an operator decision record in `.../triage-decision.txt` containing no secrets.
- Acceptance test: no mutation command is run until all five gates are resolved.
- Rollback: None; this is a decision gate.

### TASK-004 — Preserve plugin files and original status without touching credentials

- Owner/profile: default / Elena Vasquez
- Timebox: 2–5 minutes
- Paths:
  - Archive: `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/rollback/plugins-before.tgz`
  - Source directory: `$HERMES_HOME/plugins`
  - Status source: `.../plugins-before.json`
- Depends on: TASK-003
- Action: Resolve `HERMES_HOME` from `hermes config path`, archive only the plugin directory, and set restrictive permissions. Do not use `hermes backup --quick` because it includes `.env` and auth state, which are outside this task.

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
HERMES_HOME="$(dirname "$(hermes config path)")"
EVIDENCE_DIR="$PWD/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence"
umask 077
test -d "$HERMES_HOME/plugins"
tar -C "$HERMES_HOME" -czf "$EVIDENCE_DIR/rollback/plugins-before.tgz" plugins
chmod 600 "$EVIDENCE_DIR/rollback/plugins-before.tgz"
python3 - "$EVIDENCE_DIR/rollback/plugins-before.tgz" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
if not path.is_file() or path.stat().st_size == 0:
    raise SystemExit("plugin rollback archive is missing or empty")
print(f"rollback_archive_bytes={path.stat().st_size}")
PY
```

- Expected result: a non-empty mode-600 archive exists; `.env`, `auth.json`, and other credential paths are not inputs to the archive command.
- Output: plugin-only rollback archive.
- Acceptance test: `test -s "$EVIDENCE_DIR/rollback/plugins-before.tgz"` succeeds and the baseline JSON remains unchanged.
- Rollback: Delete the archive only after the run is accepted; it is the rollback source during the run.

### TASK-005 — Update then enable every inventoried plugin

- Owner/profile: default / Elena Vasquez
- Timebox: 10–30 minutes; allow network latency and per-plugin failures
- Paths:
  - Input: `.../plugins-before.json`
  - Receipt: `.../update-enable.jsonl`
  - Failure log: `.../update-enable.stderr`
- Depends on: TASK-004
- Action: Run one isolated subprocess for each baseline name. The executor always runs update first and enable second, continues after an individual failure, uses the literal `--force` only when the live CLI supports it, and otherwise requires the explicit plain-update waiver. Enablement is always attempted with `--no-allow-tool-override`.

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
EVIDENCE_DIR="$PWD/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence"
ALLOW_PLAIN_UPDATE=1 python3 - "$EVIDENCE_DIR/plugins-before.json" "$EVIDENCE_DIR/update-enable.jsonl" 2> "$EVIDENCE_DIR/update-enable.stderr" <<'PY'
import json
import os
import subprocess
import sys
from pathlib import Path

inventory_path = Path(sys.argv[1])
receipt_path = Path(sys.argv[2])
plugins = json.loads(inventory_path.read_text())
if not isinstance(plugins, list) or not plugins:
    raise SystemExit("baseline inventory is empty or invalid")

help_result = subprocess.run(
    ["hermes", "plugins", "update", "--help"],
    capture_output=True,
    text=True,
    check=False,
)
help_text = help_result.stdout + "\n" + help_result.stderr
force_supported = "--force" in help_text
if not force_supported and os.environ.get("ALLOW_PLAIN_UPDATE") != "1":
    raise SystemExit(
        "current Hermes has no --force flag; set ALLOW_PLAIN_UPDATE=1 only after accepting the compatibility waiver"
    )

records = []
with receipt_path.open("w", encoding="utf-8") as output:
    for index, item in enumerate(plugins, start=1):
        name = item["name"]
        update_command = ["hermes", "plugins", "update", name]
        if force_supported:
            update_command.append("--force")
        update = subprocess.run(
            update_command,
            capture_output=True,
            text=True,
            check=False,
        )
        enable_command = [
            "hermes", "plugins", "enable", "--no-allow-tool-override", name
        ]
        enable = subprocess.run(
            enable_command,
            capture_output=True,
            text=True,
            check=False,
        )
        record = {
            "name": name,
            "update_command": update_command,
            "update_returncode": update.returncode,
            "update_stdout": update.stdout,
            "update_stderr": update.stderr,
            "enable_command": enable_command,
            "enable_returncode": enable.returncode,
            "enable_stdout": enable.stdout,
            "enable_stderr": enable.stderr,
        }
        output.write(json.dumps(record, ensure_ascii=False) + "\n")
        print(
            f"{index}/{len(plugins)} {name} "
            f"update_rc={update.returncode} enable_rc={enable.returncode}"
        )
        records.append(record)

update_failures = sum(item["update_returncode"] != 0 for item in records)
enable_failures = sum(item["enable_returncode"] != 0 for item in records)
print(
    f"processed={len(records)} update_failures={update_failures} "
    f"enable_failures={enable_failures} force_supported={force_supported}"
)
if update_failures or enable_failures:
    raise SystemExit(1)
PY
```

- Expected result: one receipt per baseline plugin, with update executed before enable for the same name. For the observed baseline, the final summary must report `processed=82`; success requires both failure counts to be zero. A nonzero result is an honest blocker, not permission to run `/evolve now`.
- Output: `update-enable.jsonl`, containing command forms, exit codes, and captured output for every plugin.
- Acceptance test: the command exits 0 and the receipt contains exactly 82 unique names matching `plugins-before.json`; otherwise stop at TASK-005.
- Rollback: Do not rerun blindly. Inspect failed names, restore the plugin archive from TASK-004 if code was partially updated, and restore status using TASK-008.

### TASK-006 — Verify final plugin state and post-update health

- Owner/profile: default / Elena Vasquez
- Timebox: 5–15 minutes
- Paths:
  - Final inventory: `.../plugins-after.json`
  - Capabilities: `.../capabilities-after.txt`
  - Doctor receipt: `.../doctor-after.jsonl`
- Depends on: TASK-005
- Action: Re-list the installed plugins, re-run capabilities, and re-run doctor checks for the same names. Compare the result receipt with the final inventory.

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
EVIDENCE_DIR="$PWD/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence"
hermes plugins list --json --no-bundled > "$EVIDENCE_DIR/plugins-after.json"
hermes plugins capabilities > "$EVIDENCE_DIR/capabilities-after.txt"
python3 - "$EVIDENCE_DIR/plugins-after.json" "$EVIDENCE_DIR/doctor-after.jsonl" <<'PY'
import json
import subprocess
import sys
from pathlib import Path

inventory_path = Path(sys.argv[1])
receipt_path = Path(sys.argv[2])
plugins = json.loads(inventory_path.read_text())
if not isinstance(plugins, list) or not plugins:
    raise SystemExit("final inventory is not a non-empty JSON list")

with receipt_path.open("w", encoding="utf-8") as output:
    for item in plugins:
        name = item["name"]
        result = subprocess.run(
            ["hermes", "plugins", "doctor", "--ci", name],
            capture_output=True,
            text=True,
            check=False,
        )
        output.write(json.dumps({
            "name": name,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }, ensure_ascii=False) + "\n")
print(f"post_update_doctor_records={len(plugins)}")
PY
python3 - "$EVIDENCE_DIR/plugins-before.json" "$EVIDENCE_DIR/plugins-after.json" "$EVIDENCE_DIR/update-enable.jsonl" "$EVIDENCE_DIR/doctor-after.jsonl" <<'PY'
import json
import sys
from pathlib import Path

before = json.loads(Path(sys.argv[1]).read_text())
after = json.loads(Path(sys.argv[2]).read_text())
operations = [json.loads(line) for line in Path(sys.argv[3]).read_text().splitlines() if line.strip()]
doctor = [json.loads(line) for line in Path(sys.argv[4]).read_text().splitlines() if line.strip()]

before_names = [item["name"] for item in before]
after_names = [item["name"] for item in after]
operation_names = [item["name"] for item in operations]
if sorted(before_names) != sorted(after_names):
    raise SystemExit("plugin name set changed during maintenance")
if operation_names != before_names:
    raise SystemExit("operation receipt does not exactly match baseline order")
if len(doctor) != len(after):
    raise SystemExit("post-update doctor receipt count mismatch")
not_enabled = [item["name"] for item in after if item["status"] != "enabled"]
update_failed = [item["name"] for item in operations if item["update_returncode"] != 0]
enable_failed = [item["name"] for item in operations if item["enable_returncode"] != 0]
doctor_failed = [item["name"] for item in doctor if item["returncode"] != 0]
print(f"plugins_after={len(after)}")
print(f"not_enabled={len(not_enabled)} update_failed={len(update_failed)} enable_failed={len(enable_failed)} doctor_failed={len(doctor_failed)}")
if not_enabled or update_failed or enable_failed or doctor_failed:
    raise SystemExit(1)
print("final_plugin_gate=pass")
PY
```

- Expected result: the final name set equals the baseline name set, every plugin status is `enabled`, update and enable exit codes are all zero, and post-update doctor checks are all zero. The exact plugin count is read from the inventory; the observed baseline expects 82.
- Output: final inventory and post-update health receipts.
- Acceptance test: the final verifier prints `final_plugin_gate=pass` and exits 0.
- Rollback: If this gate fails, do not start an interactive evolve command. Use TASK-008.

### TASK-007 — Run `/evolve now` as the final state-changing action

- Owner/profile: default / Elena Vasquez
- Timebox: 2–5 minutes
- Paths: Hermes shared state database under `$HERMES_HOME`; no application files
- Depends on: TASK-006
- Action: Confirm `hermes-evolve` is enabled, then use an interactive Hermes CLI/TUI session. Do not type the slash command into a normal shell and do not assume `hermes chat -q` routes slash commands correctly.

```text
# In an already-running interactive Hermes session, or after starting `hermes --cli`:
/evolve status
/evolve now
```

- Expected `/evolve status`: a `## Evolve — Status` response listing loaded plugin modules and the number of enabled plugins to be re-registered.
- Expected `/evolve now`: a `## Evolve — <N> module(s) reloaded` response, a `plugins re-discovered + re-registered` line, cache/registry refresh lines, and a final line matching `✅ <N> stored system-prompt snapshot(s) will rebuild when their sessions next run or resume.` The runtime-derived number `N` must not be hardcoded.
- Failure rule: any `❌` reload line, plugin rediscovery warning, cache warning, prompt-storage warning, or missing final success line blocks completion. `/evolve now` invalidates stored prompts for all active sessions, so run it only after TASK-006 passes.
- Output: the interactive command response copied into `.../evolve-output.txt` without secrets.
- Acceptance test: `/evolve now` returns the documented success summary with no warning/error lines. The command itself is the last state-changing operation in the run.
- Rollback: `/evolve now` does not provide a reverse operation; restored plugin files/status require a fresh Hermes process, and prompt snapshots will rebuild on the next session turn.

### TASK-008 — Close out evidence or restore the pre-change state

- Owner/profile: default / Elena Vasquez
- Timebox: 5–10 minutes
- Paths: evidence directory and `$HERMES_HOME/plugins`
- Depends on: TASK-005, TASK-006, TASK-007
- Action on success: keep the receipts temporarily, confirm no credential files were touched, and report the final counts and any warnings. Do not commit the evidence/archive unless separately requested.
- Action on failure: stop, preserve the failing receipt, and restore plugin code/status only after all Hermes processes that loaded the changed plugins are closed.

```bash
set -Eeuo pipefail
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
HERMES_HOME="$(dirname "$(hermes config path)")"
EVIDENCE_DIR="$PWD/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence"
# Use only after stopping Hermes processes that loaded the changed plugins.
tar -xzf "$EVIDENCE_DIR/rollback/plugins-before.tgz" -C "$HERMES_HOME"
python3 - "$EVIDENCE_DIR/plugins-before.json" <<'PY'
import json
import subprocess
import sys
from pathlib import Path

baseline = json.loads(Path(sys.argv[1]).read_text())
for item in baseline:
    name = item["name"]
    desired = item["status"]
    command = ["hermes", "plugins", "enable" if desired == "enabled" else "disable", name]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    print(f"restore_status {name} desired={desired} rc={result.returncode}")
    if result.returncode != 0:
        raise SystemExit(f"status restore failed for {name}")
PY
hermes plugins list --json --no-bundled > "$EVIDENCE_DIR/plugins-restored.json"
```

- Expected result on rollback: plugin files are restored from the archive, each plugin's original enabled/disabled status is reapplied, and `plugins-restored.json` matches the status fields in `plugins-before.json`.
- Acceptance test: compare `plugins-restored.json` to `plugins-before.json` by name and status with a Python script; do not claim rollback if any status or restore command failed.
- Rollback: This task is the rollback procedure; if archive extraction or status restoration fails, report the exact plugin and exit code and leave the system stopped for manual recovery.

## Subtasks

- TASK-002.a: Resolve `HERMES_HOME` from `hermes config path`.
- TASK-002.b: Capture JSON inventory and capability/update receipts.
- TASK-002.c: Run doctor once per inventoried name and validate exact receipt cardinality.
- TASK-003.a: Confirm the live update parser contract.
- TASK-003.b: Classify unknown-version, repaired, user-source, and doctor-failing plugins.
- TASK-004.a: Create and permission the plugin-only archive.
- TASK-005.a: Enumerate from baseline JSON, not from a manually copied list.
- TASK-005.b: Run update before enable for each name.
- TASK-005.c: Emit one JSONL receipt per name and fail on any nonzero result.
- TASK-006.a: Re-list and compare plugin name sets.
- TASK-006.b: Confirm every status is `enabled` and all health receipts pass.
- TASK-007.a: Verify `/evolve status` before `/evolve now`.
- TASK-007.b: Capture the `/evolve now` success response.

## Gates

- GATE-001 — Context: active workspace and Hermes home resolve correctly; no credential paths are read.
- GATE-002 — Safety: gateway is stopped/inactive; no live-gateway override is used.
- GATE-003 — Inventory: baseline JSON has unique names and doctor receipt cardinality equals the inventory count.
- GATE-004 — Compatibility: literal `--force` is supported, or the explicit plain-update waiver is recorded.
- GATE-005 — Preservation: plugin-only rollback archive is non-empty and mode 600.
- GATE-006 — Batch: exactly one update and one enable attempt exists for every baseline plugin, in that order.
- GATE-007 — Final state: baseline and final name sets match; all final statuses are enabled; update, enable, and post-update doctor receipts have no failures.
- GATE-008 — Runtime: `/evolve now` reports successful reload, rediscovery, cache refresh, and prompt invalidation with no warnings/errors.

## Checklists

### Preflight

- [ ] Workspace is `/mnt/c/Users/Alexa/playgrounds/Resume_maker`.
- [ ] Active Hermes home was resolved with `hermes config path`.
- [ ] `hermes plugins update --help` was checked; `--force` mismatch is handled explicitly.
- [ ] Gateway is stopped/inactive and not being updated live.
- [ ] No `.env`, `auth.json`, or provider credential path is read or archived.

### Triage

- [ ] Baseline list is JSON and each plugin name is unique.
- [ ] Capabilities are captured before and after mutation.
- [ ] Read-only update check is captured, including its exit code if network access fails.
- [ ] Doctor was attempted exactly once per baseline plugin.
- [ ] Unknown versions, repaired plugins, user-source plugins, and tool-override requirements are called out.

### Mutation

- [ ] Plugin-only rollback archive exists and is mode 600.
- [ ] Every plugin receives update before enable.
- [ ] Enable uses `--no-allow-tool-override`.
- [ ] Per-plugin failures are retained and the final aggregate exit code is nonzero when any failure exists.

### Runtime closeout

- [ ] All plugins are enabled in the final JSON inventory.
- [ ] No update, enable, or post-update doctor failure remains.
- [ ] `/evolve status` was run before `/evolve now`.
- [ ] `/evolve now` was the final state-changing action and returned its success summary.

## Actions

Planned only; no mutation was performed while authoring this plan. Execution records belong under:

`/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/`

## Needed specs

- None. This is an external Hermes maintenance operation, not an application implementation.
- Governing references loaded during planning: Hermes CLI reference, Hermes slash-command reference, and the installed `hermes-evolve` README/source.

## Dependencies and risks

| Dependency/risk | Impact | Mitigation | Owner |
|---|---|---|---|
| Installed CLI lacks `--force` | Literal requested command exits with argparse error | Use the explicit plain-update waiver only if accepted; otherwise stop | Operator |
| Gateway becomes active | Updating loaded callbacks can break the live gateway | Require stopped/inactive status; never add `--allow-live-gateway` automatically | Operator |
| 18 user-source plugins may lack update provenance | Update can fail or be a no-op without an honest success signal | Attempt each command, retain nonzero receipts, and block final evolve gate | Executor |
| Six plugins report unknown version | Provenance and rollback confidence are lower | Review doctor/capability output before mutation; preserve archive | Security lens |
| Enabling every plugin increases attack surface and tool collisions | Runtime instability or privilege expansion | Enable with `--no-allow-tool-override`; stop on any enable failure | Security lens |
| Network/catalog/git update failure | Partial batch state | Continue with receipts, compare final state, restore archive if needed | Executor |
| `/evolve now` invalidates shared prompt snapshots | All active sessions rebuild on their next turn; possible one-turn latency | Run last, after all gates; preserve session history and avoid running during an active mutation | Operator |
| Plugin archive may contain sensitive application code | Evidence leakage | `umask 077`, mode 600, do not commit/upload, delete after acceptance | Operator |
| No code is changed in the repository | TDD and Git commits do not add confidence here | Use command/state gates instead of fake tests or commits | Architect |

## Tests / validation

This is not a code task, so the requested RED→GREEN→commit cycle is not applicable. The equivalent validation contract is:

1. RED/preflight: prove the current CLI and gateway state before mutation; reject an unsupported literal command or active gateway.
2. Baseline: prove the inventory is complete and unique; prove triage receipt cardinality equals the inventory cardinality.
3. Mutation: prove one update and one enable attempt per name, in order, with real exit codes.
4. GREEN/postcondition: prove the final name set is unchanged, every plugin status is `enabled`, and all required receipts are successful.
5. Runtime: prove the interactive `/evolve now` output contains its success summary without warnings/errors.
6. Recovery: if any gate fails, restore plugin files/status from the non-secret archive and verify the restored status map.

Do not run `bun run typecheck`, `bun run lint`, or `bun run build`; the application source is intentionally untouched and those checks do not validate Hermes plugin state.

## Verification evidence

Expected evidence paths after execution:

- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/plugins-before.json`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/capabilities-before.txt`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/check-updates-before.json`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/doctor-before.jsonl`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/rollback/plugins-before.tgz`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/update-enable.jsonl`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/plugins-after.json`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/doctor-after.jsonl`
- `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/plans/2026-10-07_070315-hermes-plugin-maintenance-evidence/evolve-output.txt`

Do not invent counts, exit codes, update versions, or `/evolve` output. Report the actual receipts.

## Rollback and completion

- Rollback trigger: any hard gate fails, any enable fails, any update failure remains unresolved, post-update doctor reports an error, or `/evolve now` reports a warning/error.
- Rollback procedure: close Hermes processes that loaded changed modules; extract `rollback/plugins-before.tgz` into the resolved `$HERMES_HOME`; reapply each baseline status from `plugins-before.json` with `hermes plugins enable NAME` or `hermes plugins disable NAME`; re-list and compare name/status pairs.
- Completion condition: all gates pass, every plugin has a successful update and enable receipt, every final status is enabled, and `/evolve now` returns its success summary.
- Open questions to resolve at execution: (1) accept the explicit plain-update compatibility waiver because this CLI lacks `--force`; (2) whether any plugin may ever receive `--allow-tool-override`—the default answer is no; (3) whether any doctor-failing or unknown-version plugin should be held for manual review rather than included in the batch.
