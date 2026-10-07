---
title: WSL and agent-tooling configuration hardening (hermes, agent, copilot, opencode)
description: Plan for research-first hardening of WSL, Hermes, autonomous agent, Copilot, and OpenCode so tooling interoperates cleanly.
date: 2026-10-07
status: not_started
owner: implementer
---

# Rules

- Plan-mode only: create plan markdown and folders; do not edit project files, commit, push, or run mutating terminal commands in this turn.
- Do not print, copy, or persist any secret value. Always report no secrets are recorded.
- Preserve skill-typing exactly: `hermes skills list` (list), `hermes skills update {name} --force`, `hermes skills audit` for the scanned security audit, and `hermes plugins list`. Do NOT invent `hermes plugins audit {skill-name}` as an installed command; the installed CLI command is `hermes skills audit [--deep] [name]`, scoped to hub skills, and `hermes plugins` has no `audit` action (it has `doctor`).
- Update only what the installed CLI documents and only until it reports the desired result. `--force` overwrites locally edited hub installations; prefer non-destructive steps first.
- After every operation, re-run the verification commands and record real exit codes and output. Do not claim pass without the recorded output.

# Goal

Research and harden WSL, Hermes, autonomous agent, Copilot, and OpenCode configuration so the full agent-tooling stack interoperates cleanly and each can be verified without secrets.

# Current context / assumptions

Read-only discovery completed on 2026-10-07. Re-run the baseline commands at execution time; assumptions below are provisional until re-verified.

- WSL: Kali Linux 2026.3, WSL version 2.7.13.0, kernel 6.18.33.2-microsoft-standard-WSL2, Windows build 10.0.26100.1, MSYS2 1.6.11, distro `kali-linux` running.
- Host: Windows build 10.0.26100.14350 (`10.0.26100.9550` earlier). User home on Windows is `/mnt/c/Users/Alexa`; profile Linux home is `/home/alexa`.
- Host `.wslconfig` (WSL 2 VM level) is present at `/mnt/c/Users/Alexa/.wslconfig`: `[wsl2]` memory=2117074944, processors=4, debugConsole=true, networkingMode=Mirrored, defaultVhdSize=2064201547777, `[experimental]` bestEffortDnsParsing=true, sparseVhd=true, hostAddressLoopback=true. Distro-level `/etc/wsl.conf` sets `[boot] systemd=true`.
- Repo workspace: `/mnt/c/Users/Alexa/playgrounds/Resume_maker`; branch `clean-development`; remote `https://github.com/rhixecompany/Resume_maker.git`; upstream protection rejects GitHub Actions/OAuth App pushes to `.github/workflows/ci.yml` without `workflow` scope.
- Toolchain: `bun.exe` (Windows) at `/mnt/c/Users/Alexa/.bun/bin/bun.exe`, version 1.3.14; Linux `bun` command is absent; `node` at `/home/alexa/.hermes/tools/node-26.7.0-linux-x64/bin/node` (v26.7.0); `gh` 2.102.0; `hermes` at `/home/alexa/.local/bin/hermes` (v0.21.5+8490.g65bc672, schema 50 valid, config at `/home/alexa/.hermes/config.yaml`, `.env` at `/home/alexa/.hermes/.env`, auth at `/home/alexa/.hermes/auth.json`); `opencode` v2.0.18 at `/mnt/c/nvm4w/nodejs/opencode` (auth list exits 9); `copilot` binary present at `/home/alexa/.local/bin/copilot` (version/help output empty during capture).
- Hermes skill library: profile-local `/home/alexa/.hermes/skills` contains 1,259 `SKILL.md` files; 20 flat top-level skill directories are symlinks into `/home/alexa/.agents/skills` (proxying `agent-analytics`, `architect`, `audit`, `check`, `code-review`, `debug`, `deploy-to-vercel`, `develop`, `document`, `find-skills`, `scope`, `sync`, `test`, `vercel-cli-with-tokens`, `vercel-composition-patterns`, `vercel-optimize`, `vercel-react-best-practices`, `vercel-react-native-skills`, `vercel-react-view-transitions`, `web-design-guidelines`, `writing-guidelines`, `writing-plan`, `writing-prompt`, `writing-spec`, and others). `hermes skills list --source all` reports 42 hub-installed, 53 builtin, 1,154 local — 1,249 enabled, 0 disabled; `hermes skills check` reports five pending hub updates (`ast-grep`, `comfyui`, `kanban-video-orchestrator`, `pixel-art`, `excel-author`); `hermes skills list-modified --json` reports 37 user-modified bundled skills (all protected unless explicitly approved).
- Existing Hermes plan folder: `/home/alexa/.hermes/plans/2026-10-07-hermes-skills-inventory-audit-migration/` already contains `SPEC.md`, `verification/`, and scripts; this plan continues that work rather than duplicating it.
- Verified via `hermes config check` and redacted output: schema version 50 passes; resolved model is `gpt-5.6-luna` via `openai-codex` at `https://chatgpt.com/backend-api/codex`; `model.api_key` is not set and the active credential is OAuth-backed; `hermes status --full` reports provider `ChatGPT or Codex Subscription`, gateway stopped, no active sessions.
- No secrets are present in this plan, and none are recorded in verification paths.

