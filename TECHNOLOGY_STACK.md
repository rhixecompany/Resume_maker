# 🏗 Technology Stack Blueprint - Resume_maker

**Project Path:** `projects/Resume_maker`
**Generated:** 2026-07-28
**Status:** Active — CLI Document Generator (JSON → Markdown + PDF)

---

## Core Technologies

| Category           | Technology          | Version | License      |
| ------------------ | ------------------- | ------- | ------------ |
| **Runtime**        | Bun                 | 1.3.14+ | MIT          |
| **Language**       | TypeScript (strict) | ^5      | Apache 2.0   |
| **PDF Generation** | markdown-pdf        | ^11.0.0 | BSD-2-Clause |
| **Validation**     | Manual (no zod)     | -       | -            |

---

## Dependencies

### Production (1 package)

| Package        | Version | Purpose                                    |
| -------------- | ------- | ------------------------------------------ |
| `markdown-pdf` | ^11.0.0 | Markdown → PDF conversion (uses PhantomJS) |

### Development (9 packages)

| Package                            | Version | Purpose                 |
| ---------------------------------- | ------- | ----------------------- |
| `@types/bun`                       | latest  | Bun type definitions    |
| `@typescript-eslint/eslint-plugin` | ^8.59.2 | ESLint TypeScript rules |
| `@typescript-eslint/parser`        | ^8.59.2 | ESLint TS parser        |
| `cspell`                           | ^10.0.0 | Spell checking          |
| `eslint`                           | ^10.3.0 | Linting                 |
| `eslint-config-prettier`           | ^10.1.8 | Prettier integration    |
| `eslint-plugin-prettier`           | ^5.5.5  | Prettier as ESLint rule |
| `markdownlint-cli2`                | ^0.22.1 | Markdown linting        |
| `prettier`                         | ^3.8.3  | Code formatting         |

### Peer Dependencies

| Package      | Version |
| ------------ | ------- |
| `typescript` | ^5      |

---

## Architecture

**Pipeline Processing Pattern:**

```text
JSON Input → Parse → Validate → Normalize → Generate Markdown → Convert to PDF
                      ↓
              (Per-document isolation - one failure doesn't block others)
```

### Entry Point

- `index.ts` — CLI with flags:
  - `-i, --input` — Input JSON file
  - `-o, --output` — Output directory (`output/`)
  - `-f, --format` — `markdown`, `pdf`, or `both`

### Document Types Generated

1. **Resume** — Professional experience, skills, education
2. **Cover Letter** — Tailored per application
3. **LinkedIn Guide** — Profile optimization checklist
4. **Interview Prep** — STAR method questions, company research

---

## Project Structure

```text
Resume_maker/
├── index.ts                 # CLI entry point
├── src/
│   ├── generators/         # Per-document generators
│   │   ├── resume.ts
│   │   ├── cover-letter.ts
│   │   ├── linkedin-guide.ts
│   │   └── interview-prep.ts
│   ├── validators/         # Input validation
│   │   └── validateResumeData.ts
│   ├── normalizers/        # Data normalization
│   │   └── normalizeData.ts
│   ├── converters/         # Format conversion
│   │   └── markdownToPdf.ts
│   └── utils/              # Shared utilities
├── templates/              # Markdown templates
│   ├── resume.md.hbs
│   ├── cover-letter.md.hbs
│   └── ...
├── output/                 # Generated files (gitignored)
├── scripts/
│   └── smoke-resume.ts     # Smoke test
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── .markdownlint.json
├── cspell.json
└── bun.lock
```

---

## Commands

```bash
# Install
bun install

# Generate all documents (both formats)
bun index.ts -i sample-input.json -o output -f both

# Generate specific document
bun index.ts -i alexander-input.json -o resume -f markdown

# Help
bun index.ts --help

# Quality gates
bun run typecheck      # tsc --noEmit
bun run lint           # ESLint + Prettier check
bun run lint:fix       # Auto-fix
bun run lint:md        # markdownlint
bun run lint:spell     # cspell
```

---

## Input Schema (JSON)

```json
{
  "personal": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "location": "City, State",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe",
    "website": "johndoe.dev"
  },
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "company": "Tech Corp",
      "role": "Senior Engineer",
      "startDate": "2022-01",
      "endDate": "Present",
      "description": "Led team of 5...",
      "technologies": ["TypeScript", "React", "Node.js"],
      "achievements": ["Reduced latency 40%", "Mentored 3 juniors"]
    }
  ],
  "education": [...],
  "skills": {
    "languages": ["TypeScript", "Python"],
    "frameworks": ["React", "Next.js"],
    "tools": ["Docker", "AWS"]
  },
  "projects": [...],
  "certifications": [...]
}
```

---

## Output Examples

### Markdown (Resume)

```markdown
# John Doe

Software Engineer | john@example.com | +1-555-123-4567
[LinkedIn](linkedin.com/in/johndoe) | [GitHub](github.com/johndoe)

## Summary

Experienced software engineer...

## Experience

### Tech Corp — Senior Engineer

_Jan 2022 – Present_

- Led team of 5 engineers...
- **Technologies:** TypeScript, React, Node.js
- **Achievements:**
  - Reduced API latency 40% via caching
  - Mentored 3 junior engineers
```

### PDF

Generated via `markdown-pdf` (PhantomJS-based), preserves markdown styling.

---

## Coding Conventions

| Convention     | Standard                                    |
| -------------- | ------------------------------------------- |
| **Runtime**    | Bun (no Node.js)                            |
| **TypeScript** | Strict mode, no `any`                       |
| **Modules**    | ESM (`import`/`export`)                     |
| **Formatting** | Prettier (2-space, single quotes)           |
| **Linting**    | ESLint + Prettier + cspell                  |
| **Markdown**   | markdownlint-cli2                           |
| **Tests**      | Smoke test only (`scripts/smoke-resume.ts`) |

---

## CI/CD

**Workflow:** `.github/workflows/resume-maker-ci.yml`

```yaml
- bun install
- bun run typecheck
- bun run lint
- bun run lint:md
- bun run lint:spell
- bun index.ts -i sample-input.json -o test-output -f both
- Verify output files exist
```

---

## Known Limitations

| Issue                                    | Workaround                                                            |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `markdown-pdf` uses deprecated PhantomJS | Consider migrating to `@vercel/og` + puppeteer or `markdown-pdf` fork |
| No zod validation                        | Add zod schemas for input validation                                  |
| Single-threaded generation               | Parallelize document generation for speed                             |
| No HTML output option                    | Add HTML template + `marked` parser                                   |

---

## License

MIT

---

_Generated by Hermes Agent Technology Stack Blueprint Generator_
