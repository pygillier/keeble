import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div
      className="space-y-3 text-sm leading-relaxed text-slate
        [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2
        [&_code]:rounded [&_code]:bg-mist [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
        [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-semibold
        [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold
        [&_h3]:text-sm [&_h3]:font-semibold
        [&_ol]:list-decimal [&_ol]:pl-5
        [&_ul]:list-disc [&_ul]:pl-5
        [&_li]:mt-1
        [&_strong]:font-semibold"
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