# Architecture / proposed approach

Two interlocking tracks without cross-contamination. Track A (config hardening) in the Hermes/copilot/opencode profiles: run identity checks, redacted research rounds, and targeted config/toolchain changes with read-back, gate, and verification evidence per track. Track B (skills lifecycle) in the profile home: `hermes skills list` for the full inventory, then per-skill `hermes skills audit` for the installed hub security audit, `hermes skills update` for current hub updates, and dedupe/consolidate/enhance with category and folder alignment. The four requested MCP servers (`sequential-thinking`, `filesystem`, `ast-grep`, `memory`) are already listed as enabled; after any change, re-run `hermes mcp list` and `hermes mcp test <name>` for each. The unresolved blocker — GitHub OAuth App pushing workflow files without `workflow` scope, or SSH host-key verification, or a node path/copilot steward mismatch — is treated as an outside-in transport repair whose decision comes from the blocker evidence (never a workflow-file change).

# Subgoals

1. Capture redacted Hermes/WSL/Copilot/OpenCode identites and baselines.
2. Research current config-critical fields and installed-source contracts for all relevant sections.
3. Verify/fix WSL settings and configurations to accommodate Hermes, agent, Copilot, and OpenCode.
4. Reconcile project-context model and provider declarations with live config.
5. List, audit, update, dedupe, consolidate, and enhance the Hermes skill library — every step under verification receipts.
6. Repair or cleanly document the push-transport blocker with no workflow-file weakening.
7. Re-run all verification commands; record real exit codes and evidence; state what remains blocked.

# Steps

1. Baseline and identity.
2. Configure and cross-tool research.
3. Apply and verify WSL/agent/copilot/opencode best practices.
4. List the Hermes skill library and audit installed hub skills.
5. Update hub skills safely.
6. Deduplicate, consolidate, and enhance with category and folder alignment.
7. Repair and verify the push-transport blocker.
8. Final reconciliation.

# Todos

- [ ] Live identity and health baseline recorded (Hermes, WSL, Copilot, OpenCode, agent, repo).
- [ ] Redacted research results captured for config-critical and cross-tool fields.
- [ ] WSL config updated only where measured need is present, with restart/end-to-end verification.
- [ ] Hermes project context reconciled with live provider model.
- [ ] Skill library enumerated; all hub skills audited with real exit codes.
- [ ] Only documented, low-risk hub updates applied; modified local skills preserved or explicitly approved.
- [ ] Duplicates resolved; category/folder alignment applied with loader verification.
- [ ] Push blocker resolved without workflow or secret exposure; remote ref verified.
- [ ] Final verification all green or each blocker recorded with the exact evidence.

# Phases

## Phase 0 — Baseline and identity gate

Entry: plan finalized and execution explicitly started.

- TASK-001 (1 min, read-only): Run `hermes --version; hermes config path; hermes config env-path; hermes config check; hermes status; hermes status --full; hermes mcp list`.
  - Expected: schema 50 is valid; model/provider/base URL reported with `model.api_key` absent; gateway status and MCP list visible. Save exact output to `verification/phase0-hermes.txt` (redacted, secrets removed).
