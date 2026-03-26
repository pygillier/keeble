import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export interface DocStep {
  number: number;
  /** Text after the "Step N:" heading, or empty string if no separator text */
  title: string;
  /** Rendered HTML for the step body */
  html: string;
}

export interface ParsedDoc {
  /** Rendered HTML from the markdown body */
  html: string;
  /** Raw markdown body (without frontmatter) */
  content: string;
  /** Parsed YAML frontmatter fields */
  frontmatter: {
    title?: string;
    tags?: string[];
    slug?: string;
    updated?: string;
    [key: string]: unknown;
  };
}

/**
 * Parse a markdown string (with optional YAML frontmatter) into HTML + metadata.
 * Uses remark-html for rendering; safe for server and client.
 */
export async function parseDoc(markdown: string): Promise<ParsedDoc> {
  const { data: frontmatter, content } = matter(markdown);
  const result = await remark().use(remarkHtml, { sanitize: false }).process(content);
  return {
    html: result.toString(),
    content,
    frontmatter,
  };
}

/**
 * Split a document body into step sections based on `## Step N:` headings.
 * If no step headings are found the entire body is returned as a single step.
 */
export async function parseSteps(body: string): Promise<DocStep[]> {
  // Matches: ## Step 1: Title  |  ## Step 2 — Title  |  ## Step 3 Title
  const headingRe = /^##\s+Step\s+(\d+)[:\s\-—]*(.*?)$/gim;
  const matches: Array<{ index: number; number: number; title: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(body)) !== null) {
    matches.push({
      index: m.index,
      number: parseInt(m[1], 10),
      title: m[2].trim(),
    });
  }

  if (matches.length === 0) {
    const result = await remark().use(remarkHtml, { sanitize: false }).process(body.trim());
    return [{ number: 1, title: '', html: result.toString() }];
  }

  const steps: DocStep[] = [];
  for (let i = 0; i < matches.length; i++) {
    const lineEnd = body.indexOf('\n', matches[i].index);
    const contentStart = lineEnd === -1 ? body.length : lineEnd + 1;
    const contentEnd = i + 1 < matches.length ? matches[i + 1].index : body.length;
    const content = body.slice(contentStart, contentEnd).trim();
    const result = await remark().use(remarkHtml, { sanitize: false }).process(content);
    steps.push({
      number: matches[i].number,
      title: matches[i].title,
      html: result.toString(),
    });
  }

  return steps;
}

/**
 * Serialize document fields back to a `.md` string with YAML frontmatter.
 * Inverse of parseDoc — used when exporting or importing `.md` files.
 */
export function serializeDoc(fields: {
  title: string;
  slug: string;
  tags?: string[];
  updated?: string;
  body: string;
}): string {
  const { body, ...frontmatterFields } = fields;
  return matter.stringify(body, frontmatterFields);
}
