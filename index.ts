/**
 * Resume Maker - Generate job-hunting documents from structured data
 *
 * Usage:
 *   bun index.ts                    # Generate with sample data
 *   bun index.ts --input data.json  # Generate from JSON file
 *   bun index.ts --output my-resume # Custom output filename
 *   bun index.ts --format pdf       # Generate PDF output
 */

import { parseArgs } from "util";
import { readdir, readFile, stat } from "fs/promises";
import { readFileSync } from "fs";
import { join, resolve } from "path";

// ============================================================================
// Types - All exported for external use
// ============================================================================

export interface ContactInfo {
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  specialization?: string;
  relevantCoursework?: string[];
}

/**
 * Represents a portfolio project displayed in the generated resume.
 */
export interface Project {
  name: string;
  summary: string;
  stack?: string[];
  repository?: string;
  highlights?: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects?: Project[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CLIOptions {
  input?: string;
  output?: string;
  format?: "markdown" | "pdf" | "both";
  projectsDir?: string;
  skipProjects?: boolean;
  verbose?: boolean;
  help?: boolean;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates resume data and returns validation result with any errors.
 * @param data - The resume data to validate
 * @returns ValidationResult with isValid flag and errors array
 */
export function validateResumeData(data: ResumeData): ValidationResult {
  const errors: string[] = [];

  if (!data.name?.trim()) errors.push("Name is required");
  if (!data.title?.trim()) errors.push("Job title is required");
  if (!data.summary?.trim()) errors.push("Summary is required");
  if (!data.experience?.length) errors.push("At least one experience entry is required");
  if (!data.education?.length) errors.push("At least one education entry is required");
  if (!data.skills?.length) errors.push("At least one skill is required");

  if (!data.contact.email?.includes("@")) errors.push("Valid email is required");
  if (!data.contact.phone?.length) errors.push("Valid phone number is required");

  for (const exp of data.experience ?? []) {
    if (!exp.title) errors.push("Job title is required for experience");
    if (!exp.company) errors.push("Company name is required for experience");
    if (!exp.startDate) errors.push("Start date is required for experience");
  }

  for (const edu of data.education ?? []) {
    if (!edu.degree?.trim()) continue;
    if (!edu.institution?.trim()) errors.push("Institution is required for education");
    if (!edu.graduationYear?.trim()) errors.push("Graduation year is required for education");
  }

  return { isValid: errors.length === 0, errors };
}

// ============================================================================
// Formatters
// ============================================================================

/**
 * Formats contact information as a single line string.
 * @param contact - ContactInfo object
 * @returns Formatted contact string
 */
export function formatContactSection(contact: ContactInfo): string {
  const contactLines: string[] = [];

  contactLines.push(`Email: ${contact.email}`);
  contactLines.push(`Phone: ${contact.phone}`);

  if (contact.linkedin) contactLines.push(`LinkedIn: ${contact.linkedin}`);
  if (contact.github) contactLines.push(`GitHub: ${contact.github}`);
  if (contact.website) contactLines.push(`Website: ${contact.website}`);

  return contactLines.join(" | ");
}

/**
 * Formats summary section as Markdown.
 * @param summary - Summary text
 * @returns Formatted summary section
 */
export function formatSummarySection(summary: string): string {
  return `## Summary\n\n${summary}\n`;
}

/**
 * Formats experience entries as Markdown.
 * @param experiences - Array of Experience objects
 * @returns Formatted experience section
 */
export function formatExperienceSection(experiences: Experience[]): string {
  let section = "## Experience\n\n";

  for (const exp of experiences) {
    const dateRange = exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;

    section += `**${exp.title}**\n`;
    section += exp.location ? `${exp.company}, ${exp.location}\n` : `${exp.company}\n`;
    section += `*${dateRange}*\n`;

    if (exp.isCurrentRole) section += "_Current Role_\n";
    section += "\n";

    for (const highlight of exp.highlights) {
      section += `- ${highlight}\n`;
    }
    section += "\n";
  }

  return section;
}

/**
 * Formats education entries as Markdown.
 * @param educationList - Array of Education objects
 * @returns Formatted education section
 */
export function formatEducationSection(educationList: Education[]): string {
  let section = "## Education\n\n";

  for (const edu of educationList) {
    section += `**${edu.degree}**\n`;
    section += `${edu.institution}, ${edu.graduationYear}\n`;
    if (edu.gpa) section += `GPA: ${edu.gpa}\n`;
    if (edu.specialization) section += `Specialization: ${edu.specialization}\n`;
    if (edu.relevantCoursework?.length) {
      section += `Relevant Coursework: ${edu.relevantCoursework.join(", ")}\n`;
    }
    section += "\n";
  }

  return section;
}

/**
 * Formats skills as Markdown bullet list.
 * @param skills - Array of skill strings
 * @returns Formatted skills section
 */
export function formatSkillsSection(skills: string[]): string {
  let section = "## Skills\n\n";
  for (const skill of skills) {
    section += `- ${skill}\n`;
  }
  return section;
}

/**
 * Formats a projects section from project metadata with resume-optimized layout.
 * Each project gets: name line, description, stack badges, repository link.
 * @param projects - Array of project entries
 * @returns Formatted projects section or empty string
 */
export function formatProjectsSection(projects?: Project[]): string {
  if (!projects?.length) return "";

  let section = "## Projects\n\n";

  for (const project of projects) {
    section += `### ${project.name}\n\n`;
    section += `${project.summary}\n\n`;

    if (project.highlights?.length) {
      for (const h of project.highlights) {
        section += `- ${h}\n`;
      }
      section += "\n";
    }

    if (project.stack?.length) {
      section += `*Stack: ${project.stack.join(" · ")}*\n\n`;
    }

    if (project.repository) {
      section += `[Repository](${project.repository})\n\n`;
    }
  }

  return section;
}

// ============================================================================
// Curated Project Descriptions (resume-optimized)
// ============================================================================

/**
 * Resume-optimized project descriptions for known repositories.
 * These replace raw README-derived text with concise, impact-oriented bullets.
 */
const CURATED_PROJECTS: Record<string, { description: string; highlights: string[] }> = {
  Banking: {
    description: "Full-stack fintech banking platform with secure transaction flows.",
    highlights: [
      "Built a modern banking UI with real-time balance updates and transaction history",
      "Implemented secure authentication, form validation, and data integrity layers",
      "Architected scalable API routes for financial data processing",
    ],
  },
  comicwise: {
    description: "Comic and manga reader platform with rich browsing and search.",
    highlights: [
      "Developed a responsive reader interface with chapter navigation and bookmarks",
      "Built search and filter system across a large comic/manga catalog",
      "Optimized image delivery and caching for fast page loads",
    ],
  },
  "cookiecutter-django-tailwind": {
    description: "Production-ready Django project template with Tailwind CSS integration.",
    highlights: [
      "Created a reusable project scaffolding tool for rapid Django deployment",
      "Integrated Tailwind CSS with Django build pipeline for modern styling",
      "Packaged best practices for Django project structure and configuration",
    ],
  },
  "Django-Scrapy-Selenium": {
    description: "Automated web scraping and data collection framework.",
    highlights: [
      "Built a distributed scraping pipeline using Scrapy and Selenium",
      "Implemented dynamic content extraction for JavaScript-rendered pages",
      "Designed data storage and export workflows for structured output",
    ],
  },
  ecom: {
    description: "E-commerce platform with product management and checkout flows.",
    highlights: [
      "Developed product catalog, cart, and checkout functionality",
      "Implemented payment processing integration and order management",
      "Built admin dashboard for inventory and sales tracking",
    ],
  },
  "my-opencode-config": {
    description: "OpenCode AI agent configuration and command definitions.",
    highlights: [
      "Configured specialized AI agents for code generation, review, and refactoring",
      "Defined custom commands for automated development workflows",
      "Established agent orchestration patterns for multi-step tasks",
    ],
  },
  profile: {
    description: "Django portfolio and blog application with content management.",
    highlights: [
      "Built a personal portfolio site with project showcase and blog",
      "Implemented CMS-style content management for portfolio entries",
      "Designed responsive layout with project filtering and search",
    ],
  },
  "Python-projects": {
    description: "Collection of Python automation scripts and utility tools.",
    highlights: [
      "Developed file processing, data transformation, and API wrapper scripts",
      "Implemented reusable utility modules for common automation tasks",
      "Created CLI tools for system administration and data management",
    ],
  },
  rhixe_scans: {
    description: "Automated scanning service with monitoring and alerting.",
    highlights: [
      "Built a scheduled scanning system with configurable intervals",
      "Implemented real-time monitoring dashboards and alert notifications",
      "Designed scalable architecture for handling multiple concurrent scans",
    ],
  },
  selenium_webdriver: {
    description: "Browser automation framework for testing and data extraction.",
    highlights: [
      "Created reusable Selenium WebDriver test and scraping harness",
      "Implemented headless browser automation with stealth techniques",
      "Built page object model patterns for maintainable test suites",
    ],
  },
  "university-libary-jsm": {
    description: "University library management system with catalog and lending.",
    highlights: [
      "Developed book catalog, member management, and lending workflow",
      "Implemented search, reservation, and overdue tracking features",
      "Built admin dashboard for library operations and reporting",
    ],
  },
  xamehi: {
    description: "Full-stack web application with React frontend and Django backend.",
    highlights: [
      "Built a full-stack application with React SPA and Django REST API",
      "Implemented user authentication, data management, and API integration",
      "Designed responsive UI with real-time data updates",
    ],
  },
  "xamehi.tv": {
    description: "Movie and media dashboard with Django backend and React UI.",
    highlights: [
      "Developed media browsing, search, and recommendation dashboard",
      "Integrated external movie database APIs for enriched content data",
      "Built responsive grid layout with filtering and sorting capabilities",
    ],
  },
  "youtube-downloader": {
    description: "YouTube video downloader with format selection and batch processing.",
    highlights: [
      "Built CLI tool for downloading YouTube videos in multiple formats",
      "Implemented batch download queue and progress tracking",
      "Added format selection, playlist support, and metadata extraction",
    ],
  },
};

/**
 * Generates complete resume Markdown from ResumeData.
 * @param data - Valid ResumeData object
 * @returns Complete Markdown string
 * @throws Error if validation fails
 */
export function generateResumeMarkdown(data: ResumeData): string {
  const validation = validateResumeData(data);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  let markdown = `# ${data.name} - ${data.title}\n\n`;
  markdown += formatContactSection(data.contact) + "\n\n";
  markdown += formatSummarySection(data.summary);
  markdown += formatExperienceSection(data.experience);
  markdown += formatProjectsSection(data.projects);
  markdown += formatEducationSection(data.education);
  markdown += formatSkillsSection(data.skills);

  return markdown;
}

/**
 * Processes and normalizes user input data.
 * @param inputData - Partial ResumeData from user
 * @returns Normalized ResumeData
 */
export function processUserInput(inputData: Partial<ResumeData>): ResumeData {
  const data: ResumeData = {
    name: inputData.name ?? "",
    title: inputData.title ?? "",
    contact: inputData.contact ?? { email: "", phone: "" },
    summary: inputData.summary?.trim() ?? "",
    experience: inputData.experience ?? [],
    education: inputData.education ?? [],
    skills: inputData.skills ?? [],
    projects: inputData.projects ?? [],
  };

  for (const exp of data.experience) {
    if (exp.highlights) {
      exp.highlights = exp.highlights.map((h) => h.trim()).filter(Boolean);
    }
  }

  return data;
}

function normalizeText(value: string): string {
  return value
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSummaryFromReadme(readmeContent: string): string | undefined {
  const lines = readmeContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      line.startsWith("#") ||
      line.startsWith("!") ||
      line.startsWith("[") ||
      line.startsWith("|") ||
      line.startsWith("-") ||
      line.startsWith("*") ||
      line.startsWith("```")
    ) {
      continue;
    }

    const cleaned = normalizeText(line);
    if (cleaned.length >= 20) {
      return cleaned;
    }
  }

  return undefined;
}

function extractRepositoryFromReadme(readmeContent: string, projectName: string): string | undefined {
  const normalizeName = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const githubUrlMatches = [...readmeContent.matchAll(/https?:\/\/github\.com\/[^\s)]+/gi)]
    .map((match) => match[0].replace(/[),.;:]+$/, ""))
    .filter((url) => {
      const lowered = url.toLowerCase();
      return (
        !lowered.includes("/actions/") &&
        !lowered.includes("/issues/") &&
        !lowered.includes("/pull/") &&
        !lowered.includes("/blob/") &&
        !lowered.includes("/tree/")
      );
    });

