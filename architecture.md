# Resume_maker — Architecture Overview

## Overview

Resume/CV generation tool that converts structured JSON input into formatted PDF output using Markdown as intermediate representation.

## Key Components

- **index.ts** — Main entry point, reads JSON input and generates output
- **application_materials/** — Generated application documents
- **output/** — Rendered PDF output directory
- **docs/** — Documentation and usage guides

## Technology

- Runtime: Bun
- Language: TypeScript
- Key dep: markdown-pdf for PDF generation

Last updated: 2026-06-28