- TASK-002 (2 min, read-only): Run `hermes config get model --json; hermes config get model.provider; hermes config get model.default; hermes config get model.api_key; hermes config get security.redact_secrets; hermes config get security.allow_private_urls`.
  - Expected: `model.default`, `model.provider`, `model.base_url` shown; `model.api_key` is absent; redaction and private-URL settings verified. Never print or stage `auth.json`, `.env`, or token values.
- TASK-003 (2 min, read-only): Record tool identities: `command -v hermes cox pip; hermes --version` for host paths; `command -v bun bun.exe; bun --version` for correct shell; `command -v node; node --version`; `command -v gh; gh --version`; `command -v opencode; opencode --version`; `command -v copilot; copilot --version 2>&1 | head -5`; `bash --version | head -1`.
  - Expected: each command resolves from a named path; no duplicates introduced.
- TASK-004 (3 min, read-only): Record WSL and host config: `wsl.exe --list --verbose; wsl.exe --status`; host files `/mnt/c/Users/Alexa/.wslconfig` and `/etc/wsl.conf`; `wsl.exe --shutdown` only if a design decision says so (see blockers); `ssh -T git@github.com` and `ssh -T git@github.com` host-key state.
  - Expected: distro name, state, kernel, and config file contents are recorded. SSH host-key state is noted as a blocker if gate 0 fails.
- TASK-005 (3 min, read-only): Record Copilot/OpenCode/auth state: `gh auth status --hostname github.com`; `copilot version 2>&1` (diagnose empty output); `opencode auth list`; `opencode models` (diagnose exit 9).
  - Expected: GitHub account active; OpenCode auth exit code recorded; model list or exit 9 with explanation.

Gate 0: all five commands exit successfully, and tasks 1-5 are recorded. If any shows an access/path failure, record it as a blocker and re-run before proceeding.

## Phase 1 — Configure and cross-tool research

Entry: Gate 0 passed.

- TASK-006 (5 min): Research the installed `hermes config.yaml` and `config_defaults.py`. Load local source: `/home/alexa/.hermes/hermes-agent/hermes_cli/config_defaults.py`, `/home/alexa/.hermes/hermes-agent/cli-config.yaml.example`, `/home/alexa/.hermes/hermes-agent/website/docs/user-guide/configuration`, `/home/alexa/.hermes/hermes-agent/website/docs/reference/environment-variables`. Use `hermes config get <key> --json` for redacted reads and never load raw secrets.
  - Expected: full category coverage (model/provider/auth/runtime/terminal/web/browser/mcp/tool-output/loop-guardrails/compression/prompt-caching/openrouter/bedrock/auxiliary/display/dashboard/privacy/tts/stt/voice/vision/wake-word/human-delay/context/memory/delegation/prefill/goals/loops/moa/skills/curator/honcho/timezone/slack/discord/whatsapp/telegram/mattermost/matrix/approvals/command-allowlist/quick-commands/platform-hints/plugins/hooks/hooks_auto_accept/personalities/auth/security/cron/kanban/bot_mode/code_execution/tools/logging/model_catalog/model_overrides/models_dev/network/monitoring/gateway/streaming/sessions/onboarding/telemetry/doctor/updates/lsp/x_search/vault/secrets/paste_collapse_threshold/bot_desktop/computer_use/proxy/desktop/nous/vertex/local_runtime/_config_version) and dynamic roots (providers.<provider>, mcp_servers.<server>, plugins.enabled/disabled, group_sessions_per_user, thread_sessions_per_user, profile_routes, platforms.<platform>, known_plugin_toolsets, approval deny lists, security web blocklist).
  - Output: `verification/phase1-hermes-research.md` (redacted headings and types only).
- TASK-007 (4 min): Verify the cross-tool config contract in official docs: WSL (`hermes-agent.nousresearch.com/docs/user-guide/windows-wsl-quickstart`), MCP (`hermes mcp list`, `hermes mcp test <name>`, per-server `timeout`), Telegram (`telegram_bot` config holds token and allowed users), and security/privacy (`security.redact_secrets`, `security.allow_private_urls`, `security.protected_instruction_files`).
  - Expected: each linked page exists; correct commands are recorded; no secret values printed.
