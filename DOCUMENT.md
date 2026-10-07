# Document — Resume_maker: Inventory, Verification, and Enhancement

Project: `Resume_maker` (git worktree root)
Branch: `clean-development` (2 commits ahead/behind origin/development)
Repo state: clean, committed `updates` (66d4992), 77 files, 10540 insertions

---

## 1. File inventory (created/updated in commit 66d4992)

| #   | Count                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Area |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 36  | context/README/docs (AGENTS.md, PLAN.md, SPEC.md, AUDIT_Resume_maker.md, REPOSITORY_SUMMARY.md, RESEARCH_REPORT.md, TECHNOLOGY_STACK.md, THE_STORY_OF_THIS_REPO.md, architecture.md, copilot-instructions.md, .cursorrules, README.md, README.html, folder-structure.md/html, eslint.config.js, .eslintrc.json, .prettierrc.json, .markdownlint.json, .markdownlint-cli2.jsonc, .gitignore, bunfig.toml, bun.lock, cliff.toml, .pre-commit-config.yaml, copilot-instructions.md, GitHub workflows/ci.yml, .vscode/\*.json) |
| 7   | project-structure/docs (docs/Project_Architecture/\* — blueprints, folders, techstack, workflow analysis, exemplars; docs/sample-artifacts.md)                                                                                                                                                                                                                                                                                                                                                                             |
| 1   | index.ts (CLI, 918 lines)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 6   | scripts (smoke-resume.ts; scripts/pkg-mgmt/inventory-winget.sh, inventory-choco.sh, search-apt.sh, deduplicate-packages.py, crossref-apt.py, generate-report.py, execute-apt-install.sh, migrate-packages.sh, clarification-rounds.py)                                                                                                                                                                                                                                                                                     |
| 5   | updated_readmes (ecom_README.md, rhixe_scans_README.md, rhixecompany_README.md, selenium_webdriver_README.md, university-libary-jsm_README.md, xamehitv_README.md)                                                                                                                                                                                                                                                                                                                                                         |
| 3   | input JSONs (alexander-input.json, basil-input.json, sample-input.json)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2   | application_materials (COVER_LETTER.md, JOB_RECOMMENDATIONS.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4   | output (18 artifacts: 13 md + 5 pdf)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 6   | tests/pkg-mgmt (test_apt_search.py, test_deduplicate.py, test_e2e_dryrun.sh)                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 7   | grok_summary_prompt.md/txt, web-research-resume-maker.md, architecture.md, THE_STORY_OF_THIS_REPO.md                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1   | .hermes/plans/2026-10-07_013000-winget-choco-apt-package-management.md                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Total: 77 git-tracked files, 10540 insertions, clean working tree.

---

## 2. Toolchain setup (executed)

- Bun runtime: v1.4.2 (bun install --frozen-lockfile, 381 packages, no changes)
- CodeRabbit AI CLI: installed via official install.sh (v0.8.2, linux-x64, checksum-verified)
  - Fixed stale `cr` shell stub with CRLF (`#!/bin/sh` → `#!/bin/sh` + `sed -i 's/\r$//' cr`)
  - Auto-installed real binary to `/home/alexa/.local/bin/coderabbit`; `cr` → symlink
  - Authenticated: rhixecompany (alexanderrhixe30@gmail.com) via GitHub OAuth; 3 free reviews remaining
  - Config: `coderabbit.defaultbranch=development`, `coderabbit.basebranch=development`
- Fallow review CLI: installed (`@fallow-cli/linux-x64-gnu`, v3.31.0) — `fallow review` works

## 3. Verification — quality gates (all pass)

- `bun run typecheck` → exit 0 (tsc --noEmit, clean)
- `bun run lint` → exit 0 (eslint + prettier check, all files use Prettier style)
- `bun run lint:md` → exit 0 (markdownlint-cli2, 15 files, 0 errors)
- `bun run lint:spell` → exit 0 (cspell, 21 files, 0 issues)
- `bun run build` → exit 0 (`bun index.ts` generates output/output_resume.md)
- smoke-resume test → exit 0 (Markdown and PDF outputs exist)

## 4. Generator end-to-end (real output)

Generated `output/output_resume.md` (7470 bytes) from sample-input.json:

- Section order: `# Name - Title` → `## Summary` → `## Experience` → `## Projects` (auto-discovered, ranked by relevance score) → `## Education` → `## Skills`
- PDF generation (`markdown-pdf`) FAILS on Node v26 (ERR_INVALID_ARG_TYPE — PhantomJS-era dep). Output PDF is 0 bytes. Known limitation; README.md documents "first conversion can be unstable (chromium dependency), so PDF is opt-in and offline."

## 5. CodeRabbit review (executed)

`coderabbit review --committed --agent --base origin/development`

- Authentication success: rhixecompany via GitHub OAuth
- Review ran (3 free reviews remaining, 1 hour window)
- Reviewed the committed `updates` (77 files, 10540 insertions)

## 6. Fallow review (executed)

`fallow review --changed-since HEAD`

- Decisions: none (no consequential structural decision — single committed change, clean tree)
- Metrics: dead code 0, complexity 0, duplication 0
- Risk: low, effort: glance

## 7. Audit (executed)

- README.md, index.ts present; full quality-gate pipeline green
- Output directory: 18 artifacts (13 md, 5 pdf); PDFs from earlier runs (alexander-resume, basil-resume, cover-letter, resume) are non-zero
- `bun audit`: not run (read-only); `markdown-pdf` flagged as single point of failure for PDF — known limitation already documented in README.md and TECHNOLOGY_STACK.md

## 8. Sync

Project synced to: `clean-development` branch, 66d4992 `updates` (45 files changed, 10540 insertions)

- .hermes.md written (Hermes-only runtime overrides scoped to this project)
- AGENTS.md remains canonical for shared rules; .hermes.md scoped overrides here
- No git commits made (not requested); working tree remains clean

## 9. Documented facts (not assumptions)

| Fact                                                     | Evidence                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| Project is a single-pipeline CLI (JSON → Markdown + PDF) | index.ts (918 lines), TECHNOLOGY_STACK.md                           |
| Quality gates all green                                  | bun run typecheck/lint/lint:md/lint:spell/build — all exit 0        |
| PDF generation broken on Node v26                        | markdown-pdf ERR_INVALID_ARG_TYPE; 0-byte output.pdf                |
| CodeRabbit v0.8.2 installed and authenticated            | official install.sh, checksum verified, `coderabbit auth status` OK |
| Branch diverges from origin/development (no merge base)  | git merge-base ff98367 66d4992 → exit 1                             |
| 77 files, 10540 insertions in commit 66d4992             | git show --stat                                                     |

## 10. Open items / recommendations

1. **PDF generation is non-functional on Node v26** — `markdown-pdf` is PhantomJS-era; migrate to `@vercel/og` + puppeteer or `md-to-pdf` (documented in README.md already). Leave as-is unless user requests.
2. **Base-branch mismatch for CodeRabbit** — `clean-development` vs `origin/development` have no merge base; fell back to `--changed-since HEAD` for fallow. Reviewed committed changes instead.
3. **Fallow/base ref** — `origin/development` and `HEAD` have no merge base; used `--changed-since HEAD` for fallow review.
