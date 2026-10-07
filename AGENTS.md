# Resume_maker — AGENTS.md

Canonical, repo-local guidance for agents. Read this before changing anything.

Single-file Bun/TypeScript CLI: `index.ts` (~920 lines) reads a JSON input and writes a resume
Markdown file to `output/` (optional PDF). Parsing, validation, formatting, and the CLI all live in
that one file — there are no packages, plugins, or codegen.

## Commands (verified on Windows + Bun 1.3.14)

- `bun install` — install deps (`bun.lock`; bun is also the package manager)
- `bun run typecheck` — `tsc --noEmit`
- `bun run lint` — ESLint (`index.ts`, root `*.json`) + Prettier `--check` (root `*.ts *.json *.md`)
- `bun run lint:md` — markdownlint-cli2 over root `*.md`, config `.markdownlint.json`
- `bun run lint:spell` — cspell over root `*.ts *.md *.json`, config `.cspell.json`
- `bun run lint:fix` — ESLint + Prettier autofix (root files only)
- `bun run build` / `bun start` — runs `bun index.ts` with embedded sample data → `output/output_resume.md`
- `bun run help` — CLI help

Verification order before finishing any change:

```bash
bun run typecheck && bun run lint && bun run lint:md && bun run lint:spell
```

- All four lint scripts cover **root-level files only** — `scripts/`, `docs/`, `tests/`,
  `application_materials/`, and `updated_readmes/` are never linted by them.
- No test runner: `package.json` has no `test` script and there are no TS tests.
  `tests/pkg-mgmt/` is unrelated Python/bash tooling (pytest, run manually).

## Runtime gotchas (verified 2026-10)

- **PDF generation fails.** `-f pdf|both` spawns `bunx markdown-pdf`, which needs
  `phantomjs-prebuilt`; its binary install fails → exit 1 and a 0-byte `output/*.pdf`. Verify with
  Markdown only (`-f markdown`, the default). `README.html`'s "chromium" wording is outdated — it is
  PhantomJS-era.
- **`bun scripts/smoke-resume.ts` therefore fails** (it passes `-f both`); its Markdown half works.
- **Project auto-discovery runs by default and scans `..`** (parent of the cwd), merging sibling
  repos (~20 found on 2026-10-07) into the resume. `--help` says `default: ../projects`, but the
  code does `options.projectsDir || ".."`. Pass `--skipProjects` (or `-p <dir>`) for deterministic
  output.
- Other defaults from `parseCLIOptions()`/`main()`: `--format markdown` (not `both`),
  `--output output_resume`.

## CI

`.github/workflows/ci.yml`: push to `development` / `production`, PRs into `development`; runs only
`bun install`, `bun run typecheck`, `bun run lint`. The checkout sits on `clean-development`, which
CI does not build. `lint:md` and `lint:spell` are local-only — still run them.

## Documentation — trust order

1. **`index.ts`** is the source of truth for behavior, flags, and defaults.
2. **`README.md`** is the canonical user doc. Update it in the same change as any flag/behavior
   change, and verify it with the markdown gates above.
3. **Keep agent-facing files consistent:** this file, `copilot-instructions.md`,
   `.github/copilot-instructions.md`, `.cursorrules`. There is no workspace-root `AGENTS.md`;
   older copies of these pointed at one and at a "clarification / timestamped artifact protocol"
   that never existed here — do not reintroduce those references.
4. **Stale by design — do not treat as current:** `SPEC.md`, `PLAN.md`, `TECHNOLOGY_STACK.md`,
   `REPOSITORY_SUMMARY.md`, `AUDIT_Resume_maker.md`, `architecture.md`,
   `web-research-resume-maker.md`, `RESEARCH_REPORT.md`, `THE_STORY_OF_THIS_REPO.md`,
   `DOCUMENT.md`, plus `README.html` / `folder-structure.html` (unedited renders of older READMEs,
   no generator exists). Several describe a multi-document generator (cover-letter / LinkedIn /
   interview-prep modules) that does not exist in code. Never implement from them or "correct"
   `README.md` against them.
5. **Not project docs:** `updated_readmes/` (samples for other repos), `application_materials/`,
   `docs/` (hand-authored samples). `.hermes.md` is Hermes-runtime-only; leave it alone.

## Markdown conventions

- Prettier owns formatting (`.prettierrc.json`: 2-space, **double quotes**, semicolons, width 120)
  and checks root `*.md`; run `bun run lint:fix` after editing them.
- `lint:md` uses `.markdownlint.json` (line length 500, tables included) via its `--config` flag;
  `.markdownlint-cli2.jsonc` is overridden and does not apply.
- Add new domain words to `.cspell.json` `words` instead of inline disables.
- `output/` is gitignored — never commit generated documents.

## Other constraints

- No `.env` usage; writing `.env*` files is forbidden by repo rules.
- `pre-commit` hooks are defined in `.pre-commit-config.yaml`, but installation is unverified —
  run the bun gates yourself.
- `cliff.toml` is git-changelog config with no script wired to it; ignore unless asked.