- TASK-008 (3 min): Diagnose the `opencode` auth exit 9 and Copilot tool state. Record the exact command, path, exit code, and next-action. If a provider authentication path is absent, note it without inventing a fix.
  - Expected: OpenCode auth diagnosis is complete and the root cause is recorded; Copilot is diagnosed or blocked with exact evidence.

Gate 1: all four tasks executed, redacted, and recorded. No change is made to config, tooling, or skill content in this phase.

## Phase 2 — WSL and agent-tooling configuration

Entry: Gate 1 passed.

- TASK-009 (3 min, read-only): Snapshot WSL memory, processors, and network state: `wsl.exe --shutdown` is a host-wide operation; take the baseline with `wsl.exe --list --verbose`, and record whether `debugConsole` or `hostAddressLoopback` needs tuning for localhost debugging.
  - Expected: baseline line saved to `verification/phase2-wsl-baseline.txt`.
- TASK-010 (4 min): Make WSL settings accommodate Hermes, agent, Copilot, and OpenCode. Valid targets from measured state:
  - `[wsl2] memory` and `processors` match the measured host profile (do not widen without a benchmark).
  - `hostAddressLoopback=true` only where a tool reaches Windows hosts; otherwise leave it untouched.
  - `networkingMode=Mirrored` only where needed; note the measured value so rollback is exact.
  - Keep `[experimental] bestEffortDnsParsing=true`, `sparseVhd=true`.
  - Do not add a distro-level `/home/alexa/.wslconfig` unless a tool requires it; if a change is needed, apply it and verify after a clean restart.
  - Expected: `verification/phase2-wsl-config.txt` contains exact old/new values and restart requirement.
- TASK-011 (4 min): Reconcile Hermes side. Decide whether to keep profile-level files (`/home/alexa/.hermes/config.yaml`, `.env`, `auth.json`) with the user’s approval. Under that scope, the non-secret changes this track may apply:
  - Verify the live identity: `model.default=gpt-5.6-luna`, `model.provider=openai-codex`, `model.base_url=https://chatgpt.com/backend-api/codex`.
  - Leave `model.api_key` unset; report credential type as OAuth and do not print the key.
  - Do not hand-edit `config.yaml`; use `hermes config set <path> <value>` for any change, quoting JSON/YAML for maps/lists.
  - Project-context reconciliation (recommended unless the user prefers to leave `.hermes.md` as the active contract): point the project `.hermes.md` at the live model/provider, or add a `.hermes.md` override that states “active profile model applies.” Record the decision in the same file; do not duplicate AGENTS.md.
  - Expected: `verification/phase2-hermes-config.txt` shows every applied value and the post-change `hermes config check` exit 0.
- TASK-012 (4 min): Reconcile the autonomous-agent profile and skills. Per installed source (`agent.skill_utils.get_skill_search_roots`, `tools/skills_tool._get_category_from_path`, `agent/skill_utils.VIOLATION_READ`), confirm:
  - Active skills dir: `/home/alexa/.hermes/skills`; external/project roots used by `hermes skills` are resolved from `hermes config get skills.external_dirs` if non-empty, else the default profile path.
  - Path-based category: `<skills-root>/<category>/<skill>/SKILL.md` reads `category` from `<category>` only when `<category>` is not a known skill name; keep it that way.
  - If explicit `/home/alexa/.agents/skills` or project-local `.hermes/skills` roots are used, add them via `hermes config set skills.external_dirs '["/home/alexa/.agents/skills"]'` or the exact list form, and record the config change.
  - Expected: config change is recorded and `hermes skills list --source all` still shows 1,249 enabled.

Gate 2: WSL config and Hermes side are verified with no secrets; profiles are sound; the repo project context is reconciled or the decision is explicit.

## Phase 3 — Skills lifecycle (list, audit, update, dedupe, consolidate, enhance)

Entry: Gate 2 passed.

