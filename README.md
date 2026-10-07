# Resume_maker — Job Document Generator

> **Stack:** Bun / TypeScript | **Type:** Single-pipeline CLI | **Status:** Active

A single-pipeline CLI that reads structured JSON input and emits a job-hunting
document (Markdown + optional PDF) to `output/`. Resumes only — there is no
cover letter, LinkedIn, or interview-prep generator in code; those are
hand-authored sample artifacts.

## Technology Stack

| Category             | Technology                  |
| -------------------- | --------------------------- |
| Runtime              | Bun 1.3.14+ (Node fallback) |
| Language             | TypeScript ^5 (strict)      |
| PDF Generation       | markdown-pdf ^11.0.0        |
| Linting / Formatting | ESLint 10.x, Prettier 3.x   |
| Markdown Linting     | markdownlint-cli2           |
| Spell Checking       | cspell                      |

## Pipeline

```text
JSON Input File → index.ts (Entry Point)
                      ↓
              Generate Resume Markdown
                      ↓
              Save to output/<name>.md
                      ↓
              (format=pdf | both) markdown-pdf → output/<name>.pdf
```

The pipeline is deliberately linear: parse → auto-discover projects → generate →
format. There is no branching fan-out to multiple document types.

## Project Structure

```text
Resume_maker/
├── index.ts                    # CLI entry point + all logic
├── sample-input.json           # Sample input data
├── alexander-input.json        # Author's resume data
├── output/                     # Generated documents
│   ├── output_resume.md
│   └── output_resume.pdf
├── scripts/
│   └── smoke-resume.ts         # Smoke test script
├── updated_readmes/            # Generated README updates
├── docs/Project_Architecture/
└── application_materials/
```

## Getting Started

```bash
# Install dependencies
cd Resume_maker
bun install

# Generate documents from sample input (--skipProjects for deterministic output)
bun index.ts --input sample-input.json --skipProjects

# Generate with specific options (Markdown only — PDF is broken, see Extension Notes)
bun index.ts -i alexander-input.json -o resume -f markdown

# Run quality checks (CI runs the first two; lint:md/lint:spell are local-only)
bun run typecheck && bun run lint && bun run lint:md && bun run lint:spell
```

## CLI Commands

| Command                                            | Description                 |
| -------------------------------------------------- | --------------------------- |
| `bun index.ts --input <file.json>`                 | Generate from JSON input    |
| `bun index.ts -i <f> -o <name> -f <md\|pdf\|both>` | Output config               |
| `bun index.ts --skipProjects`                      | Skip project auto-discovery |
| `bun index.ts -p <dir>`                            | Projects directory          |
| `bun index.ts --help`                              | Display CLI help            |
| `bun run typecheck`                                | TypeScript type checking    |
| `bun run lint`                                     | ESLint + Prettier check     |
| `bun run lint:md`                                  | Markdown linting            |
| `bun run lint:spell`                               | Spell checking              |

### CLI Options

| Flag              | Short | Description                                                    |
| ----------------- | ----- | -------------------------------------------------------------- |
| `--input <file>`  | `-i`  | Input JSON file with resume data                               |
| `--output <name>` | `-o`  | Output filename (default: `output_resume`)                     |
| `--format <type>` | `-f`  | Output format: `markdown`, `pdf`, `both` (default: `markdown`) |
| `--projectsDir`   | `-p`  | Projects directory to auto-discover portfolio entries          |
| `--skipProjects`  |       | Disable auto-project discovery                                 |
| `--verbose`       | `-v`  | Verbose output                                                 |
| `--help`          | `-h`  | Show help message                                              |

### Auto-Discovery Behaviour (non-obvious default)

When `--skipProjects` is **not** passed, index.ts scans the **parent directory**
of the current working directory (`..`) for project folders and merges
discovered projects into the resume. There is no `../projects` directory in
this repo — the `--help` text in `index.ts` says `default: ../projects`, but
the code resolves to `..` at runtime:

| Scenario                                 | Projects scanned                                       |
| ---------------------------------------- | ------------------------------------------------------ |
| `bun index.ts` run in `Resume_maker/`    | `../` — merges sibling repos (~20 found on 2026-10-07) |
| `bun index.ts -p ../playgrounds/SandBox` | `SandBox` (git worktree, 2,612 dirty entries)          |
| `bun index.ts --skipProjects`            | none — clean resume                                    |

If you want the built-in `--help` to say `default: ..`, raise `showHelp()` by
one line. The code is left untouched in this pass.

## Coding Standards

- **ES Modules**: `"type": "module"`
- **TypeScript strict**: Full type safety
- **Entry point**: `index.ts` (main module)
- **Markdown linting**: Strict MD formatting rules
- **Output structure**: Generated files under `output/`
- **CLI conventions**: `--help`, `--input`, `--output`, `--format` flags

## Extension Notes

The generator produces a single document (resume). To add new output formats or
templates, edit `index.ts` directly — there is no plugin registry. PDF generation
spawns `bunx markdown-pdf` via `child_process`; on this machine the first
conversion can be unstable (chromium dependency), so PDF is opt-in and offline.

## License

MIT — © Alexander Iseghohi