  if (!githubUrlMatches.length) return undefined;

  const projectNameNormalized = normalizeName(projectName);
  const preferredUrl = githubUrlMatches.find((url) => {
    const urlLower = url.toLowerCase();
    const parts = urlLower.replace("https://github.com/", "").split("/");
    if (parts.length < 2) return false;

    const owner = parts[0] ?? "";
    const repo = (parts[1] ?? "").replace(/\.git$/, "");
    if (!owner || !repo) return false;

    const repoNormalized = normalizeName(repo);
    const ownerLooksRelevant = owner.includes("rhixe");
    const minComparableLength = Math.ceil(projectNameNormalized.length * 0.6);
    const repoIsStrongProjectMatch =
      repoNormalized.length >= minComparableLength && projectNameNormalized.includes(repoNormalized);

    return repoNormalized.includes(projectNameNormalized) || repoIsStrongProjectMatch || ownerLooksRelevant;
  });

  return preferredUrl;
}

function inferStack(projectDir: string, readmeContent?: string): string[] {
  const stack = new Set<string>();

  // Check package.json for specific dependencies
  const pkgPath = join(projectDir, "package.json");
  try {
    const pkgRaw = Bun.file(pkgPath);
    if (pkgRaw.size > 0) {
      const pkgContent = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const deps = { ...pkgContent.dependencies, ...pkgContent.devDependencies };
      if (deps.next) stack.add("Next.js");
      if (deps.react) stack.add("React");
      if (deps.vue || deps.nuxt) stack.add("Vue.js");
      if (deps.express) stack.add("Express.js");
      if (deps.drizzle || deps["drizzle-orm"]) stack.add("Drizzle ORM");
      if (deps.prisma || deps["@prisma/client"]) stack.add("Prisma");
      if (deps.tailwindcss || deps["@tailwindcss"]) stack.add("Tailwind CSS");
      if (deps.selenium || deps["selenium-webdriver"]) stack.add("Selenium");
      if (deps.bun) stack.add("Bun");
      stack.add("TypeScript / JavaScript");
    }
  } catch {
    // No package.json or parse error — fall through to file-based checks
    if (Bun.file(join(projectDir, "package.json")).size > 0) {
      stack.add("JavaScript/TypeScript");
    }
  }

  if (
    Bun.file(join(projectDir, "requirements.txt")).size > 0 ||
    Bun.file(join(projectDir, "pyproject.toml")).size > 0
  ) {
    stack.add("Python");
  }

  const normalizedReadme = (readmeContent ?? "").toLowerCase();
  const keywordStackMap: Array<[string, string]> = [
    ["next.js", "Next.js"],
    ["react", "React"],
    ["django", "Django"],
    ["postgresql", "PostgreSQL"],
    ["drizzle", "Drizzle ORM"],
    ["docker", "Docker"],
    ["tailwind", "Tailwind CSS"],
    ["rest api", "REST API"],
    ["graphql", "GraphQL"],
    ["redis", "Redis"],
    ["websocket", "WebSocket"],
    ["docker", "Docker"],
  ];

  for (const [keyword, label] of keywordStackMap) {
    if (normalizedReadme.includes(keyword)) {
      stack.add(label);
    }
  }

  // Deduplicate: if TypeScript / JavaScript present, remove older-style label
  if (stack.has("TypeScript / JavaScript") && stack.has("JavaScript/TypeScript")) {
    stack.delete("JavaScript/TypeScript");
  }

  return [...stack];
}

