# Resume_maker — Web Research Findings

> **Project:** Resume_maker — CLI document generator (JSON → Markdown + PDF)
> **Stack:** TypeScript (strict), Bun runtime, markdown-pdf
> **Date:** 2026-07-16
> **Sources:** Web search results, extracted articles (OneUptime, Strapi, DEV, Tech Insider, Angelo Lima, GitHub)

---

## Table of Contents

1. [Bun Runtime Overview & State in 2026](#1-bun-runtime-overview--state-in-2026)
2. [Performance & Optimization Tips](#2-performance--optimization-tips)
3. [CLI Application Best Practices (Bun)](#3-cli-application-best-practices-bun)
4. [TypeScript Strict Mode & Configuration](#4-typescript-strict-mode--configuration)
5. [Node.js/TypeScript Folder Structure Patterns](#5-nodejstypescript-folder-structure-patterns)
6. [Input Validation Best Practices (Zod)](#6-input-validation-best-practices-zod)
7. [Markdown → PDF Conversion Options](#7-markdown--pdf-conversion-options)
8. [Common Pitfalls with Bun](#8-common-pitfalls-with-bun)
9. [Security Considerations](#9-security-considerations)
10. [Similar Open-Source Projects](#10-similar-open-source-projects)
11. [Key Takeaways for Resume_maker](#11-key-takeaways-for-resume_maker)

---

## 1. Bun Runtime Overview & State in 2026

### Current State

- **Latest stable:** Bun v1.3.14 (May 2026). Bun 1.4 in canary with 32% less memory and 5× lower idle CPU usage.
- **Acquisition:** Anthropic acquired Bun in December 2025 — it now powers Claude Code. Remains MIT-licensed and open source.
- **Stars:** ~105,000 GitHub stars (Q1 2026), on par with Node.js.
- **Windows native:** Full native Windows support since v1.3.10, including ARM64.
- **Adoption:** ~28% of new JS projects on GitHub started with Bun in Q1 2026.

### Key Features Relevant to Resume_maker

- **Native TypeScript:** `bun run index.ts` — no `tsc` or `ts-node` needed. Full syntax support (enums, decorators, namespaces, parameter properties).
- **Built-in bundler:** `bun build ./index.ts --compile` produces a standalone executable (~60 MB).
- **Package manager:** `bun install` is ~5× faster than npm.
- **Built-in test runner:** Jest-compatible API (`describe`/`it`/`expect`) — no separate test framework needed.
- **90%+ Node.js API compatibility.** Most npm packages work out of the box.

### Bun vs Node.js for CLI Tools

| Factor                    | Bun                            | Node.js                                         |
| ------------------------- | ------------------------------ | ----------------------------------------------- |
| Cold start                | ~1.2 ms                        | ~45 ms                                          |
| TypeScript execution      | Native, full syntax            | Type stripping (no enums/namespaces by default) |
| Single-binary compilation | `bun build --compile` (stable) | SEA (experimental)                              |
| Package install speed     | ~5× faster                     | Baseline                                        |
| Ecosystem maturity        | Good (90%+ compatibility)      | Excellent (decade of hardening)                 |

**Verdict for Resume_maker:** Bun is an excellent choice for a CLI tool — fast cold start, native TypeScript, and single-binary distribution.

---

## 2. Performance & Optimization Tips

### Profiling Tools (Bun-Native)

```typescript
// Nanosecond precision timing
const start = Bun.nanoseconds();
// ... your code ...
const end = Bun.nanoseconds();
console.log(`Took ${(end - start) / 1_000_000}ms`);
```

- CPU profiling: `bun --inspect run server.ts` (WebKit Inspector)
- Markdown CPU profiles: `bun --cpu-prof-md script.ts`
- Heap snapshots: `bun --heap-prof script.ts`

### Startup Time Optimization

- **Lazy loading:** Import modules only when needed inside functions, not at module top-level.
- **Bun already fast:** Bun cold starts in ~1.2 ms vs Node's ~45 ms — for a CLI tool, this is already optimal.

### Memory Management

- Use **TypedArrays** for numeric data instead of regular arrays when dealing with large datasets.
- Beware of unbounded cache growth — use LRU caches with size limits.
- Bun uses ~25–40% less memory than Node for API servers.

### File System & I/O

- `Bun.file()` and `Bun.write()` are optimized for speed — prefer them over `fs` module.
- `Bun.spawn()` is faster than `child_process` for subprocess execution.

### Build Optimization

- `bun build --target=bun --minify --compile` produces optimized standalone binaries.
- Tree shaking is automatic.

### Benchmark Reality

- **Synthetic benchmarks:** Bun can be 4× faster than Node.js in raw HTTP throughput.
- **Real-world apps (with DB/routing):** The gap narrows to ~3% — but for CPU-bound tasks and package installs, Bun maintains a 2× advantage.

---

## 3. CLI Application Best Practices (Bun)

### Project Setup

```bash
bun init                    # Scaffolds package.json, tsconfig.json, index.ts
```

### CLI Entry Point with Shebang

```typescript
#!/usr/bin/env bun
// cli.ts
const args = Bun.argv.slice(2); // Remove 'bun' and script path
```

### Argument Parsing (Built-in)

```typescript
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    input: { type: "string", short: "i" },
    output: { type: "string", short: "o", default: "./output" },
    format: { type: "string", short: "f", default: "both" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
  allowPositionals: true,
});
```

### Subcommand Pattern

```typescript
type CommandHandler = (args: string[]) => Promise<void> | void;

interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

const commands: Command[] = [
  { name: "resume", description: "Generate resume document", handler: handleResume },
  { name: "cover-letter", description: "Generate cover letter", handler: handleCoverLetter },
];

async function main() {
  const args = Bun.argv.slice(2);
  const commandName = args[0];
  // ... dispatch to command handler ...
}
```

### Colorized Output (No Dependencies)

```typescript
const isColorSupported = process.stdout.isTTY;

export const colors = {
  red: (text: string) => (isColorSupported ? `\x1b[31m${text}\x1b[0m` : text),
  green: (text: string) => (isColorSupported ? `\x1b[32m${text}\x1b[0m` : text),
  yellow: (text: string) => (isColorSupported ? `\x1b[33m${text}\x1b[0m` : text),
  cyan: (text: string) => (isColorSupported ? `\x1b[36m${text}\x1b[0m` : text),
  bold: (text: string) => (isColorSupported ? `\x1b[1m${text}\x1b[0m` : text),
};
```

### Standalone Binary Distribution

```bash
# Compile to a single executable (no Bun/Node needed by user)
bun build --compile --target=bun-windows-x64 ./index.ts --outfile resume-maker

# Cross-compile targets:
#   bun-windows-x64          — Windows 64-bit
#   bun-linux-x64            — Linux 64-bit
#   bun-darwin-x64           — macOS Intel
#   bun-darwin-arm64         — macOS Apple Silicon
```

### Exit Codes

- `0`: Success
- `1`: General error / unknown command
- Use `process.exit(code)` for clean termination after error messages.

---

## 4. TypeScript Strict Mode & Configuration

### Current Project Config (Good Baseline)

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

### Recommended Enhancement

Consider enabling these additional flags for maximum safety:

| Flag                                       | Effect                                  | Recommendation                     |
| ------------------------------------------ | --------------------------------------- | ---------------------------------- |
| `noUnusedLocals: true`                     | Error on unused variables               | ✅ Enable (catches dead code)      |
| `noUnusedParameters: true`                 | Error on unused params                  | ✅ Enable (prefix unused with `_`) |
| `noPropertyAccessFromIndexSignature: true` | Force `obj["key"]` for index signatures | Optional                           |
| `exactOptionalPropertyTypes: true`         | Stricter optional property handling     | ✅ Enable for data processing      |

### Strict Mode Family (`strict: true` enables all)

- `strictNullChecks` — `null`/`undefined` are not assignable to everything
- `strictFunctionTypes` — Bivariant parameter checking
- `strictBindCallApply` — Correct `bind`/`call`/`apply` typing
- `strictPropertyInitialization` — Class properties must be initialized
- `alwaysStrict` — JS emits "use strict"
- `noImplicitAny` — Error on implicit `any`
- `noImplicitThis` — Error on `this` with implicit `any`

### ESLint with TypeScript (Already Configured)

The project already uses `@typescript-eslint` — ensure these rules are active:

```json
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/explicit-function-return-type": "warn",
"@typescript-eslint/no-unnecessary-type-assertion": "error",
```

---

## 5. Node.js/TypeScript Folder Structure Patterns

### Recommended: Feature-Based Organization (for larger projects)

```text
src/
├── cli/                    # CLI argument parsing, commands
│   ├── args.ts
│   └── commands/
├── documents/              # Document generation logic
│   ├── resume/
│   ├── cover-letter/
│   ├── linkedin-guide/
│   └── interview-prep/
├── templates/              # Markdown template strings
├── validation/             # Zod schemas for input validation
├── pdf/                    # PDF conversion utilities
├── utils/                  # Shared helpers
│   └── colors.ts
└── index.ts                # Entry point
```

### Current Project (Appropriately Simple)

For the current project's scope (single-file CLI tool with `index.ts` as entry), the flat structure works well. If the project grows, graduate to the feature-based pattern.

### Key Principle

**Separation of concerns:**

- CLI arg parsing → entry point
- Document generation → isolated modules per document type
- Validation → separate from business logic
- PDF conversion → wrapper around markdown-pdf

---

## 6. Input Validation Best Practices (Zod)

### Why Zod for Resume_maker

Zod is the industry-standard TypeScript-first validation library. Resume_maker reads structured JSON input — Zod ensures data integrity before processing.

### Basic Validation Example

```typescript
import { z } from "zod";

const ResumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  experience: z.array(
    z.object({
      company: z.string().min(1),
      title: z.string().min(1),
      startDate: z.string(),
      endDate: z.string().optional(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      degree: z.string(),
      year: z.string(),
    }),
  ),
  skills: z.array(z.string()),
});

type ResumeData = z.infer<typeof ResumeSchema>;

// Validate input
const result = ResumeSchema.safeParse(inputData);
if (!result.success) {
  console.error("Validation errors:", result.error.issues);
  process.exit(1);
}
// result.data is fully typed as ResumeData
```

### Why safeParse Over parse

- `safeParse` never throws — returns `{ success, data, error }`
- `parse` throws on invalid data — better for try/catch patterns
- For a CLI tool, `safeParse` is preferred for clean error reporting

### Integration with markdown-pdf

Zod schemas can be the single source of truth for data shapes used across all document generators — reuse the inferred type.

---

## 7. Markdown → PDF Conversion Options

### Current: `markdown-pdf` v11

The project already uses `markdown-pdf` (v11). This package:

- Uses `marked` (Markdown → HTML) + Puppeteer (HTML → PDF)
- Supports custom CSS styling
- CLI and programmatic API

### Alternatives & Considerations

| Library                    | Method                   | Pros                           | Cons                               |
| -------------------------- | ------------------------ | ------------------------------ | ---------------------------------- |
| **markdown-pdf** (current) | marked + Puppeteer       | Proven, customizable CSS       | Requires Chromium binary (~300 MB) |
| **md-to-pdf**              | marked + Puppeteer       | Similar, actively maintained   | Same Chromium dependency           |
| **Pandoc**                 | LaTeX/HTML engine        | Best output quality            | Heavy system dependency            |
| **Typst**                  | Native typesetting       | Modern, fast, beautiful output | Newer ecosystem                    |
| **Bun-native**             | Custom HTML → PDF via BC | No extra dep                   | Not yet built in                   |

### Performance Note

Puppeteer-based conversion (markdown-pdf) has a ~300 MB Chromium installation overhead and slower first-run startup. For a CLI tool users run infrequently, this is acceptable. For faster iteration, consider:

- **Two-phase output:** Always save Markdown first (fast), offer PDF as optional second step.
- **Caching:** Check if the Markdown hasn't changed before re-rendering PDF.

### CSS Customization for PDF

```css
/* PDF styles for markdown-pdf */
body {
  font-family: "Helvetica", "Arial", sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #333;
}
h1 {
  font-size: 18pt;
  color: #1a1a1a;
  border-bottom: 2px solid #333;
}
h2 {
  font-size: 14pt;
  color: #444;
}
@page {
  margin: 0.75in;
}
```

---

## 8. Common Pitfalls with Bun

### 1. PATH Not Refreshed After Install

**Problem:** `bun: command not found` after installation.
**Fix:** Run `source ~/.bashrc` (or `~/.zshrc`) or reopen terminal.

### 2. Windows Compatibility Issues

**Problem:** Some npm packages with native bindings don't work on Bun Windows.
**Mitigation:** Test all dependencies with `bun run` early. Most pure-JS packages work. Native C++ addons (node-gyp) may fail.
**Status:** The `markdown-pdf` package depends on Puppeteer which ships its own Chromium — this should work but test on Windows.

### 3. Open Issues Track Record

**Problem:** Bun had ~4,800+ open issues on GitHub (March 2026) — a high count for its user base.
**Mitigation:** Stick to well-tested APIs. Avoid edge-case features. Test thoroughly before releases.

### 4. `noUncheckedIndexedAccess` Surprises

**Problem:** Enabling this in tsconfig makes all index signatures return `T | undefined`, which can cause friction.
**Fix:** This is already enabled in the project. Use optional chaining (`?.`) or guard checks.

### 5. markdown-pdf Known Issues

- Puppeteer can fail in headless environments if system dependencies (libnss3, libx11) are missing.
- Large Markdown files may cause Puppeteer to timeout.
- **Windows:** Chromium launch paths can differ — test PDF generation on Windows specifically.

### 6. ES Module (`"type": "module"`) Gotchas

- Bun handles ESM natively — no `--experimental-modules` needed.
- But `require()` is not available in ESM context — use `import` everywhere.
- The project's `"type": "module"` in package.json is correct for Bun.

### 7. No Built-in `tsc` Type Checking

- Bun runs `.ts` natively but skips type checking for speed.
- **Always run `bun tsc --noEmit` in CI** — the project already has this as `typecheck` script.

---

## 9. Security Considerations

### For a CLI Tool (Resume_maker context)

Since Resume_maker is a local CLI tool processing user-provided JSON files, the threat model is limited but not zero.

### 1. Input Validation (Critical)

- **Always validate JSON input** before processing — malformed input could cause crashes or unexpected behavior.
- Use Zod schemas with `safeParse` — never trust raw input.
- Validate file paths in `--input`/`--output` flags — prevent path traversal attacks.

### 2. Path Traversal Protection

```typescript
import { resolve, relative } from "path";

function isWithinProjectDirectory(userPath: string): boolean {
  const resolved = resolve(userPath);
  const projectRoot = resolve(".");
  return relative(projectRoot, resolved).startsWith("..") === false;
}
```

### 3. Output File Safety

- Don't overwrite existing files without confirmation (or use `--force` flag).
- Validate output directory exists before writing.

### 4. Dependency Supply Chain

- **Use `bun install --frozen-lockfile` in CI** to prevent unexpected dependency updates.
- Regularly scan dependencies for known vulnerabilities (consider `bun audit` or `bun audit`).
- Pin exact versions in `package.json` for critical dependencies.

### 5. No Secrets in Code

- Never hardcode API keys, tokens, or credentials.
- Use environment variables or `.env` files for any secrets.
- Add `output/` to `.gitignore` (already done).

### 6. Markdown Injection

- If user-provided data is injected into Markdown templates, ensure proper escaping.
- Malicious Markdown could break PDF rendering or produce unexpected output.
- Escape special characters in user-provided text (names, descriptions, URLs).

### 7. Bun-Specific Security

- Bun uses binary dead-code elimination rather than runtime permission checks (Deno's model).
- This means: if a feature isn't compiled in, it can't be exploited — a different security philosophy.
- For a CLI tool processing local files, this is adequate.

---

## 10. Similar Open-Source Projects

### Resume Builders & Generators

| Project             | Stack                      | Approach                                                                                     |
| ------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| **OpenResume**      | React, Next.js, TypeScript | Web-based resume builder + parser. Most popular open-source option.                          |
| **Reactive Resume** | Vue.js, Node               | Open-source builder with clean PDF exports.                                                  |
| **JSON Resume**     | JSON Schema + CLI + themes | Schema-driven — define resume as JSON, render with themes. Similar approach to Resume_maker. |
| **RenderCV**        | Python (Typst)             | YAML → PDF. High-quality output but Python-based.                                            |
| **MarkdownResume**  | Markdown → PDF             | Write in Markdown, export ATS-friendly PDF. Conceptually closest.                            |

### Key Differences for Resume_maker

- **JSON Resume** uses a community schema — consider adopting it as input format.
- **MarkdownResume** focuses on Markdown-first — Resume_maker already does this.
- **RenderCV** uses YAML — Resume_maker uses JSON, which is more standard for programmatic input.
- None of the above use Bun — Resume_maker's Bun runtime is a differentiator.

### Inspiration from JSON Resume

JSON Resume's community-driven schema (`https://jsonresume.org/schema/`) is well-established. Consider aligning Resume_maker's input format with JSON Resume's schema for interoperability:

- `basics` (name, email, phone, summary)
- `work` (company, position, startDate, endDate, highlights)
- `education` (institution, area, studyType, startDate, endDate)
- `skills` (name, level, keywords)
- `projects`, `publications`, `volunteer`, etc.

---

## 11. Key Takeaways for Resume_maker

### What's Already Good

✅ **TypeScript strict mode** — enabled with `strict: true` and useful extras
✅ **Bun runtime** — fast cold start, native TS, ideal for CLI tools
✅ **Markdown-first output** — fast generation, Git-friendly
✅ **Input validation** — `validateResumeData()` already exists
✅ **Isolated document generation** — one failure doesn't block others
✅ **Linting pipeline** — ESLint, Prettier, markdownlint, cSpell all configured
✅ **MIT license** — permissive open-source

### Recommended Improvements

1. **Add Zod for input validation** — Replace or augment manual `validateResumeData()` with Zod schemas for type-safe, composable validation with clear error messages.
2. **Consider JSON Resume schema compatibility** — Align input format with the established JSON Resume standard for wider adoption.
3. **Add standalone binary distribution** — Use `bun build --compile` to distribute a single executable, no runtime required.
4. **Enable `noUnusedLocals` and `noUnusedParameters`** — Catch dead code and unused params at compile time.
5. **Add comprehensive error handling** — Centralized error handler, custom error classes, user-friendly messages.
6. **Consider PDF output optimization** — Remove Chromium dependency or offer PDF as optional with fallback to Markdown-only.
7. **Add `--version` flag** — Standard CLI convention.
8. **Add smoke tests with Bun's test runner** — Leverage `bun test` (no extra dependencies) for basic CI checks.
9. **DOCUMENT:** Cross-platform path handling — use `path.join()` / `path.resolve()` consistently for Windows compatibility.

### Resources

- [Bun Official Docs](https://bun.com/docs)
- [Bun CLI Applications Guide](https://oneuptime.com/blog/post/2026-01-31-bun-cli-applications/view)
- [Bun Performance Optimization](https://oneuptime.com/blog/post/2026-01-31-bun-performance-optimization/view)
- [Node.js Best Practices (Goldbergyoni)](https://github.com/goldbergyoni/nodebestpractices)
- [Zod Documentation](https://zod.dev)
- [JSON Resume Schema](https://jsonresume.org/schema/)
- [markdown-pdf npm](https://www.npmjs.com/package/md-to-pdf)
- [Bun vs Node.js 2026 Comparison (Strapi)](https://strapi.io/blog/bun-vs-nodejs-performance-comparison-guide)

---

_Research compiled from multiple sources including bun.sh, oneuptime.com, strapi.io, dev.to, tech-insider.org, angelo-lima.fr, and GitHub topic pages. All information reflects runtime/library versions as of mid-2026._
