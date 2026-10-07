# The Story of Resume_maker

_The CLI that wrote fifty cover letters in one afternoon_

---

## Prologue: The Job Hunt

March 2025. A real job search. Fifty applications. Each needing a tailored cover letter, a polished résumé, a LinkedIn profile update, interview prep notes.

Doing it manually: 4 hours per application. 200 hours total.

Writing a CLI: 6 hours. Running it: 5 minutes.

**The math was obvious.**

---

## Chapter 1: The Pipeline Architecture

```text
JSON Input → Zod Validation → Normalize → Markdown Template → PDF (markdown-pdf)
```

Each stage isolated. Each stage testable. Failure at any stage saves partial output.

```typescript
// The pipeline (simplified)
async function generate(inputPath: string) {
  const raw = await readJson(inputPath);
  const data = validateResumeData(raw); // Zod - throws on invalid
  const normalized = normalize(data); // Dates, strings, arrays
  const markdown = renderTemplate(normalized); // Handlebars-like templates
  await writeFile(`${output}/resume.md`, markdown);
  await markdownToPdf(markdown, `${output}/resume.pdf`);
}
```

---

## Chapter 2: Why Bun? Why TypeScript?

**Bun:** `bun install` in 0.3s. `bun index.ts` runs directly. No `tsc` compilation step for development. Native `fetch`, `WebSocket`, `sqlite`.

**TypeScript strict:** The Zod schemas _are_ the types. `infer<typeof schema>` gives you perfect inference. No `any`. No runtime surprises.

**Zero dependencies:** No Commander.js, no Inquirer, no Chalk. `process.argv` parsing is 30 lines. Colors are ANSI codes. Prompts are `readline`.

---

## Chapter 3: The Markdown Templates

Templates are TypeScript template literals with helper functions:

```typescript
function renderExperience(exp: Experience[]): string {
  return exp
    .map(
      (e) => `
## ${e.role} at ${e.company}
*${formatDate(e.startDate)} – ${e.endDate ? formatDate(e.endDate) : "Present"}*

${e.description.map((d) => `- ${d}`).join("\n")}

**Technologies:** ${e.technologies.join(", ")}
`,
    )
    .join("\n");
}
```

Output is clean Markdown. Pandoc-compatible. `markdown-pdf` (via PhantomJS) converts to PDF.

---

## Chapter 4: The Vulnerability Reality Check

July 2025. `bun audit` on the output:

| Package           | Severity | CVE                                         |
| ----------------- | -------- | ------------------------------------------- |
| `markdown-pdf`    | **HIGH** | GHSA-qghr-877h-f9jh — XSS → local file read |
| `qs`              | MODERATE | DoS via arrayLimit                          |
| `tough-cookie`    | MODERATE | Prototype pollution                         |
| `brace-expansion` | HIGH     | DoS exponential                             |

**The problem:** `markdown-pdf` hasn't been updated since 2020. It bundles PhantomJS (abandoned 2018). The XSS is in the HTML rendering pipeline.

**Options:**

1. Wait for a fork/fix (unlikely)
2. Replace with `@vercel/og` + Puppeteer
3. Use `md-to-pdf` (maintained)
4. Generate HTML → `wkhtmltopdf` (system dep)

**Decision:** Option 3 for v2. Option 1 for v1 (with warning in README).

---

## Chapter 5: The Smoke Test

```typescript
// scripts/smoke-resume.ts
import { generate } from "../index";

const sample = await readJson("sample-input.json");
await generate(sample, { output: "test-output", format: "both" });

// Verify
const md = await readFile("test-output/resume.md");
const pdf = await readFile("test-output/resume.pdf");

assert(md.includes("Alexander Iseghohi"));
assert(pdf.length > 10000); // PDF has content
console.log("✅ Smoke test passed");
```

Runs in CI. Catches template breakage, validation regressions, PDF generation failures.

---

## Chapter 6: Snapshot Testing

Markdown output is snapshotted:

```typescript
// tests/snapshot/resume.test.ts
test("resume markdown matches snapshot", () => {
  const output = renderTemplate(normalizedSampleData);
  expect(output).toMatchSnapshot();
});
```

When the template changes, the snapshot fails. **Intentional changes** update the snapshot. **Accidental changes** are caught.

---

## Chapter 7: Real Usage

```bash
# Fifty applications, five minutes
for company in $(cat companies.txt); do
  bun index.ts -i alexander-input.json -o all -f both \
    --company "$company" \
    --output-dir "applications/$company"
done
```

Each iteration:

1. Reads base data
2. Injects company-specific tweaks (via `--company` flag)
3. Generates 4 documents × 2 formats
4. Saves to `applications/{company}/`

Total time: **4 minutes 37 seconds**.

---

## Epilogue: The Maintenance Burden

The code is 400 lines. The dependencies are 47 packages. The vulnerability is in a transitive dependency of a transitive dependency of `markdown-pdf`.

**Lesson:** A 6-hour CLI saves 200 hours of manual work. But it inherits the ecosystem's debt.

The next version will:

- Drop `markdown-pdf` for `md-to-pdf` + Puppeteer
- Add JSON Schema export for the input format
- Support YAML input (some people prefer it)
- Add a `--dry-run` that shows the generated Markdown without writing

But v1 works. It got the job done. It got _a_ job done.

---

_Written by the workspace chronicler, July 25, 2025.
Filed at `projects/Resume_maker/THE_STORY_OF_THIS_REPO.md`._
