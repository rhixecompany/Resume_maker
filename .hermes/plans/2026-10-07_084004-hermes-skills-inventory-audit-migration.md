---
title: "Hermes skills inventory, audit, update, deduplication, and category migration"
description: "Inventory every visible Hermes skill, audit it with commands the installed CLI actually supports, update only applicable hub skills, then validate categories, duplicates, provenance, and quality."
date: 2026-10-07
status: not_started
profile: default
model: gpt-5.6-luna
owner: implementer
---

# Rules

- This plan-only turn creates no skill, profile, registry, or repository changes. Only this plan markdown file may be written.
- Use the installed Hermes source and CLI as the authority. Do not assume a command exists because the request names it.
- `hermes plugins audit` is not a valid command in the installed CLI. Do not run it as if it were valid. The supported replacements are documented below.
- Do not force-update user-modified or local-only skills until their source, winner, and rollback path are recorded. `--force` can delete/reinstall a hub skill directory and overwrite local edits.
- Never read, print, copy, or persist API keys, OAuth tokens, passwords, `.env` contents, auth-store contents, or credential-manager values. Skill text and reports must not contain secrets discovered in examples.
- Do not use `rm -rf` or delete a skill directory until duplicate identity, provenance, content hash, winner, and recovery source are verified. A local-only skill with no recovery source is never deleted by automation.
- Do not treat a security audit verdict as a quality score. `hermes skills audit` scans hub-installed skills for security findings; `skill-judge`/structural validation evaluates skill quality.
- Keep source tiers separate: project/local, external, bundled, and hub. Do not merge a lower-precedence local copy over a builtin or hub copy without tracing Hermes resolution.
- Preserve the installed loader contract: skill names come from `name:`; path categories are derived from the first directory below the active skills root; frontmatter `category:` is metadata and is not the same thing as the path bucket.
- Do not mass-rewrite all 1,000+ files just to make frontmatter `category:` equal the physical directory. That would create churn and may change registry metadata without changing loader behavior.
- Every batch is resumable and records real exit codes, counts, paths, hashes, and failures. Never claim all skills were audited when a batch timed out or the CLI skipped local entries.

# Goal

Inventory, triage, audit, update, deduplicate, consolidate, categorize, and quality-enhance every visible Hermes skill without corrupting source precedence, overwriting protected work, or inventing unsupported CLI behavior.

# Current context / assumptions

Read-only discovery completed on 2026-10-07 at 08:40 WAT. Re-run all baseline commands at execution time because the active profile can change between sessions.

- Hermes: v0.21.5+8490.g65bc672; source `/home/alexa/.hermes/hermes-agent`; active home `/home/alexa/.hermes`.
- `hermes skills list --source all` reports `42 hub-installed, 53 builtin, 1154 local — 1249 enabled, 0 disabled`.
- `hermes skills check` checks 49 hub entries and reports five update candidates: `ast-grep`, `comfyui`, `kanban-video-orchestrator`, `pixel-art`, and `excel-author`.
- `hermes skills list-modified --json` reports 37 user-modified bundled skills. These are protected from ordinary updates and must not be overwritten by a blind `--force` loop.
- A physical scan of `/home/alexa/.hermes/skills` found 1,259 `SKILL.md` files. Twenty top-level skill directories are symlinked into `/home/alexa/.agents/skills`; a plain recursive scan does not follow those symlinked parents, so the inventory must include both roots and project/external search roots.
- The active physical tree contains 20 exact duplicate-name groups when names are normalized case-insensitively. Examples include `honcho`, `chainlink`, `develop`, `check`, `writing-plan`, `writing-spec`, `ast-grep`, `dspy`, and `weather-plugin`. Duplicate names may be intentional source-tier shadowing; they are not automatically deletable duplicates.
- The installed Hermes parser found no missing `name:` values in the scanned physical files and 33 files without a top-level `category:` field. This must be confirmed with both Hermes’ parser and an independent frontmatter-delimiter check before any repair; a malformed frontmatter block can be silently skipped by fallback parsing.
- `hermes skills list` displays the physical path bucket as `Category`, while `SKILL.md` top-level `category:` is a separate metadata field. The source implementation is `/home/alexa/.hermes/hermes-agent/tools/skills_tool.py`, especially `_get_category_from_path()` and `_skill_catalog()`.
- `hermes plugins --help` exposes `doctor`, `validate`, `check-updates`, `capabilities`, and other plugin operations, but no `audit` subcommand. `hermes plugins audit --help` exits 2 with “audit is not a hermes plugins command”.
- `hermes skills audit [--deep] [name]` audits hub-installed skills only. The source implementation returns “No hub-installed skills to audit” or rejects a local-only name. It cannot be used as a quality audit for all 1,154 local entries.
- `hermes skills update [--force] [name]` updates hub-installed skills only. It does not update arbitrary local files. `--force` bypasses local-edit protection and can replace a skill directory.
- The repository is `/mnt/c/Users/Alexa/playgrounds/Resume_maker`; this plan is the only project artifact intended for this turn. The skill profile is external to that Git repository.

# Architecture / proposed approach

Use a two-dimensional inventory: source tier/provenance controls ownership and update behavior, while physical path and frontmatter metadata control category validation. First build a redacted manifest from Hermes’ own search roots, then run supported security audits and quality checks in bounded, resumable batches; only after the report is reviewed should hub updates, content repairs, duplicate consolidation, or path migrations occur. Treat unsupported commands as a discovered interface mismatch, not as a reason to fake success or issue 1,154 pointless failures.

