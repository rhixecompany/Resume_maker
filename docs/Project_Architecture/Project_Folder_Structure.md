# Project Folder Structure Blueprint

## Project: Resume_maker — Bun/TypeScript Job Documents Generator

**Generated:** 2026-06-25
**Project Type:** Bun/TypeScript CLI Application
**Auto-detected:** Yes (Bun project — `bun.lock`, `package.json`, `tsconfig.json`, `eslint.config.js`)

---

## Directory Tree

```
Resume_maker/
├── .cspell.json
├── .github/
├── .gitignore
├── .markdownlint.json
├── .prettierrc.json
├── .vscode/
├── AGENTS.md
├── LICENSE
├── README.md
├── alexander-input.json
├── application_materials/
├── bun.lock
├── docs/
│   └── Project_Architecture/
├── eslint.config.js
├── grok_summary_prompt.txt
├── index.ts              # Main application entry point
├── output/               # Generated output files
├── package.json
├── sample-input.json
├── scripts/
├── tsconfig.json
└── updated_readmes/
```

---

## Naming Conventions

| Convention | Pattern | Examples |
| --- | --- | --- |
| **Directories** | kebab-case | `application_materials/`, `updated_readmes/` |
| **Source files** | kebab-case.ts | `index.ts` |
| **Config** | dotted-prefix | `.cspell.json`, `.prettierrc.json`, `.markdownlint.json` |
| **Documentation** | UPPER_CASE.md | `README.md`, `AGENTS.md`, `LICENSE` |
| **Input data** | kebab-case.json | `alexander-input.json`, `sample-input.json` |

---

## File Placement Patterns

- **Entry point**: Root-level `index.ts`
- **Output artifacts**: `output/`
- **Input data**: Root JSON files
- **Scripts**: `scripts/`
- **Application materials**: `application_materials/`
- **Generated READMEs**: `updated_readmes/`

---

## Project Type Indicators

| Indicator | Value |
| --- | --- |
| Has `package.json` | ✅ Node.js / Bun project |
| Has `bun.lock` | ✅ Uses Bun package manager |
| Has `tsconfig.json` | ✅ TypeScript |
| Has `eslint.config.js` | ✅ ESLint |
| Single-entry `index.ts` | ✅ CLI-style application |
| Spell check config | ✅ `.cspell.json` |

---

## Key Architecture Decisions

1. **Single-file entry point** — `index.ts` is the sole application entry point.
2. **Template-driven** — Uses JSON input (`sample-input.json`, `alexander-input.json`) to generate structured documents.
3. **Minimal dependencies** — Lightweight Bun project focused on document generation.
4. **Pre-commit quality** — Configured linting, formatting, and spell-check guards.
