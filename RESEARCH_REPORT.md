# RESEARCH_REPORT.md

## Project: Resume_maker

**Type:** CLI Document Generator (JSON → Markdown + PDF)
**Tech Stack:** Bun, TypeScript (strict), markdown-pdf (PhantomJS), ESLint 10 (flat config), Prettier, Markdownlint, CSpell
**Status:** Active

---

## Similar Projects

| Project         | Relevance                              |
| --------------- | -------------------------------------- |
| Bash            | Shared Bun/TypeScript CLI architecture |
| Python-projects | Shared document-generation patterns    |

---

## Key Findings

### Bun CLI Best Practices (2026)

- **Argument parsing** — Use `util.parseArgs` (built-in) or `meow`/`commander`
- **Single executable** — `bun build ./cli.ts --compile --outfile mycli`
- **Cross-platform** — `--target` flag for different OS targets
- **Signal handling** — trap SIGINT/SIGTERM for graceful cleanup
- **ES Modules** — Native support with `"type": "module"` in package.json

### markdown-pdf (PhantomJS) Deprecation

- PhantomJS **deprecated since 2018** — security vulnerabilities unpatched
- **Alternatives:** md-to-pdf (Puppeteer), direct Puppeteer conversion
- Current Markdown-first pattern (save .md before .pdf attempt) is correct fallback

### TypeScript Strict Configuration

| Flag                         | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `noUncheckedIndexedAccess`   | Catch undefined array/object access |
| `exactOptionalPropertyTypes` | Strict optional property handling   |
| `noUnusedLocals`             | Prevent dead code                   |
| `noUnusedParameters`         | Catch unused parameters             |

---

## Cheatsheets & Quick Reference

| Topic              | Resource                                                           | Type  |
| ------------------ | ------------------------------------------------------------------ | ----- |
| Bun CLI Guide      | <https://bun.sh/docs/bundler/executables>                          | Docs  |
| ESLint Flat Config | <https://eslint.org/docs/latest/use/configure/configuration-files> | Guide |
| markdownlint Rules | <https://github.com/DavidAnson/markdownlint>                       | Docs  |

---

## Best Practices

1. **Validate before processing** — Input validation (`validateResumeData()`) before generation
2. **Per-document isolation** — One failure doesn't block others
3. **PDF fallback to Markdown** — Always save Markdown first, then attempt PDF
4. **ESLint flat config** — Use `typescript-eslint` strict configs
5. **Compile to single binary** — `bun build --compile` for distribution

---

## Common Pitfalls

| Pitfall                   | Impact                     | Avoidance                                          |
| ------------------------- | -------------------------- | -------------------------------------------------- |
| PhantomJS in markdown-pdf | Security vulns, no updates | Migrate to Puppeteer-based solution                |
| ESLint + Bun mismatch     | Linting fails              | Use `bun --bun eslint .` or Node directly          |
| Late strict TS config     | Hard to add flags later    | Enable `noUnusedLocals` + `noUnusedParameters` now |

---

## Performance

1. **Single executable compile** — ~45MB binary avoids Bun runtime dependency
2. **Bun vs Node** — 4× faster startup for CLI tools
3. **Pipeline parallelism** — JSON → Markdown → PDF pipeline isolates slow PDF step
4. **Input caching** — Validate JSON once, generate multiple output formats

---

## Security

1. **Input validation** — Zod/schema validation prevents injection in output
2. **No eval/exec** — CLI processes static JSON, no dynamic code execution
3. **Markdown output sanitization** — Escape HTML in generated Markdown
4. **PhantomJS migration priority** — Unpatched CVE risk in current dependency

---

## Related Projects (in workspace)

- **Bash** — Shared Bun/TypeScript CLI patterns and tooling conventions
- **Python-projects** — Shared document-generation and output patterns

---

## Resources

| Resource                     | URL                                          |
| ---------------------------- | -------------------------------------------- |
| Bun Docs                     | <https://bun.sh/docs>                        |
| TypeScript Strict Config     | <https://www.typescriptlang.org/tsconfig>    |
| ESLint Docs                  | <https://eslint.org/docs/latest>             |
| md-to-pdf (migration target) | <https://github.com/simonhaenisch/md-to-pdf> |

### Research Methodology

- **Web search:** Tavily MCP, web_search
- **Framework docs:** Bun docs, TypeScript docs, ESLint docs
- **Last verified:** 2026-07-28
