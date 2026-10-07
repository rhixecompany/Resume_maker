---
title: "Hermes config, WSL, and agent-tooling hardening"
description: "Research every Hermes config field, apply evidence-based non-secret improvements, repair cross-tool WSL setup, and push clean-development safely."
date: 2026-10-07
status: not_started
profile: default
model: gpt-5.6-luna
owner: implementer
---

# Rules

- This plan is the only artifact created in the plan-only turn. No implementation, config mutation, commit, or push happens until execution is explicitly started.
- Treat `/home/alexa/.hermes/config.yaml` as runtime state, not repository source. Use `hermes config set/get/unset`; never hand-edit YAML unless the CLI is unavailable and the exception is documented.
- Never read, print, copy, stage, or commit secret values. Do not expose API keys, OAuth tokens, passwords, `.env` content, `auth.json` content, or credential-manager output. Report only provider, model, endpoint, credential type, presence, and masked status.
- Do not write `.env` or credential files. Existing secret-file metadata may be checked without reading contents.
- Do not populate every default merely because a field exists. For every leaf field, record `keep`, `change`, `unset`, `conditional`, or `unsupported`; write only justified deltas.
- Preserve exact identifiers, URLs, branch names, and model IDs. Do not normalize a value merely because another spelling looks nicer.
- Do not delete unknown, legacy, or `_left_*` fields until the current source and migration code prove they are unread and a rollback exists.
- Do not bypass the GitHub workflow permission rejection by deleting or weakening `.github/workflows/ci.yml`.
- Do not use blind `git add -A`. Review the full diff first; use `git add -A` only after the intended scope is proven, or stage explicit paths.
- No generated PDFs are a quality gate. This repository documents a known PhantomJS-era `markdown-pdf` failure; verify deterministic Markdown output instead.

# Goal

Research and classify every current and supported Hermes `config.yaml` field, apply only evidence-backed non-secret improvements, make WSL/Agent/Copilot/OpenCode interoperate cleanly, repair the `clean-development` push path, and verify the complete result without exposing credentials.

# Current context / assumptions

Read-only discovery completed on 2026-10-07; all values below must be rechecked at execution time:

- Workspace: `/mnt/c/Users/Alexa/playgrounds/Resume_maker`; branch `clean-development`; working tree clean; branch is ahead 11 and behind 1 relative to `origin/development`.
- Remote: `https://github.com/rhixecompany/Resume_maker.git`.
- The failed push was rejected because an OAuth App attempted to create/update `.github/workflows/ci.yml` without the `workflow` scope. This is an authentication/transport problem, not a reason to remove the workflow.
- Hermes: v0.21.5+8490.g65bc672, installed from `/home/alexa/.hermes/hermes-agent`; `hermes config check` reports schema version 50; Hermes reports an update is available, but updating Hermes is outside this plan unless the execution owner approves it separately.
- Hermes paths: config `/home/alexa/.hermes/config.yaml`, env `/home/alexa/.hermes/.env`, OAuth/auth store `/home/alexa/.hermes/auth.json`. Config and auth metadata were mode 600; contents were not read.
- Current resolved model identity: `gpt-5.6-luna`, provider ID `openai-codex`, display provider `ChatGPT or Codex Subscription`, base URL `https://chatgpt.com/backend-api/codex`. `model.api_key` is not set; the active credential is OAuth-backed in the auth store. Never print the token or attempt to answer “what is the key?” with its value.
- The raw config has 67 top-level keys. The installed `DEFAULT_CONFIG` defines 99 top-level defaults. The difference is not automatically a defect: unset fields intentionally inherit defaults, while dynamic sections and legacy keys require source/migration review.
- Runtime: WSL2 on Kali 2026.3, kernel `6.18.33.2-microsoft-standard-WSL2`, WSL `2.7.13`, Windows build `10.0.26300.9550`; repository is on `/mnt/c`, not the Linux filesystem.
- Tool state: `bun.exe` 1.3.14 is available, but the `bun` command is not currently available as a Linux command; Node 26.7.0, GitHub CLI 2.102.0, and OpenCode 2.0.18 are present. Copilot is present but its version/help commands returned no useful version text and need diagnosis. `opencode auth list` exited 9, so OpenCode auth is not yet verified.
- Current CI workflow triggers pushes to `development` and `production`, and pull requests into `development`; `clean-development` is not a push trigger. Decide and document whether that branch should be added. Recommended default: add it because it is the branch being pushed and must receive CI feedback.
- There is no TypeScript/Python behavior change in scope. Validation is configuration, documentation, YAML, CLI, integration, and repository-state validation; if implementation introduces executable code, add a regression test first and follow RED → GREEN → REFACTOR.

