# Scope: Job-Ready GitHub Portfolio Builder


<One or two plain sentences: what the product is and who it serves.>

**Build approach:** Skateboard (ship the thinnest usable whole — working code + clean READMEs — then grow into full portfolio materials).

**Workflow:** Beta (after `/develop`, `/check verify` then `/test`; skips the extra model `/check review` and `/document` unless a feature needs it).

## At a glance

|| # | Feature | Phase | Status |
|---|---|---|---|
| 1 | Update university-libary-jsm README | Slice 1 | planned |
| 2 | Rewrite rhixe_scans README | Slice 1 | planned |
| 3 | Create xamehitv README | Slice 1 | planned |
| 4 | Enhance selenium_webdriver README | Slice 1 | planned |
| 5 | Update ecom README | Slice 1 | planned |
| 6 | Update rhixecompany README | Slice 1 | planned |
| 7 | Create unified resume + cover letter | Slice 2 | planned |
| 8 | Job recommendations | Slice 2 | planned |
| 9 | Interview preparation | Slice 2 | planned |
| 10 | Validate all READMEs for consistency | Slice 3 | planned |

## Foundational decisions

These are recorded in this scope for the build pass; decision details come from `AGENTS.md` and each feature's spec.

### Stack & architecture
The prompt is a doc-generation/portfolio task over 6 existing repos. No new stack decision is owed here — `banking` (the reference exemplar) is left untouched. Scope is README+materials work over each repo's existing runtime.

### Grok summary prompt
`grok_summary_prompt.md` (frontmatter Markdown) and `grok_summary_prompt.txt` (plain Markdown) are the user's source of truth. Both carry the same 5-task content. This scope maps that content to the 3-slice structure above; the canonical prompt files are not modified.

## Features

### 1. Update university-libary-jsm README · planned
**Intent:** replace the basic Next.js template README with a professional library management system doc that carries both technical and business value.
**Done when:** repo README at `university-libary-jsm/` follows the prompt's template, using the prompt's stated tech stack and features.
- [ ] Read existing README + repo to confirm the real tech stack before rewriting
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates (markdownlint, cspell)

### 2. Rewrite rhixe_scans README · planned
**Intent:** turn the 63-byte minimal README into a full professional doc.
**Done when:** repo README at `rhixe_scans/` is a complete, template-following doc.
- [ ] Read existing README + repo to confirm runtime before rewriting
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates

### 3. Create xamehitv README · planned
**Intent:** create a complete project doc for the TV streaming app from a blank/underspecified starting state.
**Done when:** repo README at `xamehitv/` is a complete, template-following doc.
- [ ] Read existing files + repo to confirm what actually exists before writing
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates

### 4. Enhance selenium_webdriver README · planned
**Intent:** elevate the basic README to one with examples and business value.
**Done when:** repo README at `selenium_webdriver/` follows the template and adds examples + business value.
- [ ] Read existing README + repo to confirm the real stack before enhancing
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates

### 5. Update ecom README · planned
**Intent:** turn the no-description e-commerce repo into a Django e-commerce doc.
**Done when:** repo README at `ecom/` follows the template, using the prompt's stated Django stack.
- [ ] Read existing files + repo to confirm the real stack before writing
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates

### 6. Update rhixecompany README · planned
**Intent:** produce a professional personal portfolio README for the un-described repo.
**Done when:** repo README at `rhixecompany/` follows the template.
- [ ] Read existing files + repo to confirm what actually exists before writing
- [ ] Draft per the prompt's README structure
- [ ] Verify markdown quality gates

### 7. Create unified resume + cover letter · planned
**Intent:** build the consolidated resume and cover letter from the prompt's templates.
**Done when:** resume + cover letter Markdown files exist in `output/` (or the repo's template location) and run through the quality gates.
- [ ] Gather the input data the prompt expects (alexander-input.json, basil-input.json, sample-input.json)
- [ ] Generate resume + cover letter per the prompt's templates
- [ ] Verify markdown quality gates

### 8. Job recommendations · planned
**Intent:** rank the 5 job categories the prompt names with the named platforms.
**Done when:** a short job-recs file exists and lists the 5 categories with platforms, from the prompt.
- [ ] Read the prompt's job list and platforms verbatim
- [ ] Write the job-recs file (no new platform research unless the user wants it)
- [ ] Verify markdown quality gates

### 9. Interview preparation · planned
**Intent:** capture the project-based / technical / behavioral questions the prompt says to prepare.
**Done when:** an interview-qa file exists listing the prompt's sample questions organized by type.
- [ ] Read the prompt's interview questions verbatim
- [ ] Write the interview-qa file organized by type (project / technical / behavioral)
- [ ] Verify markdown quality gates

### 10. Validate all READMEs for consistency · planned
**Intent:** confirm every README follows the same structure and the prompt's guidance (technical + business value, consistent sections).
**Done when:** all 6 READMEs pass the markdown quality gates and a consistency spot-check (same section order) returns clean.
- [ ] Run markdown lint over all 6 READMEs
- [ ] Spot-check section order across all 6
- [ ] Fix any failing file and re-lint

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

|| State | Set by | The feature shows |
|---|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` at spec capture | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

## Scope written to docs/scope/scope.md.
