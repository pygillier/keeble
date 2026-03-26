import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

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