# Architecture / proposed approach

Keep the ownership boundaries explicit: Hermes owns runtime settings and credential resolution, WSL owns process/filesystem/resource behavior, Copilot owns repository instructions/settings, and OpenCode owns its provider/model/auth files. Build a redacted field matrix from installed Hermes source, migrations, CLI behavior, and official docs; then apply only non-secret changes through validated interfaces and verify each layer before moving to the next. Repair Git transport/auth separately from repository content, preferring the already-authenticated GitHub CLI/SSH path over weakening workflow files or exposing tokens.

# Subgoals

1. Establish a reproducible, redacted baseline for Hermes, Git, WSL, Bun, Copilot, OpenCode, and the repository.
2. Research all 99 default top-level sections recursively, all 67 current top-level keys, dynamic MCP/platform/plugin fields, and relevant environment-variable bindings.
3. Produce and review a field matrix with source, type, default, current redacted state, decision, rationale, risk, and verification.
4. Apply justified Hermes changes with `hermes config set`; leave secrets and intentional defaults alone.
5. Verify the requested MCP capabilities: sequential thinking, filesystem, ast-grep, and memory.
6. Make WSL tool execution consistent without broadening filesystem or credential access.
7. Align Copilot/agent repository adapters and CI branch triggers without duplicating canonical rules.
8. Resolve the push rejection through a least-privilege authenticated transport and verify the remote branch by SHA.

# Linked Specs

A standalone executable specification is not created in this plan-only turn. Before Phase 3, the implementer must create:

- `/home/alexa/.hermes/specs/2026-10-07-hermes-config-wsl-agent-tooling/SPEC.md`

The spec must link back to this plan path, contain the final field-matrix acceptance criteria, and record any decision that changes the recommended defaults below. If the execution owner elects not to create the spec, record that exception in the verification evidence instead of pretending bidirectional coupling exists.

# Steps

1. Capture state and credential-safe metadata.
2. Research schema, defaults, migrations, runtime readers, provider behavior, MCP configuration, WSL configuration, Copilot settings, and OpenCode configuration.
3. Build the exhaustive redacted field matrix and resolve “keep/change/unset/conditional” decisions.
4. Apply Hermes configuration deltas through the CLI, one coherent batch at a time, with read-back after each batch.
5. Repair/verify WSL tool paths and only then change WSL settings that have a measured need.
6. Update repository-facing Copilot/agent adapters and CI triggers, then run all repository quality gates.
7. Fix Git authentication/transport, commit only reviewed repository changes, push `clean-development`, and read the exact remote ref back.
8. Run the final cross-system audit and report model/base URL/credential type without exposing a key.

# Todos

- [ ] Baseline and redacted metadata captured.
- [ ] Official/source research captured for every field category.
- [ ] Recursive field matrix complete: zero unclassified leaves.
- [ ] Config version and migrations checked.
- [ ] Non-secret config deltas applied and read back.
- [ ] Four requested MCP servers tested or blockers recorded.
- [ ] WSL/Bun/Copilot/OpenCode paths verified.
- [ ] Copilot adapters and CI branch behavior aligned.
- [ ] Local quality gates pass or have precise, pre-existing blockers.
- [ ] Git auth scope/transport fixed without exposing credentials.
- [ ] `clean-development` remote ref equals local `HEAD`.

