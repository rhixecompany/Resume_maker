# Resume_maker Architecture Blueprint

> **Project:** Resume_maker  
> **Type:** CLI Document Generator  
> **Architecture Pattern:** Pipeline Processing  
> **Entry Point:** `index.ts`  
> **Generated:** 2026-07-24

---

## 1. Architectural Overview

Resume_maker is a **single-entry, pipeline-processing CLI application** that transforms structured JSON input into professional job-hunting documents (resume, cover letter, LinkedIn guide, interview prep). It follows a `parse → validate → normalize → generate → convert` pipeline with isolated per-document generation.

### Key Design Characteristics

| Aspect | Decision |
| --- | --- |
| **Deployment** | Single-file CLI tool (no server, no daemon) |
| **Entry Strategy** | Single entry point (`index.ts`) — Bun-native execution |
| **Processing Model** | Synchronous pipeline with async I/O for file ops |
| **Isolation Model** | Per-document generation failures don't block other docs |
| **Extensibility** | Add new formatters for new document types |
| **Portability** | Bun runtime handles TS transpilation — no separate build step |

---

## 2. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Pipeline Processing                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────┐ │
│  │  PARSE   │→ │ VALIDATE │→ │NORMALIZE  │→ │  GENERATE  │→ │  CONVERT    │ │
│  │ CLI args │  │ Resume   │  │ process-  │  │ Markdown   │  │ Markdown →  │ │
│  │ + JSON   │  │ Data     │  │ UserInput │  │ Formatters │  │ PDF (opt.)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Pipeline

```mermaid
flowchart LR
    A[CLI Parsing<br/>parseArgs] --> B[File Loading<br/>Bun.file.text]
    B --> C[Data Validation<br/>validateResumeData]
    C --> D[Data Normalization<br/>processUserInput]
    D --> E[Markdown Generation<br/>generateResumeMarkdown]
    E --> F{Format?}
    F -->|markdown| G[Write .md file]
    F -->|pdf| H[Write .md →<br/>markdown-pdf]
    F -->|both| G
    G --> H

    style A fill:#e1f5fe,stroke:#0288d1
    style B fill:#e1f5fe,stroke:#0288d1
    style C fill:#fff3e0,stroke:#f57c00
    style D fill:#fff3e0,stroke:#f57c00
    style E fill:#e8f5e9,stroke:#388e3c
    style F fill:#f3e5f5,stroke:#7b1fa2
    style G fill:#fce4ec,stroke:#c62828
    style H fill:#fce4ec,stroke:#c62828
```

### Detailed Processing Flow

```mermaid
sequenceDiagram
    participant User as User CLI
    participant Index as index.ts (Main)
    participant Validate as validateResumeData
    participant Process as processUserInput
    participant Gen as generateResumeMarkdown
    participant FS as Filesystem
    participant PDF as markdown-pdf

    User->>Index: bun index.ts -i data.json -f both
    Index->>Index: parseCLIOptions()
    Index->>FS: read JSON input file
    FS-->>Index: raw ResumeData
    Index->>Validate: validateResumeData(data)
    Validate-->>Index: ValidationResult
    alt Validation failed
        Index->>User: Error with field list
    else Valid
        Index->>Process: processUserInput(data)
        Process-->>Index: normalized ResumeData
        Index->>Index: discoverProjects() (optional)
        Index->>Gen: generateResumeMarkdown(data)
        Gen->>Gen: formatContactSection
        Gen->>Gen: formatSummarySection
        Gen->>Gen: formatExperienceSection
        Gen->>Gen: formatProjectsSection
        Gen->>Gen: formatEducationSection
        Gen->>Gen: formatSkillsSection
        Gen-->>Index: complete Markdown string
        Index->>FS: saveResumeToFile(md)
        Note over Index,FS: output/output_resume.md
        alt PDF requested
            Index->>PDF: convertToPDF(mdFile, pdfFile)
            PDF-->>Index: PDF generated
            Index->>FS: output/output_resume.pdf
        end
        Index-->>User: Output paths
    end
```

---

## 3. Component Architecture

```mermaid
graph TD
    subgraph "CLI Layer"
        A[parseCLIOptions] --> B[showHelp]
        A --> C[main]
    end

    subgraph "Data Layer"
        D[loadResumeDataFromFile]
        E[createSampleResumeData]
        F[discoverProjects]
    end

    subgraph "Validation Layer"
        G[validateResumeData]
        H[ValidationResult]
    end

    subgraph "Processing Layer"
        I[processUserInput]
        J[normalizeText]
        K[extractSummaryFromReadme]
        L[extractRepositoryFromReadme]
        M[inferStack]
        N[mergeProjects]
    end

    subgraph "Generation Layer"
        O[generateResumeMarkdown]
        P[formatContactSection]
        Q[formatSummarySection]
        R[formatExperienceSection]
        S[formatProjectsSection]
        T[formatEducationSection]
        U[formatSkillsSection]
    end

    subgraph "Output Layer"
        V[saveResumeToFile]
        W[convertToPDF]
    end

    C --> D
    C --> E
    C --> F
    C --> I
    C --> O
    D --> I
    O --> G
    O --> P
    O --> Q
    O --> R
    O --> S
    O --> T
    O --> U
    I --> G
    F --> K
    F --> L
    F --> M
    F --> N
    G --> H
    O --> V
    O --> W

    style A fill:#bbdefb,stroke:#1565c0
    style G fill:#fff9c4,stroke:#f9a825
    style O fill:#c8e6c9,stroke:#2e7d32
    style W fill:#f8bbd0,stroke:#c62828
```

### Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `parseCLIOptions` | Parse `--input`, `--output`, `--format`, `--projectsDir`, `--skipProjects`, `--verbose`, `--help` flags via Node.js `util.parseArgs` |
| `validateResumeData` | Check required fields (name, title, summary, experience, education, skills, contact). Returns `{isValid, errors}` |
| `processUserInput` | Normalize input: trim whitespace, set defaults for missing optional fields |
| `generateResumeMarkdown` | Orchestrate section formatters into a complete Markdown document. Validates before generation |
| `format{Section}Section` | Six standalone formatting functions, each producing a Markdown subsection |
| `discoverProjects` | Walk sibling directories, read README.md, infer tech stack, extract repo URLs, apply curated descriptions |
| `convertToPDF` | Shell out to `bunx markdown-pdf` for PDF conversion |
| `saveResumeToFile` | Write UTF-8 Markdown to `output/` directory using `Bun.write` |

---

## 4. Data Model

```typescript
// Core domain types — all exported for external use
interface ContactInfo {
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    website?: string;
}

interface Experience {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrentRole?: boolean;
    highlights: string[];
}

interface Education {
    degree: string;
    institution: string;
    graduationYear: string;
    gpa?: string;
    specialization?: string;
    relevantCoursework?: string[];
}

interface Project {
    name: string;
    summary: string;
    stack?: string[];
    repository?: string;
    highlights?: string[];
}

interface ResumeData {
    name: string;
    title: string;
    contact: ContactInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    projects?: Project[];
}
```

### Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        I1[JSON File<br/>sample-input.json]
        I2[Sample Data<br/>createSampleResumeData]
    end
    subgraph Processing
        P1[validateResumeData]
        P2[processUserInput]
        P3[discoverProjects<br/>../projects/]
    end
    subgraph Output
        O1[Resume Markdown]
        O2[Cover Letter Markdown]
        O3[LinkedIn Guide]
        O4[Interview Prep]
        O5[PDF Documents]
    end

    I1 --> P1
    I2 --> P1
    P1 --> P2
    P2 --> O1
    P2 --> P3
    P3 --> O1
    O1 --> O5
    O2 --> O5
    O3 --> O5
    O4 --> O5
```

---

## 5. Cross-Cutting Concerns

### Error Handling Strategy

| Scenario | Handling |
| --- | --- |
| Missing required field | `validateResumeData` returns error → `throw Error` with field list |
| Invalid JSON input | `JSON.parse` throws → caught in `main()` `try/catch` → `process.exit(1)` |
| PDF conversion failure | `convertToPDF` rejects promise → Markdown file **still saved** |
| Missing input file | `Bun.file` I/O error → caught in `main()` → error message |
| Project discovery failure | `discoverProjects` error → silently skipped with optional warning |

### Resilience

- **Graceful degradation**: PDF failure still delivers Markdown
- **Optional project discovery**: `--skipProjects` flag avoids filesystem traversal
- **Input fallback**: No `--input` flag → uses built-in sample data
- **Per-document isolation**: Each document type generated independently

### Configuration Surface

| Config File | Purpose |
| --- | --- |
| `tsconfig.json` | TypeScript strict mode, ESNext target, Bun bundler mode |
| `eslint.config.js` | TypeScript lint rules, Prettier integration |
| `.markdownlint.json` / `.markdownlintrc.json` | Markdown formatting rules |
| `.cspell.json` | Spell-check word list |
| `.vscode/settings.json` | Editor defaults |
| `.vscode/launch.json` | Debug configurations |

---

## 6. Extensibility Points

```mermaid
graph LR
    subgraph "Extension Points"
        E1[New Formatters]
        E2[New Output Formats]
        E3[New Input Formats]
        E4[Template System]
        E5[New Document Types]
    end

    E1 -->|Add formatXxxSection| G[generateResumeMarkdown]
    E2 -->|Add converter| M[main pipeline]
    E3 -->|Add parser| L[loadResumeDataFromFile]
    E4 -->|Add template engine| G
    E5 -->|Add generator function| M

    style E1 fill:#e8f5e9,stroke:#388e3c
    style E2 fill:#e8f5e9,stroke:#388e3c
    style E3 fill:#e8f5e9,stroke:#388e3c
    style E4 fill:#e8f5e9,stroke:#388e3c
    style E5 fill:#e8f5e9,stroke:#388e3c
```

1. **New Document Types** — Add a generator function and corresponding formatters (e.g., portfolio page, bio)
2. **New Output Formats** — Add a converter module (e.g., `convertToDOCX`, `convertToHTML`)
3. **New Input Formats** — Add a parser for YAML, TOML, or CSV input
4. **Template System** — Replace hardcoded Markdown templates with EJS/Handlebars
5. **Additional CLI Flags** — Extend `CLIOptions` interface and `parseCLIOptions` switch

---

## 7. Architectural Decisions

| Decision | Rationale |
| --- | --- |
| **Bun-native, no build step** | Bun runs TypeScript directly; `tsconfig.json` has `noEmit: true` |
| **Single-file entry point** | ~933 lines manageable for a focused CLI tool; avoids premature module splitting |
| **TypeScript strict** | Catches data-shape mismatches at compile time for a data-driven generator |
| **Curated project descriptions** | Hardcoded `CURATED_PROJECTS` map provides resume-optimized text vs raw README |
| **markdown-pdf via bunx** | No npm package bundling; pulled on-demand at runtime |
| **output/ directory** | Simple convention; avoids polluting project root |

---

*Generated by architecture-blueprint-generator — comprehensive analysis*