# Subgoals

1. Discover every active skill across Hermes home, `.agents`, project-local, and external roots, including symlinked directories.
2. Classify each visible entry as hub, builtin, local, project, external, plugin-provided, shadowed, disabled, modified, duplicate, or missing.
3. Run the correct security audit for every hub skill and a structural/content audit for every local/builtin skill.
4. Update only hub skills with a real pending update, with explicit treatment for the 37 user-modified skills.
5. Repair missing/invalid frontmatter and category metadata in small reviewed batches.
6. Merge real duplicate content, preserve intentional source-tier shadows, and remove only proven redundant copies.
7. Re-run the full inventory, audit, and quality gates until counts and outcomes reconcile exactly.

# Steps

1. Capture live CLI help, counts, provenance, modified list, duplicate baseline, and source roots.
2. Create the executable specification and redacted manifest before mutation.
3. Audit hub security and local/builtin structure in resumable batches.
4. Apply approved hub updates; do not force local-only names.
5. Repair categories/frontmatter and enhance low-quality canonical skills by domain batches.
6. Resolve duplicates using source precedence and content comparison.
7. Re-index Hermes, re-audit, verify all acceptance gates, and report unsupported operations honestly.

# Todos

- [ ] Live command contract captured, including the absence of `hermes plugins audit`.
- [ ] All source roots enumerated, including symlinks and project/external roots.
- [ ] Redacted manifest reconciled with `hermes skills list --source all`.
- [ ] Hub/local/builtin/plugin source tiers assigned to every visible entry.
- [ ] Every hub skill receives a supported security audit result.
- [ ] Every visible local/builtin skill receives a structural/content result.
- [ ] Five pending hub updates processed or blocked with exact evidence.
- [ ] Thirty-seven user-modified skills protected or explicitly approved for overwrite.
- [ ] All duplicate-name groups have a winner/merge/retain decision.
- [ ] Missing/invalid categories and frontmatter repaired or documented.
- [ ] Physical path migrations preserve Hermes load names and source precedence.
- [ ] Re-scan counts equal the recorded final manifest.

# Phases

## Phase 0 — Command contract and safety gate

Entry: execution explicitly started; no mutations yet.

### TASK-001 — Capture CLI contracts (2–4 min)

- Owner: `default` / architect.
- Inputs: installed Hermes v0.21.5+8490.g65bc672.
- Paths: `/home/alexa/.hermes/hermes-agent/hermes_cli/subcommands/skills.py`, `/home/alexa/.hermes/hermes-agent/hermes_cli/skills_hub.py`, `/home/alexa/.hermes/hermes-agent/tools/skills_tool.py`.
- Dependencies: none.
- Action:
  ```bash
  hermes skills --help
  hermes skills list --help
  hermes skills audit --help
  hermes skills update --help
  hermes plugins --help
  hermes plugins audit --help || true
  hermes plugins doctor --help
  hermes plugins validate --help
  ```
- Expected: skills audit/update accept an optional name; plugin commands contain no `audit`; plugin `doctor` and `validate` are the supported plugin diagnostics.
- Output: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/cli-contract.txt`.
- Acceptance: the report includes the real exit code for `hermes plugins audit --help` (expected 2), not a fabricated per-skill audit result.
- Rollback: none; read-only.

### TASK-002 — Record preflight state (3–5 min)

- Owner: `default`.
- Inputs: active profile and skill roots.
- Paths: `/home/alexa/.hermes/skills`, `/home/alexa/.agents/skills`, `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/skills`, and any paths returned by Hermes `skills.external_dirs`.
- Dependencies: TASK-001.
- Action:
  ```bash
  hermes skills list --source all
  hermes skills check
  hermes skills list-modified --json
  hermes plugins list --json
  git -C /mnt/c/Users/Alexa/playgrounds/Resume_maker status --short --branch
  ```
- Expected: counts and pending names match the current context or the report records the change.
- Output: redacted command receipts; plugin IDs only, no token/config values.
- Acceptance: no write occurs and no `.env`/auth content is printed.
- Rollback: none.

Gate 0: the operator can explain which command handles each source tier and has acknowledged that `hermes plugins audit` is unsupported.

## Phase 1 — Complete inventory and executable specification

Entry: Gate 0 passed.

### TASK-003 — Resolve all Hermes search roots (3–5 min)

- Owner: `default`.
- Inputs: Hermes source and active profile.
- Paths: `/home/alexa/.hermes/hermes-agent/agent/skill_utils.py`, `/home/alexa/.hermes/hermes-agent/tools/skills_tool.py`.
- Dependencies: TASK-002.
- Action: inspect `get_skill_search_roots()`, `get_external_skills_dirs()`, `iter_skill_index_files()`, `resolve_skill_catalog()`, and `EXCLUDED_SKILL_DIRS`. Resolve paths at runtime instead of hard-coding only `/home/alexa/.hermes/skills`.
- Expected: a deterministic ordered list of tier/root pairs, with project roots separated from profile roots.
- Acceptance: the inventory follows symlinked `.agents` roots intentionally and excludes `.hub`, `.archive`, `.locks`, dependency, cache, and support directories only when Hermes excludes them.
- Rollback: none.

### TASK-004 — Create the spec before mutation (4–5 min)

- Owner: `default`.
- Inputs: this plan and TASK-003.
- Paths to create during execution: `/home/alexa/.hermes/specs/2026-10-07-hermes-skills-inventory-audit-migration/SPEC.md`, `/home/alexa/.hermes/specs/2026-10-07-hermes-skills-inventory-audit-migration/verification/`.
- Dependencies: TASK-003.
- Action: write an executable spec that links back to this plan and defines source precedence, audit command mapping, category invariants, duplicate winner rules, update authorization, and final counts.
- Expected: `SPEC.md` has Goal, Scope/non-goals, Definitions, numbered Requirements, Constraints, Interfaces/data contracts, Security/failure behavior, Executable examples, Acceptance criteria, Test commands, Rollback, Validation evidence, and Linked plan.
- Acceptance: each requirement has a command or observable file-state check; no spec example contains a secret.
- Rollback: delete only the newly created spec directory if execution is abandoned before any skill mutation, after explicit approval.

### TASK-005 — Generate the redacted manifest (5 min per batch setup)

- Owner: `default`.
- Inputs: roots and source precedence from TASK-003.
- Paths to create during execution: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/skill-manifest.jsonl` and `inventory-summary.json`.
- Dependencies: TASK-003, TASK-004.
- Action: for every discovered `SKILL.md`, record only metadata:
  `path`, `resolved_path`, `source_root`, `tier`, `name`, `frontmatter_closed`, `frontmatter_parseable`, `frontmatter_category`, `path_category`, `version`, `line_count`, `reference_dirs`, `sha256`, `modified_status`, `hub_identifier`, `duplicate_group`, `loader_name`, and `visible_status`.