# Phases

## Phase 0 — Baseline and safety gate

Entry: plan approved and execution explicitly started.

- TASK-001 (3 min, read-only): Run from `/mnt/c/Users/Alexa/playgrounds/Resume_maker`:
  `git status --short --branch && git remote -v && git log -5 --oneline --decorate --all`.
  Expected: clean `clean-development`, remote shown, recent commits recorded. Save output without secrets.
- TASK-002 (3 min, read-only): Run `hermes --version; hermes config path; hermes config env-path; hermes config check; hermes status; hermes config get model --json`.
  Expected: schema 50 is valid; model/provider/base URL are reported; key values are masked/absent. Never use `--raw`.
- TASK-003 (3 min, read-only): Record only metadata with `stat -c 'path=%n mode=%a size=%s mtime=%y' "$(hermes config path)" "$(hermes config env-path)" "$HOME/.hermes/auth.json"`.
  Expected: protected files exist or a precise missing-file result; no contents printed.
- TASK-004 (4 min, read-only): Run `hermes auth list`, `gh auth status --hostname github.com`, `copilot config --list --json`, and `copilot instruction list`; treat all credential values as sensitive even if a tool claims to redact them.
  Expected: provider/credential types and instruction sources only; no token text in evidence.

Gate 0: baseline commands exit successfully except known tool-specific blockers, and the plan records each blocker with command, path, exit code, and next action.

## Phase 1 — Exhaustive Hermes field research

Entry: Gate 0 passed.

- TASK-005 (5 min): Read `/home/alexa/.hermes/hermes-agent/hermes_cli/config_defaults.py`, `/home/alexa/.hermes/hermes-agent/cli-config.yaml.example`, `/home/alexa/.hermes/hermes-agent/hermes_cli/config.py`, and installed migration files. Use `search_files` for `DEFAULT_CONFIG`, `_config_version`, `migrate`, `read_user_config`, `mcp_servers`, `platforms`, and `providers`.
  Expected: source of truth, schema version, migration rules, dynamic-key readers, and write-routing rules are identified.
- TASK-006 (4 min): Fetch the current official references: `https://hermes-agent.nousresearch.com/docs/user-guide/configuration`, `/docs/user-guide/configuring-models`, `/docs/integrations/providers`, `/docs/reference/environment-variables`, and `/docs/llms.txt`.
  Expected: each URL is reachable or its failure is recorded; source checkout wins when docs and code disagree.
- TASK-007 (5 min): Enumerate default coverage from `config_defaults.py` and raw top-level coverage from the active config without printing values. Expected counts at planning time are 99 defaults and 67 raw keys; execution must record current counts rather than assume them.
- TASK-008 (5 min): Create the redacted matrix at `/home/alexa/.hermes/plans/2026-10-07-hermes-config-wsl-agent-tooling/verification/config-field-matrix.tsv`. For every leaf under the 99 default sections, every current raw leaf, every `providers.*`, `mcp_servers.*`, `platforms.*`, `plugins.*`, and every env-backed field, record:
  `path | source | type | built-in default | current state (redacted) | decision | rationale | risk | verification command | rollback`.
  Expected: no secret values, no blank decision cells, and no “unknown” without a follow-up source search.
- TASK-009 (4 min): Classify keys in `mcp_servers`, `platforms`, `providers`, `_left_core_scoped`, `_left_core_installed`, `group_sessions_per_user`, `known_*`, and other non-default sections against current readers/migrations. Expected: intentional compatibility keys are preserved; only proven-dead keys become `unset` candidates.