/**
 * Discovers top-level project directories and extracts concise portfolio metadata.
 * @param projectsDir - Relative or absolute projects directory path
 * @returns Array of discovered Project entries
 */
export async function discoverProjects(projectsDir: string): Promise<Project[]> {
  const resolvedProjectsDir = resolve(process.cwd(), projectsDir);

  const projectsDirStat = await stat(resolvedProjectsDir);
  if (!projectsDirStat.isDirectory()) return [];

  const entries = await readdir(resolvedProjectsDir, { withFileTypes: true });
  const projects: Project[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.toLowerCase() === "archive") continue;

    const projectDir = join(resolvedProjectsDir, entry.name);
    const readmePath = join(projectDir, "README.md");

    let readmeContent = "";
    try {
      readmeContent = await readFile(readmePath, "utf-8");
    } catch {
      readmeContent = "";
    }

    const curated = CURATED_PROJECTS[entry.name];
    const summary =
      curated?.description ?? extractSummaryFromReadme(readmeContent) ?? `Project repository for ${entry.name}.`;

    const repository = extractRepositoryFromReadme(readmeContent, entry.name);
    const stack = inferStack(projectDir, readmeContent);
    const highlights = curated?.highlights;

    projects.push({
      name: entry.name,
      summary,
      stack: stack.length ? stack : undefined,
      repository,
      highlights,
    });
  }

  // Sort by relevance: curated projects first, then by stack richness, alphabetically within tiers
  const relevanceScore = (p: Project): number => {
    let score = 0;
    // Tier 1: Full-stack apps with curated descriptions (real projects)
    if (CURATED_PROJECTS[p.name]) score += 100;
    // Tier 2: Stack richness (more tech = more substantial)
    score += (p.stack?.length ?? 0) * 10;
    // Tier 3: Has repository URL
    if (p.repository) score += 5;
    // Tier 4: Has highlights (curated real project)
    score += (p.highlights?.length ?? 0) * 3;
    return score;
  };

  return projects.sort((a, b) => {
    const scoreDiff = relevanceScore(b) - relevanceScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  });
}