- Expected baseline: physical/profile paths plus symlinked paths are counted; `hermes skills list --source all` counts reconcile after shadowed/duplicate entries are explained.
- Acceptance: no body text, environment values, credentials, or `.env` paths are copied into the manifest; every discovered file has one row.
- Rollback: remove only the generated verification receipts, not skill content.

Use this execution-time Python skeleton for the inventory; it is intentionally read-only and writes only the plan verification files:

```python
#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

HERMES_HOME = Path(os.environ.get("HERMES_HOME", Path.home() / ".hermes")).expanduser()
OUT = HERMES_HOME / "plans/2026-10-07-hermes-skills-inventory-audit-migration/verification"
OUT.mkdir(parents=True, exist_ok=True)

# Resolve these from Hermes source in TASK-003 before widening the list.
ROOTS = [HERMES_HOME / "skills", Path.home() / ".agents" / "skills"]
EXCLUDED = {".git", ".github", ".hub", ".archive", ".curator_backups", ".locks",
            ".venv", "venv", "node_modules", "site-packages", "__pycache__",
            ".tox", ".nox", ".pytest_cache", ".mypy_cache", ".ruff_cache"}

try:
    import sys
    sys.path.insert(0, "/home/alexa/.hermes/hermes-agent")
    from agent.skill_utils import parse_frontmatter
except Exception as exc:
    raise SystemExit(f"Hermes parser unavailable: {exc}")

def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def discover(root: Path):
    if not root.exists():
        return
    for path in root.rglob("SKILL.md"):
        try:
            rel = path.relative_to(root)
        except ValueError:
            continue
        if any(part in EXCLUDED for part in rel.parts):
            continue
        yield root, path, rel

rows = []
by_name = defaultdict(list)
for root, path, rel in discover(root) or ():
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    frontmatter, _body = parse_frontmatter(text)
    name = str(frontmatter.get("name") or path.parent.name).strip()
    category = str(frontmatter.get("category") or "").strip()
    path_category = rel.parts[0] if len(rel.parts) >= 3 else ""
    row = {
        "path": str(path), "root": str(root), "relative_path": rel.as_posix(),
        "name": name, "frontmatter_closed": text.startswith("---") and "\n---" in text[3:],
        "frontmatter_parseable": bool(frontmatter), "frontmatter_category": category,
        "path_category": path_category, "version": str(frontmatter.get("version") or ""),
        "line_count": len(text.splitlines()), "reference_dirs": [d for d in ("references", "templates", "assets", "scripts") if (path.parent / d).is_dir()],
        "sha256": sha256(path),
    }
    rows.append(row)
    by_name[name.casefold()].append(row)

for row in rows:
    paths = by_name[row["name"].casefold()]
    row["duplicate_group"] = row["name"].casefold() if len(paths) > 1 else ""
    row["duplicate_paths"] = [p["path"] for p in paths] if len(paths) > 1 else []

with (OUT / "skill-manifest.jsonl").open("w", encoding="utf-8") as stream:
    for row in sorted(rows, key=lambda item: (item["name"].casefold(), item["path"])):
        stream.write(json.dumps(row, ensure_ascii=False) + "\n")

summary = {
    "skill_files": len(rows),
    "names": len(by_name),
    "duplicate_groups": sum(1 for values in by_name.values() if len(values) > 1),
    "missing_category": sum(not row["frontmatter_category"] for row in rows),
    "unparseable_frontmatter": sum(not row["frontmatter_parseable"] for row in rows),
    "path_categories": Counter(row["path_category"] or "<root>" for row in rows),
}
(OUT / "inventory-summary.json").write_text(json.dumps(summary, indent=2, default=dict), encoding="utf-8")
print(json.dumps(summary, indent=2, default=dict))
``` 