Field coverage must include, at minimum: model/provider/fallback/auth; database/runtime/session/attachments; agent/terminal/web/browser; MCP/tool output/loop guardrails/compression; auxiliary/display/dashboard/privacy; voice/STT/TTS/vision/wake word; memory/delegation/goals/loops/MoA; skills/curator/plugins/hooks/security/approvals; cron/kanban/gateway/streaming/sessions; telemetry/updates/LSP; vault/secrets; WSL-facing process/tool settings; and all provider/tool/messaging environment bindings.

Gate 1: the matrix has zero unclassified leaves, sources are authoritative, and every proposed change has an observable verification command.

## Phase 2 — Decisions, identity, MCP, and credential-safe integrations

Entry: Gate 1 passed.

- TASK-010 (4 min): Confirm identity with `hermes status` and `hermes config get model --json`; report `gpt-5.6-luna / openai-codex / https://chatgpt.com/backend-api/codex` only if the live output still matches. Report credential source as OAuth/auth-store-backed and explicitly state that the key is not disclosed.
- TASK-011 (4 min): Review the matrix for safe baseline deltas. Recommended invariants are `security.redact_secrets=true`, `security.allow_private_urls=false`, `security.protected_instruction_files=true`, `approvals.cron_mode=deny`, `approvals.single_query_mode=deny`, `approvals.unattended_mode=deny`, `hooks_auto_accept=false`, and `telemetry.shared_metrics.enabled/send=false`; write a value only when the live state differs and the matrix justifies it.
- TASK-012 (4 min): Review model and provider fields. Keep the current OAuth model unless the execution owner explicitly chooses a different model; never add `model.api_key`, `providers.*.api_key`, or `${...}` secret references merely to make the file look complete. Use `hermes model` for provider changes, not YAML edits.
- TASK-013 (5 min): Run `hermes mcp --help`, `hermes mcp list`, and `hermes mcp test` using the installed CLI syntax. Test the four requested capabilities: sequential-thinking, filesystem, ast-grep, and memory. Expected: each is enabled and returns a real success, or the exact unavailable server/error is recorded; do not install unpinned packages silently.
- TASK-014 (4 min): Audit each requested MCP block for transport, executable, arguments, allowed directory roots, environment references, timeouts, and package pinning. Filesystem access must be narrowed to `/mnt/c/Users/Alexa/playgrounds/Resume_maker` unless a separately approved use case requires more; never grant `C:/Users/Alexa` by default.
- TASK-015 (4 min): If any MCP server is missing, research its official package/source and use the current Hermes MCP management command; test after each server. If the live CLI has no safe add/update command, stop at a documented blocker rather than inventing YAML syntax.

Gate 2: model identity is verified, no key is exposed, requested MCP capabilities are tested or blocked with evidence, and the matrix has a reviewed final decision for every field.

## Phase 3 — Apply Hermes configuration safely

Entry: Gate 2 passed.

- TASK-016 (3 min): If `_config_version` is below the installed version, run `hermes config migrate` after reviewing its help; otherwise do not migrate. Expected: `hermes config check` reports the current schema as valid.
- TASK-017 (5 min per batch): Apply only matrix-approved non-secret changes with `hermes config set path value`. For lists/maps pass quoted JSON/YAML flow literals, for example `hermes config set platform_toolsets.line '["clarify", "file", "web"]'`. Never use `hermes config set` for secret env names in this run.
- TASK-018 (3 min per batch): Immediately read back each changed path with `hermes config get path --json` (without `--raw`), then run `hermes config check`. Expected: exact intended value, valid YAML/schema, no unexpected `.env` change.
- TASK-019 (4 min): Verify runtime consumers with `hermes status --full`, `hermes doctor`, `hermes tools`, and `hermes mcp list`; redacted output only. Expected: no parse errors, no silently ignored intended setting, and no provider/key disclosure.
- TASK-020 (4 min): Run a bounded smoke request: `hermes chat -q 'Respond with exactly: HERMES_CONFIG_SMOKE_OK'`. Expected: the sentinel appears and the command exits 0; if provider rate limits or auth fails, record the real error and do not call it a pass.

