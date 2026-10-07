# Resume_maker — Job Documents Generator

**Generated:** 2026-07-25
**Status:** Active
**Path:** `projects/Resume_maker/`

---

## Architecture

| Property        | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| **Type**        | CLI document generator (JSON → Markdown + PDF)                          |
| **Pattern**     | Pipeline Processing — parse → validate → normalize → generate → convert |
| **Entry Point** | `index.ts`                                                              |

Generates job-hunting documents (resume, cover letter, LinkedIn guide, interview prep) from structured JSON input. Bun-first, zero framework dependencies.

---

## Technology Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| **Runtime**    | Bun 1.3.14+                               |
| **Language**   | TypeScript (strict)                       |
| **Output**     | Markdown + PDF (via `markdown-pdf`)       |
| **Validation** | Zod schemas in `validateResumeData()`     |
| **Linting**    | ESLint + Prettier + markdownlint + cspell |
| **Testing**    | Smoke test script + snapshot tests        |

---

## Project Structure

```text
Resume_maker/
├── index.ts                    # CLI entry point
├── generate-resume.ts          # Markdown generation
├── validate-resume-data.ts     # Zod validation
├── types.ts                    # TypeScript interfaces
├── package.json                # Bun config, scripts
├── tsconfig.json               # Strict TS config
├── .eslintrc.json              # ESLint flat config
├── .prettierrc                 # Prettier config
├── .markdownlint.json          # Markdown lint rules
├── cspell.json                 # Spell check config
├── sample-input.json           # Example input
├── alexander-input.json        # Real user data
├── output/                     # Generated documents
├── scripts/
│   └── smoke-resume.ts         # Smoke test
└── tests/
    └── snapshot/               # Markdown snapshot tests
```

---

## Commands

```bash
# Install
bun install

# Generate documents
bun index.ts --input sample-input.json
bun index.ts -i alexander-input.json -o resume -f both

# Flags
# -i, --input    : Input JSON file (required)
# -o, --output   : Output type (resume, cover-letter, linkedin, interview, all)
# -f, --format   : Output format (markdown, pdf, both)

# Quality
bun run typecheck && bun run lint
bun run lint:md
bun run lint:spell

# Test
bun run test                    # Smoke test
```

---

## Input Schema (Zod)

```typescript
// types.ts
interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website?: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string[];
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    honors?: string[];
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    cloud: string[];
    other: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}
```

---

## Output Documents

| Document           | Description                           |
| ------------------ | ------------------------------------- |
| **Resume**         | Professional resume with all sections |
| **Cover Letter**   | Tailored per job (template-based)     |
| **LinkedIn Guide** | Profile optimization checklist        |
| **Interview Prep** | STAR method questions + answers       |

---

## CI/CD

**Workflow:** `.github/workflows/resume-maker-ci.yml`
**Jobs:** TypeScript check → ESLint → Build test

---

## Vulnerabilities (July 2025)

| Package           | Severity | Issue                                           |
| ----------------- | -------- | ----------------------------------------------- |
| `markdown-pdf`    | HIGH     | XSS → local file read (GHSA-qghr-877h-f9jh)     |
| `qs`              | MODERATE | DoS via arrayLimit bypass (GHSA-6rw7-vpxm-498p) |
| `tough-cookie`    | MODERATE | Prototype pollution (GHSA-72xf-g2v4-qvf3)       |
| `brace-expansion` | HIGH     | DoS exponential expansion (GHSA-3jxr-9vmj-r5cp) |

**Action Required:** Replace `markdown-pdf` or upgrade when fixed.

---

## Related Projects

- **Bash** — Workspace automation toolkit (same Bun/TS stack)
- **uk-earnings-kit** — Uses similar CLI patterns