- TASK-013 (4 min): Enumerate exactly, using the installed CLI and its own path resolution rather than a manual `find` (which misses symlinked proxies and external roots): `hermes skills list --source all` followed by one `hermes skills list --source <t>` per tier (`hub`, `builtin`, `local`). Count each tier and note the shell diff: CLI inventory vs `SKILL.md` files under the learned roots. Record all counts in `verification/phase3-skills-list.txt`.
- TASK-014 (for each hub skill, one command): Run `hermes skills audit [--deep] <name>`. This is the installed hub audit and its verdicts are: `ALLOWED`, `BLOCKED` (dangerous or caution), and `INFO` health checks. Capture exit code and verdict per skill.
  - Expected: each output line contains `name | exit_code | verdict` written to `verification/phase3-skills-audit.txt`.
  - Blocker: `hermes plugins audit <skill-name>` is not a valid command in this install (exit 2). Use `hermes skills audit` for hub security and `hermes plugins doctor --ci <id>` / `hermes plugins validate --json <path>` for plugins. Record the unsupported name under verification/phase3-commands.md.
- TASK-015 (for each named in `hermes skills check`): Run `hermes skills update <name> --force`. Record exit code, status, and whether files changed. Protect the 37 user-modified bundled skills listed by `hermes skills list-modified --json`; do not overwrite them unless target approval is explicit.
  - Expected: `verification/phase3-skills-updates.txt` contains one approved name per line with final status.
  - Blockers: for other skills, prefer `hermes skills check` first; if no update is needed, record `up_to_date` instead of running `--force` on a static list.
- TASK-016 (dedupe): Use the installed helper `hermes skills list-modified`, `hermes skills diff <name>`, and the profile’s dedupe utilities, then apply only what that tool set reports. Do a dry run first; if an artifact is needed, use a Python or shell script named `hermes-skills-dedupe-<date>.sh` that prints before/after counts, writes `verification/phase3-dedupe.txt`, and applies only the wins it reports.
  - Expected: `verification/phase3-dedupe.txt` lists removed/canonical pairs, reasons, and counts.
- TASK-017 (consolidate and enhance): For each remaining canonical skill, verify category validity with the installed loader: `hermes skills list --source local` (or exported JSON) and `hermes skills view <name>`. Decide mode per skill:
  - Valid and complete category: keep path bucket and top-level `category:` consistent.
  - Missing or malformed category: add `category: <approved-name>` with a supported value (lowercase letters, digits, underscores, hyphens, slashes allowed).
  - Missing/incomplete body: retain the supported pattern from `hermes skills view <name>` and `references/`; do not inject arbitrary content.
  - Duplicates or overlaps: merge the best copy, or remove one only when the loader confirms one is a shadow and the other is canonical.
  - Category folder migration: move packages only when the previous bucket is empty or unused, and re-validate with `hermes skills list --source all`.
  - Expected: final `hermes skills list --source all` shows the intended count; every changed skill passes `hermes skills view <name>`.
- TASK-018 (four requested MCP servers): Run `hermes mcp list` and then `hermes mcp test <name>` for `sequential-thinking`, `filesystem`, `ast-grep`, and `memory`. Confirm status enabled and test result success per server.
  - Expected: `verification/phase3-mcp.txt` shows each server, status, tool count, and test result.
  - If any server is missing, add it with `hermes mcp add <name> --url <endpoint>` or the documented command; do not add an uninstalled binary.

Gate 3: skill lifecycle is complete with evidence, and the four MCP servers are verified. No local skill is deleted without a recorded reason and a preserved recovery source.

## Phase 4 — Push-transport and repository blocker repair

Entry: Gates 0-3 passed; remote push is required.

- TASK-019 (2 min, read-only): Diagnose the exact push failure. Command: `git push -u origin clean-development`; capture exit code, remote rejection text, and branch config. Separately confirm credentials and transport: `gh auth status --hostname github.com`; `ssh -T git@github.com` with host key recorded; `git remote -v`.
  - Expected: error line is recorded verbatim; choice of HTTPS OAuth App scope vs SSH key pair vs PAT is decided.
- TASK-020 (2 min, read-only): For GitHub OAuth Apps pushing workflow files to GitHub, record the exact mechanism and legal scope, and identify the correct minimum scope (`workflow`). Check the GitHub object documentation for `workflow` scope in the `contents` / `workflows` permission family. Record the finding; do not mutate repo files.
  - Expected: `verification/phase4-push-blocker.md` has the exact command, exit code, remote rejection, and the documented scope recommendation.