Gate 3: every applied config delta has a read-back, schema/doctor/status checks pass, and the smoke result is real or an explicit provider blocker.

## Phase 4 — WSL and toolchain hardening

Entry: Gate 3 passed.

- TASK-021 (4 min, read-only): Run `uname -a; cat /etc/os-release; wsl.exe --version; wsl.exe --status; wsl.exe --list --verbose; free -h; nproc; df -h "$HOME" /mnt/c`.
  Expected: WSL2/Kali state, CPU/RAM/disk headroom, and distro version are recorded. Decode Windows UTF-16 output if necessary; do not misclassify encoding as a failure.
- TASK-022 (3 min, read-only): Inspect `/mnt/c/Users/Alexa/.wslconfig` and `/etc/wsl.conf` only if present; record mode, size, and relevant sections. Do not print unrelated environment or credential files. Expected: existing settings are known before any edit.
- TASK-023 (4 min): Make the Bun command consistent. First verify `bun.exe --version` is 1.3.14. Prefer a native WSL Bun installation only if approved and supply-chain-checked; otherwise create the minimal user-scoped bridge `ln -sfn /mnt/c/Users/Alexa/.bun/bin/bun.exe /home/alexa/.local/bin/bun`, then verify `command -v bun; bun --version`. Expected: `bun` resolves to a deliberate path and reports 1.3.14+; do not add duplicate PATH entries.
- TASK-024 (5 min): Verify each tool from the same login shell: `command -v hermes; hermes --version; command -v copilot; copilot version; command -v opencode; opencode --version; command -v gh; gh --version; command -v bun; bun --version`. Expected: all required commands resolve consistently; failures name the owning install/config file.
- TASK-025 (4 min): Diagnose OpenCode without reading credentials: run `opencode auth list --print-logs`, `opencode models`, inspect only metadata for `$HOME/.config/opencode/`, `$HOME/.local/share/opencode/auth.json`, and `/mnt/c/Users/Alexa/.opencode/`. Expected: either a verified provider/model or a concrete exit-9 root cause. Do not create a project `opencode.jsonc` until a stable non-secret model/provider is confirmed.
- TASK-026 (4 min): Verify Copilot using `copilot config --list --json`, `copilot instruction list`, `copilot mcp list`, and the repository instruction files. Expected: secrets are redacted, canonical `AGENTS.md` is discovered, and no stale instruction source overrides it. Use `copilot login` only if auth is genuinely missing and only through its interactive flow.
- TASK-027 (5 min, conditional): If a durable Hermes gateway is required, enable systemd through `/etc/wsl.conf` using the official `[boot] systemd=true` setting, then run `wsl.exe --shutdown`, wait until `wsl.exe --list --running` is empty, reopen Kali, and verify `systemctl is-system-running`. If CLI/TUI use is sufficient, do not enable systemd just for completeness.
- TASK-028 (5 min, conditional): Tune `%UserProfile%\.wslconfig` only from measured resource pressure. Use WSL Settings or a documented `[wsl2]`/`[experimental]` change; do not guess RAM/CPU values. Preserve `localhostForwarding=true`, prefer `autoMemoryReclaim=gradual` when supported, and keep the project on `/mnt/c` unless a benchmark justifies a Linux-filesystem copy. Any `wsl --shutdown` requires an explicit impact note because it stops all distros.

Gate 4: `hermes`, `copilot`, `opencode`, `gh`, and `bun` resolve from the intended shell; WSL settings are either unchanged with evidence or changed with measured rationale and post-restart verification.

## Phase 5 — Repository agent adapters and CI

Entry: Gate 4 passed.

