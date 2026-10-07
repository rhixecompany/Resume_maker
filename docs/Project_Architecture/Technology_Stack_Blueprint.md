# Technology Stack Blueprint

## Project: Resume_maker — Job Docs Generator

> **Generated:** 2026-06-25
> **Generator:** technology-stack-blueprint-generator
> **Analysis Depth:** Comprehensive

---

## Overview

CLI tool that generates job-hunting documents (resume, cover letter, LinkedIn guide, interview prep) from structured JSON input to Markdown and PDF formats.

**Project Type:** CLI Tool (Document Generator)
**Stack Type:** Bun/TypeScript

---

## Technology Stack

### Languages & Runtimes

| Technology | Version | Usage |
| --- | --- | --- |
| TypeScript | ^5 (peer) | Primary language |
| Bun | latest | Runtime & package manager |
| Node.js | — | Fallback |

### Package Manager

| Tool | Version |
|---|---|
| bun | latest |

### Core Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| markdown-pdf | ^11.0.0 | PDF generation from Markdown |

### Development Dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| @types/bun | latest | Bun type definitions |
| @typescript-eslint/eslint-plugin | ^8.59.2 | TypeScript lint rules |
| @typescript-eslint/parser | ^8.59.2 | TypeScript parser |
| cspell | ^10.0.0 | Spell checking |
| eslint | ^10.3.0 | Linting framework |
| eslint-config-prettier | ^10.1.8 | ESLint/Prettier integration |
| eslint-plugin-prettier | ^5.5.5 | Prettier ESLint plugin |
| markdownlint-cli2 | ^0.22.1 | Markdown linting |
| prettier | ^3.8.3 | Code formatting |

---

## Licensing

| Component | License |
| --- | --- |
| Resume_maker | MIT |
| Author | Alexander Iseghohi |

---

## Scripts

| Script | Description |
| --- | --- |
| `build` / `start` | Run the generator with default input |
| `help` | Display CLI help |
| `lint` | ESLint + Prettier check |
| `lint:fix` | Auto-fix linting issues |
| `lint:md` | Markdown linting |
| `lint:spell` | Spell checking |
| `typecheck` | TypeScript type checking |

---

## Coding Conventions

- **ES Modules**: `"type": "module"`
- **TypeScript strict**: Full type safety
- **Entry point**: `index.ts` (main module)
- **Markdown linting**: Strict MD formatting rules
- **Output structure**: Generated files under `output/`
- **CLI conventions**: `--help`, `--input`, `--output`, `--format` flags

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Resume_maker CLI                         │
├─────────────────────────────────────────────────────┤
│  index.ts (entry)                                    │
│  ├── parse JSON input                                │
│  ├── generate Markdown documents                     │
│  │   ├── Resume                                      │
│  │   ├── Cover Letter                                │
│  │   ├── LinkedIn Guide                              │
│  │   └── Interview Prep                              │
│  └── export to PDF (via markdown-pdf)                │
├─────────────────────────────────────────────────────┤
│  Output: output/                                     │
│  Config: .markdownlint.json, .prettierrc             │
└─────────────────────────────────────────────────────┘
```

---

## Usage Patterns

- Primary: `bun index.ts --input <file.json> --output <dir> --format <both|md|pdf>`
- Sample: `bun index.ts --input sample-input.json`
- Pipeline: `bun run typecheck && bun run lint`
