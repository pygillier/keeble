import Link from "next/link";

import { TagBadge } from "@/components/tag-badge";
import type { DocumentSummary } from "@/lib/data";

export function DocCard({
  doc,
  updatedLabel,
}: {
  doc: DocumentSummary;
  updatedLabel: string;
}) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-leaf"
    >
      <div className="mb-1.5 text-sm font-semibold text-slate">
        {doc.title}
      </div>
      <div className="flex items-center gap-2 text-[10.5px] text-stone">
        {doc.tags[0] && (
          <TagBadge tag={doc.tags[0]} className="px-1.5 py-0.5 text-[10px]" />
        )}
        <span>{updatedLabel}</span>
      </div>
    </Link>
  );
}
