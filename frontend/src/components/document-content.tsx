import { splitIntoSteps } from "@/lib/markdown";
import { StepAccordion } from "@/components/step-accordion";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export function DocumentContent({ content }: { content: string }) {
  const steps = splitIntoSteps(content);
  return steps ? (
    <StepAccordion steps={steps} />
  ) : (
    <MarkdownRenderer content={content} />
  );
}