function mergeProjects(baseProjects: Project[], discoveredProjects: Project[]): Project[] {
  const map = new Map<string, Project>();

  for (const project of [...baseProjects, ...discoveredProjects]) {
    const key = project.name.trim().toLowerCase();
    if (!key) continue;
    map.set(key, project);
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Creates sample resume data for demonstration.
 * @returns Sample ResumeData object
 */
export function createSampleResumeData(): ResumeData {
  return {
    name: "John Doe",
    title: "Senior React Developer",
    contact: {
      email: "john.doe@email.com",
      phone: "+1234567890",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      website: "johndoe.dev",
    },
    summary:
      "Senior React Developer with over 4 years of experience in building scalable web applications. Proven track record of delivering high-quality code and mentoring junior developers.",
    experience: [
      {
        title: "Senior React Developer",
        company: "ABC Tech Solutions",
        location: "Remote",
        startDate: "March 2023",
        endDate: "Present",
        isCurrentRole: true,
        highlights: [
          "Led development of enterprise-grade web applications using React and Next.js",
          "Architected reusable component libraries and implemented state management with Redux",
          "Improved application performance by 30% through code splitting and lazy loading",
        ],
      },
      {
        title: "React Developer",
        company: "XYZ Digital Agency",
        location: "New York, NY",
        startDate: "January 2022",
        endDate: "February 2023",
        highlights: [
          "Developed responsive web interfaces for e-commerce platforms",
          "Integrated third-party APIs and implemented authentication flows",
          "Wrote unit and integration tests using Jest and React Testing Library",
        ],
      },
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "University of Technology",
        graduationYear: "2020",
        gpa: "3.8/4.0",
        relevantCoursework: ["Data Structures", "Algorithms", "Web Development"],
      },
    ],
    skills: [
      "React.js, Next.js",
      "JavaScript (ES6+), TypeScript",
      "Redux, Context API",
      "HTML5, CSS3, SASS",
      "RESTful APIs, GraphQL",
      "Git, CI/CD",
      "Testing: Jest, React Testing Library",
    ],
  };
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Saves markdown content to file.
 * @param markdown - Content to save
 * @param filename - Output filename
 */
function saveResumeToFile(markdown: string, filename: string): void {
  const encoder = new TextEncoder();
  const data = encoder.encode(markdown);
  Bun.write(filename, data);
}

/**
 * Loads resume data from JSON file.
 * @param filePath - Path to JSON file
 * @returns Parsed ResumeData
 */
async function loadResumeDataFromFile(filePath: string): Promise<ResumeData> {
  const file = Bun.file(filePath);
  const content = await file.text();
  const data = JSON.parse(content);
  return processUserInput(data as Partial<ResumeData>);
}

// ============================================================================
// CLI
// ============================================================================

/**
 * Parses command line arguments.
 * @returns CLIOptions object
 */
function parseCLIOptions(): CLIOptions {
  try {
    const { values } = parseArgs({
      options: {
        input: { type: "string", short: "i", description: "Input JSON file" },
        output: {
          type: "string",
          short: "o",
          description: "Output filename (without extension, saved to output/)",
        },
        format: {
          type: "string",
          short: "f",
          description: "Output format: markdown, pdf, both",
        },
        projectsDir: {
          type: "string",
          short: "p",
          description: "Projects directory to auto-discover portfolio entries",
        },
        skipProjects: {
          type: "boolean",
          description: "Skip auto-discovery of projects",
        },
        verbose: { type: "boolean", short: "v", description: "Verbose output" },
        help: { type: "boolean", short: "h", description: "Show help" },
      },
    });
    return values as CLIOptions;
  } catch {
    return {};
  }
}

/**
 * Shows help message.
 */
function showHelp(): void {
  console.log(`
Resume Maker - Generate job-hunting documents from structured data

Usage:
  bun index.ts [options]

Options:
  -i, --input <file>   Input JSON file with resume data
  -o, --output <name>  Output filename (default: output/output_resume)
  -f, --format <type>  Output format: markdown, pdf, both (default: markdown)
  -p, --projectsDir    Projects directory (default: ../projects)
      --skipProjects   Disable auto-project discovery
  -v, --verbose        Show verbose output
  -h, --help           Show this help message

Examples:
  bun index.ts                                    # Generate with sample data
  bun index.ts --input my-data.json               # Load from JSON file
  bun index.ts -o my-resume -f pdf                # Generate PDF (saved to output/)
  bun index.ts -i data.json -o resume -f both     # Generate both formats
  bun index.ts -p ../projects                      # Auto-include project repos
  bun index.ts --skipProjects                      # Skip auto project section
`);
}

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Converts markdown file to PDF.
 * @param mdFile - Markdown filename
 * @param pdfFile - Output PDF filename
 */
async function convertToPDF(mdFile: string, pdfFile: string): Promise<void> {
  const { spawn } = await import("child_process");

  return new Promise((resolve, reject) => {
    const proc = spawn("bunx", ["markdown-pdf", mdFile, "-o", pdfFile], {
      stdio: "inherit",
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`PDF conversion failed with code ${code}`));
    });
  });
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  try {
    const options = parseCLIOptions();

    if (options.help) {
      showHelp();
      return;
    }

    if (options.verbose) {
      console.log("Resume Maker starting...");
    }

    // Load data from file or use sample
    let resumeData: ResumeData;

    if (options.input) {
      if (options.verbose) console.log(`Loading data from ${options.input}...`);
      resumeData = await loadResumeDataFromFile(options.input);
    } else {
      if (options.verbose) console.log("Using sample data...");
      resumeData = createSampleResumeData();
    }

    if (!options.skipProjects) {
      const projectsDir = options.projectsDir || "..";

      if (options.verbose) {
        console.log(`Discovering projects from ${projectsDir}...`);
      }

      try {
        const discoveredProjects = await discoverProjects(projectsDir);
        resumeData.projects = mergeProjects(resumeData.projects ?? [], discoveredProjects);

        if (options.verbose) {
          console.log(`Discovered ${resumeData.projects.length} projects.`);
        }
      } catch (error) {
        if (options.verbose) {
          console.warn(`Skipping project discovery: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    // Generate markdown
    const markdown = generateResumeMarkdown(resumeData);

    // Determine output filename
    const outputName = options.output || "output_resume";
    const mdFile = `output/${outputName}.md`;

    // Save markdown
    saveResumeToFile(markdown, mdFile);

    if (options.verbose) {
      console.log(`Markdown saved to ${mdFile}`);
    } else {
      console.log(`Resume saved to ${mdFile}`);
    }

    // Generate PDF if requested
    const format = options.format || "markdown";

    if (format === "pdf" || format === "both") {
      const pdfFile = `output/${outputName}.pdf`;

      if (options.verbose) console.log(`Converting to PDF...`);

      await convertToPDF(mdFile, pdfFile);

      if (options.verbose) {
        console.log(`PDF saved to ${pdfFile}`);
      } else {
        console.log(`PDF saved to ${pdfFile}`);
      }
    }

    if (options.verbose) {
      console.log("\nGenerated Resume:\n");
      console.log(markdown);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