The implementer must replace the illustrative `ROOTS` list with the exact roots returned by Hermes and must not treat the script’s output as valid until its counts reconcile with `hermes skills list --source all` and source-tier shadowing.

### TASK-006 — Build the duplicate and category queues (3–5 min)

- Owner: `default`.
- Inputs: `skill-manifest.jsonl`.
- Paths: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/duplicate-queue.json`, `category-queue.json`, `audit-queue.json`.
- Dependencies: TASK-005.
- Action: group by normalized frontmatter name; classify each group as `same_content`, `different_content`, `source_shadow`, `symlink_alias`, `missing_recovery_source`, or `ambiguous`. Validate category with Hermes’ `_VALID_CATEGORY_RE` (`^[a-z][a-z0-9_/-]*$`) and separately validate physical path buckets.
- Expected: the current 20 duplicate groups are represented, but the final count may change when `.agents`/project roots are included.
- Acceptance: no duplicate group is labeled “delete” before a winner and recovery source are recorded.
- Rollback: regenerate queues from the manifest.

Gate 1: the spec, manifest, source-tier counts, duplicate groups, category queues, and audit queues are present and redacted. No skill content has been changed.

## Phase 2 — Audit mapping and quality baseline

Entry: Gate 1 passed.

### TASK-007 — Map audit commands to source tiers (3–5 min)

- Owner: `default`.
- Inputs: CLI contracts and manifest.
- Dependencies: TASK-006.
- Action: apply this command map:

  | Entry type | Supported command | Expected result |
  |---|---|---|
  | Hub-installed skill | `hermes skills audit --deep <name>` | Security scan report; one real result per hub name |
  | Local/builtin/project skill | structural/content validator plus `skill-judge` rubric | quality/frontmatter/category result; Hermes security command is not applicable |
  | Installed native plugin | `hermes plugins doctor --ci <plugin-id>` | plugin runtime contract check |
  | Plugin directory | `hermes plugins validate --json <plugin-path>` | plugin manifest/capability validation |
  | All installed plugins | `hermes plugins check-updates --json` and `hermes plugins capabilities` | read-only update/capability report |

- Expected: the unsupported `hermes plugins audit` request is logged once as an interface mismatch, not repeated as a false per-skill pass.
- Acceptance: the map is linked from `SPEC.md` and every manifest row has exactly one applicable audit path.
- Rollback: none.

### TASK-008 — Audit all hub skills in bounded batches (2–5 min per batch)

- Owner: `default`.
- Inputs: hub names from the manifest.
- Paths: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/audit/hub-batch-###.jsonl`.
- Dependencies: TASK-007.
- Action: run one name at a time, seven names per resumable batch:
  ```bash
  hermes skills audit --deep ast-grep
  hermes skills audit --deep comfyui
  ```
  Replace the examples with the exact queue names; capture stdout, stderr, and exit code with secrets removed.
- Expected: every hub-installed name receives `ALLOWED`, `BLOCKED`, missing-path, or command-error status. `BLOCKED` is an audit classification, not proof that the skill is disabled.
- Acceptance: hub manifest count equals audit-result count; no batch is marked complete on timeout.
- Rollback: read-only; rerun the failed batch only.

### TASK-009 — Audit all local/builtin/project skills (2–5 min per batch)

- Owner: `default`.
- Inputs: local/builtin/project rows and `skill-judge` rubric.
- Paths: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/judge/batch-###.jsonl`.
- Dependencies: TASK-007.
- Action: process seven canonical skills per batch. Validate frontmatter, required sections, reference paths, fenced code, line count, platform declarations, and duplicate content. Score the five dimensions from `skill-judge` without retaining full skill bodies in the report.
- Expected: each canonical non-hub entry gets `PASS`, `WARN`, `FAIL`, or `BLOCKED_READ`; partial batches are resumable.
- Acceptance: every canonical visible name, not every shadowed physical copy, has exactly one quality result and a list of shadow paths.
- Rollback: read-only; delete only generated reports if a batch parser is wrong.

### TASK-010 — Audit actual plugins separately (3–5 min)