- TASK-029 (4 min): Update `copilot-instructions.md`, `.github/copilot-instructions.md`, and `.cursorrules` only to remove stale references and point to canonical `AGENTS.md`. Preserve DRY ownership: adapters may contain quick-start commands and links, not a second copy of all rules. Correct the `.cursorrules` quote-style conflict with Prettier (`double quotes`, not `single-quotes`) and keep LF line endings.
- TASK-030 (3 min): Decide CI branch policy. Recommended patch: in `.github/workflows/ci.yml`, change `push.branches` from `[development, production]` to `[clean-development, development, production]`; keep pull requests targeting `development` unless requirements say otherwise. Update `AGENTS.md` only if its CI description must reflect this intentional trigger change. Do not alter action permissions or remove the workflow.
- TASK-031 (3 min): Validate repository changes with `git diff --check`, `bun run typecheck`, `bun run lint`, `bun run lint:md`, `bun run lint:spell`, and `bun index.ts --skipProjects --format markdown --output /tmp/resume-maker-smoke`. Expected: all relevant commands exit 0; Markdown output exists; no PDF path is exercised. If `bun run build` is also run, record any known project-discovery behavior separately.
- TASK-032 (3 min): Validate workflow syntax with `actionlint .github/workflows/ci.yml` if installed; otherwise use the repository-approved YAML/action validator and record the tool/version. Expected: zero syntax errors; no claim of actionlint success when it is unavailable.

Gate 5: only intended repository files changed, adapters are DRY and accurate, CI syntax is valid, and all applicable project quality gates pass.

## Phase 6 — Commit, push, and remote verification

Entry: Gate 5 passed.

- TASK-033 (3 min): Review `git status --short`, `git diff --stat`, `git diff --name-status`, and `git diff -- . ':!output/**'`. Confirm no `.env`, auth store, WSL user config, generated output, or secret-bearing file is in the repository diff. Run a redacted secret scanner if installed; otherwise record it unavailable.
- TASK-034 (5 min): Fix Git transport without exposing credentials. Preferred path: run `gh auth setup-git`, then verify `git config --show-origin --get-regexp '^credential\.'` without printing helper secrets and run `git ls-remote origin HEAD`. If HTTPS still uses the rejected OAuth App, either reauthorize that OAuth App with `workflow` scope through its browser flow or configure the already-authenticated SSH path after verifying GitHub host keys. Never paste a token into a remote URL.
- TASK-035 (3 min): Before staging, verify exact scope. Then use either explicit paths or, only after the review passes, `git add -A`; immediately run `git diff --cached --name-status`, `git diff --cached --check`, and `git diff --cached --stat`. Expected: only the reviewed repository changes are staged.
- TASK-036 (2 min): Commit with `git commit -m 'chore: harden Hermes and agent tooling configuration'`. Expected: commit succeeds and `git status --short --branch` shows the intended local-ahead state. If the scope naturally separates into docs and CI commits, use `docs: align agent instructions` followed by `ci: run quality checks on clean-development` instead; do not mix unrelated changes.
- TASK-037 (3 min): Push exactly with `git push -u origin clean-development`. Expected: no OAuth workflow-scope rejection; remote reports the branch update. If it fails, stop and preserve the exact error; do not retry blindly.
- TASK-038 (3 min): Verify the effect with `git ls-remote origin refs/heads/clean-development` and compare the returned SHA to `git rev-parse HEAD`. Then run `gh run list --workflow ci.yml --branch clean-development --limit 1` if the workflow trigger was added. Expected: remote SHA equals local HEAD and a CI run is queued or completed.

Gate 6: local HEAD equals `origin/clean-development`, the exact push error is gone, and CI state is read back from GitHub.

## Phase 7 — Final audit and handoff

Entry: Gate 6 passed.

- TASK-039 (4 min): Re-run `hermes config check`, `hermes status`, `hermes config get model --json`, `hermes mcp list`, `wsl.exe --list --verbose`, `command -v` checks, and repository status. Expected: no new parse/auth/path regressions.
- TASK-040 (3 min): Complete the field matrix with actual post-change values only in redacted form, link each change to its verification output, and mark every rollback path.
- TASK-041 (3 min): Report active model, provider, base URL, and credential type/presence. State explicitly that the API/OAuth key value was not displayed or stored in the report.

