import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { getDocument } from "@/lib/data";
import { splitIntoSteps } from "@/lib/markdown";
import { TagBadge } from "@/components/tag-badge";
import { StepAccordion } from "@/components/step-accordion";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getDocument(slug);
  if (!doc) notFound();

  const steps = splitIntoSteps(doc.content_md);

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-forest px-4 py-4">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-white/65 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back
        </Link>
        <h1 className="font-display text-lg text-white">{doc.title}</h1>
        {doc.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                variant="slate"
                className="bg-white/15 text-white/90"
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        {steps ? (
          <StepAccordion steps={steps} />
        ) : (
          <MarkdownRenderer content={doc.content_md} />
        )}
      </div>
    </div>
  );
}