- Owner: `default`.
- Inputs: plugin IDs from `hermes plugins list --json`.
- Paths: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/verification/plugins/`.
- Dependencies: TASK-007.
- Action:
  ```bash
  hermes plugins check-updates --json
  hermes plugins capabilities
  hermes plugins doctor --ci <plugin-id>
  ```
  Run `doctor` serially for installed native plugins; run `validate --json` only when a concrete plugin directory is identified.
- Expected: plugin IDs, declared/granted capabilities, and doctor exit codes; no association is invented between a skill name and a plugin name.
- Acceptance: the report distinguishes plugin failures from skill failures.
- Rollback: read-only.

Gate 2: all 42 current hub entries, all canonical local/builtin/project entries, and all installed plugins have the correct type of audit result. The unsupported command is explicitly recorded and not treated as executed.

## Phase 3 — Pending updates and provenance protection

Entry: Gate 2 passed; update approval is recorded in the spec/approval artifact.

### TASK-011 — Snapshot update candidates and protected entries (3 min)

- Owner: `default`.
- Inputs: `hermes skills check`, `hermes skills list-modified --json`, hub lock metadata.
- Paths: `/home/alexa/.hermes/skills/.hub/lock.json` (metadata only), verification receipts.
- Dependencies: TASK-008.
- Action: confirm the five current `update_available` names and the 37 user-modified names. Inspect only metadata/hashes; do not print lock credentials or skill body text.
- Expected: queue is exactly `ast-grep`, `comfyui`, `kanban-video-orchestrator`, `pixel-art`, and `excel-author`, unless live state differs.
- Acceptance: every pending name has a source identifier, install path, current hash, modified flag, and recovery source.
- Rollback: none.

### TASK-012 — Update only real hub candidates (2–5 min per name)

- Owner: `default`.
- Inputs: approved pending-update queue and TASK-011.
- Dependencies: TASK-011 and explicit force-update approval.
- Action:
  ```bash
  for name in ast-grep comfyui kanban-video-orchestrator pixel-art excel-author; do
    hermes skills update "$name" --force
  done
  ```
  Substitute only the live `update_available` queue. Do not pass local-only or up-to-date names as if they were update candidates.
- Expected: each candidate reports updated, scan-rejected, unavailable, or a real error. `--force` is permitted only after the affected path and source hash are recorded.
- Acceptance: post-update hub lock metadata and content hashes change only for successful candidates; protected user-modified skills are not overwritten unless explicitly named in the approval artifact.
- Rollback: use `hermes skills repair-official --restore <name>` only for an official optional skill with a verified official source, or restore the previous content through the recorded source/recovery path. If no recovery source exists, stop and request input.

### TASK-013 — Verify update results (3–5 min)

- Owner: `default`.
- Inputs: update receipts.
- Dependencies: TASK-012.
- Action:
  ```bash
  hermes skills check
  hermes skills list --source all
  hermes skills audit --deep <each-successful-hub-name>
  ```
- Expected: successful candidates are `up_to_date`, counts reconcile, and post-update audit results exist.
- Acceptance: no forced update is called successful solely because the command exited 0; read the final status.
- Rollback: revert only the specific failed update using the verified source path.

Gate 3: update candidates are exhausted or explicitly blocked, protected modified skills are accounted for, and no local-only skill was “updated” through an unsupported path.

## Phase 4 — Frontmatter, category, and path repair

Entry: Gate 3 passed.

### TASK-014 — Validate frontmatter and category invariants (2–5 min per batch)

- Owner: `default`.
- Inputs: manifest and `skill-format.md`.
- Paths: each canonical `SKILL.md`; no project files.
- Dependencies: TASK-009.
- Action: validate:
  - closed `---` fences and parseable YAML;
  - `name` matches `^[a-z][a-z0-9_-]*$` and is ≤64 characters;
  - non-empty one-sentence `description`;
  - semver-like `version` when present;
  - non-empty `author`, `license`, and list `tags` for skills governed by the quality rubric;
  - top-level `category` is non-empty and matches `^[a-z][a-z0-9_/-]*$` when the skill contract requires it;
  - `platforms` values are known when present;
  - all cited `references/`, `templates/`, `assets/`, and `scripts/` files exist.
- Expected: exact failure list; no automatic repair yet.
- Acceptance: 100% of failures are classified as `frontmatter`, `category`, `reference`, `duplicate`, `platform`, or `content`.
- Rollback: none.

### TASK-015 — Repair missing metadata in small batches (2–5 min per batch)

- Owner: `default`.
- Inputs: category/frontmatter queue and content owner decision.
- Paths: canonical `SKILL.md` files only; never `.hub` lock/auth files.
- Dependencies: TASK-014 and a reviewed category map.
- Action: add the minimum missing metadata while preserving body text and line endings. Use `patch`/`write_file` after a full read; do not copy a generic category into every skill. Derive the proposed category from the skill’s domain/path and record the mapping in the spec.
- Expected: each changed file gains exactly one frontmatter field, not duplicate `---`, `category`, `name`, or `metadata` blocks.
- Acceptance: run the validator before and after each batch; expected RED is the pre-repair failure and GREEN is the post-repair result.
- Rollback: restore the exact previous file content from the pre-change hash/source receipt; stop when a local-only file has no recoverable previous content.

### TASK-016 — Handle physical category folders without breaking loader semantics (3–5 min per batch)

- Owner: `default`.
- Inputs: path-category queue and `_get_category_from_path()` behavior.
- Dependencies: TASK-014.
- Action: keep existing nested packages in `<skills-root>/<category>/<skill>/SKILL.md` when the path is valid. Treat root-level umbrella packages such as `<skills-root>/writing-plan/SKILL.md` as direct skills, not as evidence that the loader is broken. Migrate a root-level package only when it has a clear canonical category, no source/provenance conflict, and a load-name verification plan.
- Expected: after any move, `hermes skills list --source all` shows the same load name once and `hermes skills view <name>` resolves the intended content.
- Acceptance: no category move changes a skill’s name, source tier, disabled state, or linked-file resolution unexpectedly.
- Rollback: move the package back to its recorded original path and invalidate the skill cache/restart Hermes.

Gate 4: every canonical skill is syntactically valid, has a reviewed category decision, and path migrations are loader-verified. Root direct skills are either intentionally retained as direct packages or have a recorded migration.

## Phase 5 — Duplicate triage, merge, and consolidation

Entry: Gate 4 passed.

### TASK-017 — Select a winner for each duplicate group (2–5 min per group)

- Owner: `default`.
- Inputs: duplicate queue, source tiers, hashes, line/reference counts, modified status.
- Dependencies: TASK-006 and TASK-014.
- Action: apply winner order:
  1. exact official/builtin provenance over an untracked copy when content is equivalent;
  2. user-modified copy over an untouched copy only when it contains meaningful improvements and has a recovery source;
  3. richer, valid frontmatter/body/references over a stub;
  4. category-path canonical copy over a flat duplicate only after loader resolution is verified;
  5. if contents diverge materially, merge before deleting anything.
- Expected: every group has `keep`, `merge`, `retain-shadow`, or `blocked-needs-input`.
- Acceptance: no group is labeled `delete` without a second existing recovery source and a content hash.
- Rollback: no mutation in this task.

### TASK-018 — Merge divergent duplicate content (2–5 min per file)

- Owner: `default` / content owner.
- Inputs: winner decisions.
- Paths: winner `SKILL.md` and its `references/`, `templates/`, `assets/`, `scripts/`.
- Dependencies: TASK-017.
- Action: merge unique requirements into the winner, remove duplicate prose, preserve source citations, and update internal relative links. Do not combine two unrelated workflows merely because names match.
- Expected: winner retains all required behavior with one canonical procedure and no orphaned support files.
- Acceptance: skill validator, `skill-judge`, and representative `skill_view` all pass; hashes/line counts are recorded.
- Rollback: restore winner from the pre-merge content receipt/source; do not delete loser yet.

### TASK-019 — Remove only proven redundant copies (2–5 min per copy)

- Owner: `default`.
- Inputs: approved winner map and recovery sources.
- Dependencies: TASK-018 and an explicit deletion approval gate.
- Action: use the supported Hermes operation for hub entries; for local physical copies, use the profile skill-management operation or a targeted filesystem move only after verifying that the loser is not the only file behind a visible load name. Do not use a broad recursive delete.
- Expected: one visible canonical load name, no unintended shadowing, and source counts decrease by the exact number of redundant copies.
- Acceptance:
  ```bash
  hermes skills list --source all
  hermes skills view <winner-name>
  ```
  show the winner; all unrelated names remain visible.
- Rollback: restore the exact loser from its verified recovery source; if no source exists, the deletion is forbidden.

Gate 5: all duplicate groups have a deterministic outcome; no meaningful content or local-only skill was discarded.

## Phase 6 — Quality enhancement and consolidation

Entry: Gate 5 passed.

### TASK-020 — Re-score canonical skills after updates/merges (2–5 min per batch)

- Owner: `default`.
- Inputs: post-update manifest and quality rubric.
- Dependencies: TASK-019.
- Action: run the quality validator on seven canonical skills per batch, prioritizing `FAIL`, then `WARN`, then stale/modified entries. Keep `SKILL.md` focused; move substantive examples to `references/`, `templates/`, or `scripts/`.
- Expected: a before/after score and a concrete issue list for each skill.
- Acceptance: no “enhanced” label without a score delta or a documented reason that no change was needed.
- Rollback: revert the individual skill patch, not the whole library.

### TASK-021 — Apply targeted enhancements (2–5 min per skill)

- Owner: `default` plus content reviewer.
- Inputs: TASK-020 findings.
- Dependencies: TASK-020.
- Action: fix in priority order: malformed/missing frontmatter; missing `When to Use`; missing executable workflow; missing pitfalls/error handling; missing verification; broken/orphaned references; duplicate body content; unnecessary length. Do not paste the same generic template into all domains.
- Expected: each patch addresses the recorded issue and preserves the skill’s domain-specific behavior.
- Acceptance: run the failing validator/fixture first (RED), apply the minimal patch, rerun the targeted validator (GREEN), then re-run the batch judge and a representative `skill_view`.
- Rollback: restore the one file from its pre-patch hash/source.

### TASK-022 — Consolidate overlapping skills only when behavior is truly the same (3–5 min per group)

- Owner: `default` / architecture reviewer.
- Inputs: duplicate/quality reports and usage/provenance metadata.
- Dependencies: TASK-021.
- Action: compare trigger, inputs, outputs, side effects, and references. Merge only if the workflows are substitutable; otherwise retain separate names and add one cross-reference instead of creating a mega-skill.
- Expected: fewer redundant workflows without broadening any skill’s trigger so far that it loads for unrelated tasks.
- Acceptance: every retained skill has a single responsibility and every removed skill has a canonical replacement link.
- Rollback: restore the removed skill from the verified source; if replacement mapping is incomplete, do not remove it.

Gate 6: all canonical skills meet the agreed minimum quality threshold or have documented blockers; enhancements are targeted, not mass template churn.

## Phase 7 — Final reconciliation

Entry: Gates 0–6 passed.

### TASK-023 — Re-index and compare counts (3–5 min)

- Owner: `default`.
- Inputs: post-change filesystem and receipts.
- Dependencies: TASK-022.
- Action:
  ```bash
  hermes skills list --source all
  hermes skills list --source hub
  hermes skills list --source builtin
  hermes skills list --source local
  hermes skills list-modified --json
  hermes skills check
  ```
- Expected: final counts match the manifest after explaining every added, updated, merged, migrated, shadowed, or removed entry.
- Acceptance: declared totals equal programmatically counted results; no “approximately” totals.
- Rollback: revert only the batch that caused the mismatch.

### TASK-024 — Re-run all applicable audits and plugin checks (3–5 min per batch)

- Owner: `default`.
- Inputs: final manifest.
- Dependencies: TASK-023.
- Action: rerun `hermes skills audit --deep` for every final hub entry, the local structural validator for every canonical local/builtin/project entry, and `hermes plugins doctor --ci` for every installed plugin.
- Expected: post-change results exist for every applicable entry; unsupported command remains documented as unsupported.
- Acceptance: zero unexplained missing results, timeouts, or count mismatches.
- Rollback: no mutation; return to the failing phase.

### TASK-025 — Final integrity and handoff (3–5 min)

- Owner: `default`.
- Inputs: all receipts and spec acceptance criteria.
- Dependencies: TASK-024.
- Action:
  ```bash
  hermes skills list --source all
  hermes plugins list --json
  git -C /mnt/c/Users/Alexa/playgrounds/Resume_maker status --short --branch
  ```
  Confirm no project files were modified except the authorized plan during this plan-only turn; in an execution turn, list every external skill path changed.
- Expected: final report includes counts, duplicate outcomes, category repairs, audit/update results, blockers, and rollback sources.
- Acceptance: explicitly state `Goal complete` only if every gate passes; otherwise state the precise blocker.
- Rollback: retain receipts and stop; do not conceal an incomplete batch.

Gate 7: final source/quality counts reconcile, all applicable audits have evidence, no secret appears in artifacts, and all changes are recoverable or intentionally blocked.

# Tasks

The phase tasks above are the executable task list. Each task has an owner, inputs, exact paths, dependencies, action, output, acceptance test, and rollback. Batch tasks are intentionally seven skills or fewer per unit so a timeout leaves a resumable receipt instead of an unbounded partial state.

# Subtasks

- Inventory: resolve roots → parse frontmatter → hash files → map source tiers → resolve shadowed load names.
- Audit: hub security scan → local/builtin structural scan → plugin doctor/validate → aggregate counts.
- Update: check hub lock → protect modified list → force-update only pending hub names → read back hashes.
- Category: validate frontmatter category syntax → map missing metadata → verify physical path bucket → loader smoke test.
- Dedupe: group names → choose winner → merge divergent content → remove only recoverable redundant copies.
- Enhance: score → patch one issue → validate → re-score → record delta.

# Gates

| Gate | Evidence required |
|---|---|
| 0 | Live command contracts and unsupported-command receipt |
| 1 | Executable spec, complete redacted manifest, duplicate/category queues |
| 2 | Correct audit result for every applicable source tier and plugin |
| 3 | Five pending update results, modified-skill protection, post-update hashes |
| 4 | Frontmatter/category/path validation and loader smoke tests |
| 5 | Winner/merge/retain decision for every duplicate group |
| 6 | Before/after quality scores and targeted enhancement receipts |
| 7 | Reconciled final counts, no unexplained missing results, no secrets |

# Checklists

## Inventory checklist

- [ ] `hermes skills list --source all` count captured.
- [ ] `hermes skills list --source hub`, `builtin`, and `local` counts captured.
- [ ] Hermes search roots and precedence read from installed source.
- [ ] Symlinked `.agents/skills` and external/project roots included.
- [ ] `.hub`, `.archive`, `.locks`, support directories, and caches handled exactly as Hermes does.
- [ ] Name/path/category/duplicate/hash data recorded without skill bodies.

## Command and audit checklist

- [ ] `hermes plugins audit` absence recorded with exit 2.
- [ ] Hub skills use `hermes skills audit --deep <name>`.
- [ ] Local/builtin/project skills use structural/content validation.
- [ ] Plugins use `hermes plugins doctor --ci` or `validate --json`.
- [ ] The five current update candidates are processed only after approval.
- [ ] 37 user-modified skills are protected or explicitly approved.

## Migration checklist

- [ ] Every duplicate group has a winner and recovery source.
- [ ] No local-only skill is deleted without a verified recovery path.
- [ ] Physical moves preserve `name:` and `hermes skills view` resolution.
- [ ] No broad `rm -rf`, registry reset, or source-tier overwrite was used.
- [ ] All references/templates/scripts paths still exist after a move.

## Quality checklist

- [ ] Frontmatter delimiters are closed and parseable.
- [ ] `name`, description, version, author, license, tags, and category requirements are satisfied.
- [ ] Procedures are actionable and domain-specific.
- [ ] Pitfalls and verification are present.
- [ ] References are substantive and cited from the body.
- [ ] No placeholder/template residue remains.
- [ ] Each patch has before/after validation evidence.

# Actions

Planning-time read-only evidence used for this plan:

- `hermes skills --help` showed `audit`, `update`, `list`, `check`, `repair-official`, `reset`, `diff`, and related commands.
- `hermes plugins --help` showed no `audit`; `hermes plugins audit --help` exited 2.
- `hermes skills list --source all` reported 42 hub, 53 builtin, 1,154 local, 1,249 enabled, 0 disabled.
- `hermes skills check` reported 49 checked and five `update_available` names.
- `hermes skills list-modified --json` reported 37 modified bundled names.
- Physical inventory found 1,259 `SKILL.md` files under `/home/alexa/.hermes/skills`; 20 top-level directory links point to `/home/alexa/.agents/skills`.
- The source implementation confirmed that `hermes skills audit` and `hermes skills update` operate on hub-installed entries, while skill-list categories come from the physical path.

No skill file, registry entry, plugin, profile, project file, or source repository was modified in this plan-only turn.

# Needed specs

Create before Phase 2 execution:

- `/home/alexa/.hermes/specs/2026-10-07-hermes-skills-inventory-audit-migration/SPEC.md`
- `/home/alexa/.hermes/specs/2026-10-07-hermes-skills-inventory-audit-migration/verification/`

The spec must link back to this plan and include the final source precedence, category policy, duplicate winner map, allowed update list, audit command map, and measurable acceptance thresholds.

# Tests / validation

This task is primarily configuration/content management, not application-code development. The required validation cycle is therefore RED → GREEN per skill batch:

1. Run the frontmatter/category/reference validator before a repair; the targeted fixture or skill must fail for the recorded reason.
2. Apply the smallest edit to one canonical `SKILL.md` or one support file.
3. Re-run the validator; the targeted failure must pass.
4. Run `skill-judge`/quality scoring and verify the score delta.
5. Run `hermes skills view <name>` and the relevant audit/doctor command.
6. Commit only repository changes if an execution task intentionally changes the repository; external profile skill changes use their own receipts and must not be falsely described as Git commits.

Do not call the whole library green if any batch is missing, timed out, or skipped because the installed CLI does not support the requested operation.

Required final commands:

```bash
hermes skills list --source all
hermes skills check
hermes skills list-modified --json
hermes plugins check-updates --json
hermes plugins capabilities
hermes skills audit --deep <every-final-hub-name>
hermes plugins doctor --ci <every-installed-plugin-id>
hermes skills view <every-changed-canonical-name>
git -C /mnt/c/Users/Alexa/playgrounds/Resume_maker status --short --branch
```

Expected: source counts, audit result counts, plugin result counts, and changed-name list reconcile exactly; all commands use supported syntax; no secret value appears in output or artifacts.

# Dependencies and risks

- The installed CLI’s separation between skill security audits, skill quality validation, and plugin diagnostics is a hard dependency. The requested `hermes plugins audit <skill-name>` operation cannot be satisfied literally.
- `hermes skills audit` and `hermes skills update` inspect hub lock entries, not all local files. A 1,154-entry local quality pass needs a separate validator/judge pipeline.
- `--force` updates are destructive for locally edited hub copies. The 37 modified names are a high-risk set.
- Physical duplicate paths can be intentional source-tier shadows. Removing one without tracing `resolve_skill_catalog()` can change which instructions load.
- The local profile is not the Resume_maker Git repository. Git cannot roll back untracked external skill directories; local-only deletion requires a recovery source or an explicit user decision.
- Skill content can contain shell commands, package installs, URL fetches, or environment references. Security audit findings are expected for some workflows; they require triage, not blanket deletion.
- A mass category migration can change load names, path-based categories, generated docs, and shadow precedence. Prefer metadata repairs and targeted moves.
- 1,154 CLI-visible local entries and 1,259 physical files are different populations because of duplicates, shadowed copies, symlinks, or unsupported/hidden source paths. Reconcile programmatically; never add these numbers mentally.
- `skill_view` can return a stale cached representation after edits. Verify changed files from disk and then re-run the CLI/listing.
- The current skill-quality wrapper scripts referenced by some skills may not exist at their documented Windows paths in WSL. Resolve actual script paths before executing them; do not invent a successful run.

# Open questions and decisions

1. **Unsupported command:** use the supported command map above rather than attempting `hermes plugins audit`. This is a resolved implementation decision, not a blocker.
2. **Force-update scope:** recommended scope is the five live `update_available` hub names only; up-to-date/local entries are recorded as no-op/not-applicable. Expanding force updates to all 42 hub entries requires explicit approval because it can overwrite modified content.
3. **Category semantics:** preserve Hermes’ distinction between physical path category and frontmatter metadata. Add missing metadata and migrate paths only when loader behavior benefits; do not force all frontmatter values to equal directory names.
4. **Duplicate deletion:** default to `merge`/`retain-shadow` when provenance or recovery is ambiguous. Delete only when a canonical source and a verified replacement are present.
5. **Quality threshold:** recommended minimum is no `FAIL`, all frontmatter/path/reference checks passing, and a documented reason for any `WARN`; set an exact numeric `skill-judge` threshold in `SPEC.md` before remediation.
6. **Project-local skills:** if `/mnt/c/Users/Alexa/playgrounds/Resume_maker/.hermes/skills` contains entries, keep them project-scoped and never promote them into profile-global categories without an explicit decision.

# Verification evidence

The plan is grounded in live read-only command/source inspection on 2026-10-07. No mutation was attempted. The exact unsupported-command behavior, live skill counts, pending update names, modified-skill count, physical skill count, duplicate examples, and source implementation paths are recorded above. All future success claims require new command output after execution.

# Rollback and completion

- Metadata repair: restore the pre-change `SKILL.md` content from the recorded source/hash before applying the next batch.
- Hub update: use the locked official/source identifier and `hermes skills repair-official --restore <name>` only where the official source is verified; otherwise stop rather than fabricate rollback.
- Duplicate merge: restore the winner from its pre-merge source; keep the loser until the winner passes all gates.
- Path migration: move the package back to its original path, invalidate the skill cache/restart Hermes, and verify `hermes skills view <name>`.
- Plugin changes: do not mutate plugin enablement or capabilities as part of this skill task unless a separate approval adds them to scope.
- Completion requires Gates 0–7, exact count reconciliation, one applicable audit result per canonical skill, no unexplained duplicates, no unsupported-command claims, and no secrets in reports. If any condition fails, report the exact command/path/exit code and leave the task incomplete.