Gate 7: every stated acceptance criterion has evidence, every blocker is explicit, and no secret value appears in the plan, repository diff, logs, or handoff.

# Subtasks

- Schema inventory: defaults → recursive leaves → current raw leaves → dynamic readers → migration/deprecation review.
- Provider inventory: model route → base URL → API mode → credential source → fallback/auxiliary behavior.
- MCP inventory: server ID → transport → command/package → args/allowed roots → env references → test result.
- WSL inventory: VM limits → distro settings → shell PATH → native/Windows tool boundary → restart verification.
- Repository inventory: canonical instructions → adapters → workflow triggers → quality gates → staged scope → remote SHA.

# Gates

| Gate | Required evidence |
|---|---|
| 0 | Clean baseline, protected metadata, real blocker log |
| 1 | Zero unclassified Hermes fields and authoritative sources |
| 2 | Safe model identity, MCP test results, no key disclosure |
| 3 | CLI read-backs, config check, doctor/status, smoke result |
| 4 | WSL/tool paths and any restart-required settings verified |
| 5 | Repo adapters, CI YAML, Bun quality gates verified |
| 6 | Push succeeded and remote ref SHA equals local HEAD |
| 7 | Final matrix, redacted identity report, no secret leakage |

# Checklists

## Research checklist

- [ ] Installed source and official docs agree or the disagreement is recorded.
- [ ] All 99 default top-level sections were traversed recursively.
- [ ] All 67 current top-level keys and all dynamic sections were classified.
- [ ] Environment variables were classified as secret, endpoint, setting, or process-only.
- [ ] Deprecated/legacy fields were not removed by guesswork.

## Security checklist

- [ ] No `.env`, `auth.json`, Copilot token, OpenCode credential, or Git token contents were read into evidence.
- [ ] No API key was added to YAML or a repository file.
- [ ] Redaction is enabled and private URL access remains deny-by-default.
- [ ] MCP filesystem scope is least privilege.
- [ ] Git auth uses a credential helper/SSH, never a token in a URL.

## Repository checklist

- [ ] `git diff --check` is clean.
- [ ] Typecheck, lint, Markdown lint, spell lint, and deterministic Markdown smoke pass.
- [ ] Workflow syntax is validated by a real validator or its absence is recorded.
- [ ] Only intended files are staged.
- [ ] Remote branch SHA equals local HEAD.

# Actions

Planning-time actions were read-only: repository files, Hermes help/status/config metadata, installed Hermes source/docs, WSL/tool version metadata, and official web references were inspected. No project file, Hermes config, `.env`, auth store, WSL config, credential, commit, or remote was modified in this turn.

# Needed specs

The execution owner must either create the linked `SPEC.md` before applying config changes or record a conscious exception. The spec must define the matrix schema, the exact non-secret deltas, MCP least-privilege roots, WSL decision thresholds, CI branch policy, and push acceptance criteria.

# Tests / validation

There is no application-code task in this plan, so a conventional TDD RED test is not required for the planned documentation/config changes. Every config delta follows a configuration TDD analogue: baseline check → one minimal change → CLI read-back → schema/doctor/status check → smoke test → commit. If a new script or application behavior is introduced, the implementer must first add a failing test, run it to demonstrate RED, implement minimally, run GREEN, refactor, run the full suite, and commit that atomic change before proceeding.

Required final command set (run after all edits, with real exit codes recorded):

```bash
cd /mnt/c/Users/Alexa/playgrounds/Resume_maker
bun run typecheck
bun run lint
bun run lint:md
bun run lint:spell
bun index.ts --skipProjects --format markdown --output /tmp/resume-maker-smoke
hermes config check
hermes status --full
hermes mcp list
git diff --check
git status --short --branch
git ls-remote origin refs/heads/clean-development
```