- TASK-021 (2 min, read-only): Use a working transport that does not expose secrets. Options: reauthorize the current HTTPS credential with `workflow` scope via its browser flow, switch Git to SSH with a GitHub host key in `~/.ssh/known_hosts`, or set `GIT_SSH_COMMAND` to skip host key verification only in a disposable probe. Pick the least-privilege path the user approves.
  - Expected: push succeeds or a precise blocker remains with the exact error and next action.

Gate 4: the blocker is resolved by the recorded decision and, if pushing, the remote ref equals local `HEAD`.

## Phase 5 — Final reconciliation

Entry: Gates 0-4 passed; push and verification are complete.

- TASK-022 (5 min): Re-run the full verification set from the start of the session: Hermes identity and schema; WSL config; Copilot/OpenCode/auth diagnosis; skills list, audit, update, dedupe/consolidate/enhance, and the four MCP test results; push verification (remote SHA equals local HEAD).
  - Expected: one file (`verification/final-reconciliation.txt`) with all commands, exit codes, and output. If any step fails, record the failure and continue from its blocker.
- TASK-023 (3 min): Update `.hermes/plans/<slug>.md` status to reflect final state and record residual open questions. Run a final redacted audit for secrets: `hermes config get model.api_key`, `hermes config get security.redact_secrets`, `hermes status`, and reconcile the four MCP test results.
  - Expected: final file is written; no secret values appear in any output.

Gate 5: final reconciliation is complete, every count is reconciled with the live CLI, and the block report is written.

# Subtasks

- Baseline and identity (Hermes, WSL, agent, Copilot, OpenCode, plugin, repo).
- Research (installed schema + official docs + cross-tool diagnosis).
- WSL/agent/copilot/opencode config and verification.
- Skill lifecycle: list, audit, update, dedupe, consolidate, enhance.
- Push transport diagnosis and repair with no workflow weakening.
- Final reconciliation and redacted audit.

# Gates

| Gate | Required evidence |
|---|---|
| 0 | Clean identity baseline, schema 50 valid, MCP list visible |
| 1 | Config-critical research complete, cross-tool diagnosis complete |
| 2 | WSL config changed only where measured; Hermes profile reconciled |
| 3 | Skill lifecycle done with evidence; 4 MCP servers verified |
| 4 | Push blocker resolved; remote ref equals local HEAD |
| 5 | Final reconciliation complete; no secrets recorded |

# Checklists

## Identity and research checklist

- [ ] `hermes config check` exits 0 with schema 50.
- [ ] Live model identity and credential type recorded without printing a key.
- [ ] `hermes mcp list` shows `sequential-thinking`, `filesystem`, `ast-grep`, `memory` enabled.
- [ ] WSL `.wslconfig` and `/etc/wsl.conf` contents recorded.
- [ ] Copilot and OpenCode auth stated or diagnosed with exact exit code.
- [ ] Official docs verified for WSL, MCP, Telegram, security.

## WSL checklist

- [ ] Memory/processors match measured host profile.
- [ ] `hostAddressLoopback` touched only where a tool reaches Windows.
- [ ] Network mode logged so rollback is exact.
- [ ] No distro-level config added unless required.

## Skills checklist

- [ ] `hermes skills list --source all` counted.
- [ ] All hub skills run through `hermes skills audit` with exit code.
- [ ] `hermes skills update` run only for approved/current users; modified local skills untouched.
- [ ] Dedupe/consolidate applied with before/after counts.
- [ ] Every changed skill passes `hermes skills view`.
- [ ] `sequential-thinking`, `filesystem`, `ast-grep`, `memory` pass per-server test.

## Security and secrets checklist

- [ ] No key, token, or `.env` content in any file or output.
- [ ] `model.api_key` stays absent; credential type is OAuth.
- [ ] GitHub workflows are never weakened to satisfy push.
- [ ] Unsupported command (`hermes plugins audit`) is documented as not available, not treated as run.

## Repository checklist

- [ ] Remote ref SHA equals local HEAD after push.
- [ ] Repo files untouched (or scoped and agreed) during this plan.
- [ ] Every gate has raw command output recorded in `verification/`.

# Actions

