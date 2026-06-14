export type DocStep = {
  title: string;
  body: string;
};

/**
 * Splits markdown content into steps based on level-2 ("## ") headings.
 * Returns null if the content has no such headings, so callers can fall
 * back to rendering the markdown as a single block.
 */
export function splitIntoSteps(contentMd: string): DocStep[] | null {
  const lines = contentMd.split("\n");
  const steps: DocStep[] = [];
  let current: DocStep | null = null;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      if (current) steps.push(current);
      current = { title: heading[1].trim(), body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) steps.push(current);

  if (steps.length === 0) return null;

  return steps.map((step) => ({ ...step, body: step.body.trim() }));
}