Expected: all applicable commands exit 0; `hermes config check` shows the installed schema as valid; status output is redacted; Markdown smoke output exists; the final remote SHA matches `git rev-parse HEAD`. A real provider, network, package, or authentication failure is reported as a blocker, not converted into a plausible success.

# Dependencies and risks

- Hermes CLI behavior and installed source are dependencies; the installed v0.21.5+ build is the authority for this run.
- Provider OAuth state, GitHub credential-helper state, and OpenCode/Copilot auth may be rate-limited, expired, or stored outside WSL. Re-authenticate only through interactive official flows.
- WSL changes can stop every running distro and can affect Docker, browsers, localhost forwarding, and Windows interop. Apply only measured changes and verify after restart.
- The repository on `/mnt/c` can be slower and has different file-permission semantics than the Linux filesystem. Moving it is out of scope; benchmark before recommending migration.
- Enabling every Hermes feature increases memory, prompt size, subprocess count, and supply-chain exposure. Keep defaults unless a measured use case justifies a change.
- `hermes config set` may route uppercase names to `.env`; treat any accidental `.env` write as a stop-and-restore event.
- GitHub’s `workflow` permission is distinct from repository write permission. A successful GitHub login is not proof that the current HTTPS credential can push workflow files.
- OpenCode currently exits 9 on `auth list`; do not create a project config until the root cause and provider are known.
- Bun is currently available as `bun.exe` but not `bun`; quality gates cannot be claimed until the command used by project docs is verified.

# Open questions and decisions

1. Should `clean-development` receive push CI? Recommended: yes, add it to `.github/workflows/ci.yml`; otherwise record why it is intentionally unbuilt.
2. Is a persistent Hermes gateway required? If yes, enable/verify WSL systemd; if no, avoid the restart and background-service complexity.
3. Should WSL use a Linux-native Bun install or the already-working Windows Bun bridge? Recommended first step: user-scoped `bun` bridge with no network install; adopt native Bun only if cross-boundary failures or performance justify it.
4. Which OpenCode provider/model is intended? Do not infer it from Hermes’ model; OpenCode has an independent provider/auth/config contract.
5. Should the requested MCP servers be project-local, profile-global, or both? Recommended: project-local filesystem root and profile-global capability definitions only when the user explicitly needs them.
6. Does the current GitHub CLI PAT have repository Actions-workflow write permission? Test via credential-helper/SSH transport; never print or inspect the token value.

# Verification evidence

Planning-time evidence is limited to read-only outputs captured during this turn: Hermes version/status/config path/schema check; resolved model/provider/base URL with `model.api_key` absent; raw/default top-level key counts; WSL/kernel/distro/tool versions; current repository branch/remote state; current workflow triggers; Bun/Copilot/OpenCode command availability; and the observed OAuth workflow-scope push rejection. No claim in this section means that implementation, tests, commit, push, or WSL mutation has completed.

# Rollback and completion

- Hermes: revert only through `hermes config set/unset` using the pre-change matrix and Hermes-managed config snapshots; never create ad hoc `.bak` files.
- MCP: remove only the specific server/config entry introduced by the execution, then re-run `hermes mcp list/test`.
- WSL: reverse only the exact lines/settings changed, restart the affected distro/VM, and verify the pre-change command outputs. `wsl --shutdown` is a host-wide impact and must be called out before use.
- Repository: use `git restore --staged`, `git restore`, or the prior commit before pushing; do not reset or rewrite history without explicit approval.
- Remote: if a push fails, leave local commits intact, preserve the exact error, and fix authentication/transport before retrying; never force-push.
- Completion means Gates 0–7 pass, the field matrix has no unclassified leaves, the remote ref equals local `HEAD`, and the final report discloses no secret value. Otherwise the task remains blocked with the precise evidence.