Plan-only read-only evidence from this turn: `hermes` build v0.21.5+8490.g65bc672 with schema 50; config at `/home/alexa/.hermes/config.yaml`; `.env` and `auth.json` present but not read; skills root contains 1,259 `SKILL.md` files including symlinked flat containers; `hermes skills list --source all` shows 42 hub-installed, 53 builtin, 1,154 local; `hermes skills check` shows five update candidates; GitHub remote is present and branch `clean-development` is active.

No file, config, or remote changes were made in this turn. Deliverables (the plan markdown and its `SPEC.md` / `verification/` folders) are created ahead of execution.

# Needed specs

Spec file is at `/home/alexa/.hermes/specs/2026-10-07-hermes-skills-inventory-audit-migration/SPEC.md` (released above). It must link back to this plan and be used as the canonical acceptance record while Track A executes.

# Tests / validation

Identity/config and WSL changes follow a test-like cycle: baseline check → minimal change → read-back → schema/doctor/status verification. For skills, the TDD-analogue is per-skill: verify `hermes skills audit <name>` exit code, then update or leave `up_to_date`, then re-list and re-test. Coverage acceptance is `hermes skills list --source all`, `hermes skills check`, `hermes mcp test <name>` for each requested server, and the final repository diff count.

Required final command set:

```bash
hermes config check
hermes status --full
hermes mcp list
hermes skills list --source all
hermes skills check
hermes skills audit --deep <each-hub-name>
hermes mcp test <each-requested-name>
pip -V
git ls-remote origin refs/heads/clean-development
```

Expected: `hermes config check` exits 0; status and MCP list are redacted; skills and MCP counts reconcile; remote SHA matches local `HEAD`. A real provider, network, package, plugin, or auth failure is reported as a blocker, not converted into a plausible success.

# Dependencies and risks

- WSL context: `/etc/wsl.conf` already sets `systemd=true`; no `[wsl2]` change is needed unless a measured benchmark requires it.
- `opencode` auth exits 9 and `copilot --version` produced empty output; those are diagnostics, not a basis for inventing a fix.
- GitHub push to workflow files requires the `workflow` scope; the remote rejected the current OAuth App. Do not weaken the workflow file.
- `bun` is a Windows-path-only command here; the Linux shell uses `node` and `hermes`. Quality gates that assume a Linux `bun` will fail until an explicit bridge is added and measured.
- `hermes plugins` has no `audit` action; the installed security audit is `hermes skills audit`.
- A `git push` with an SSH key still requires a GitHub host key in `~/.ssh/known_hosts`.
- Pulling update bundles can fail when a hub-installed skill has local edits; see `hermes skills list-modified --json`.
- Skills-configuration repair is block-listed when a hub update connects to an external registry; do not force credentials or registry state.

# Open questions and decisions

1. Is WSL `memory`/processor tuning acceptable, or should `[wsl2]` keep the current values? Recommended default: leave as measured.
2. Should the Hermes `config.yaml` be edited through `hermes config set` even though the profile is fresh? Recommended: yes; hand-edits bypass schema normalization.
3. Should the project-context model be reconciled with the live OpenAI Codex model? Recommended: treat the live CLI config as truth and update `.hermes.md` to state that contract.
4. Is the push blocker a GitHub OAuth App scope problem or an SSH host-key problem? Recommended: confirm via `gh auth status` and SSH probe before any change.
5. Should the 37 user-modified skills be touched by `hermes skills update --force`? Recommended: no, unless a specific name is explicitly approved.
6. Should missing categories for local skills be derived from path or from a curated list? Recommended: derive from the physical path bucket when it differs, then verify with `hermes skills view`.

# Verification evidence

Read-only baselines captured during this turn: Hermes build and schema; live model/provider/base URL and absent `model.api_key`; Claude project context and instructions; WSL/host config files; GitHub CLI token type and active account; SSH key and host-key state. All values are redacted where applicable. The four MCP servers are enabled by `hermes mcp list`; a per-server `hermes mcp test` is the next verification step.

# Rollback and completion

Rollforward is the only supported path in this turn. Revert by re-running the exact command that produced a change, and record the pre-change receipt in `verification/`. `ssh-keygen -R github.com` can remove a poisoned host entry, then the key must be re-added. No commit or push is executed in this turn. Completion means every gate has evidence, counts reconcile with live CLI reads, and the block report is written. Until Gate 5 is recorded, state the outstanding blocker explicitly and stop.
