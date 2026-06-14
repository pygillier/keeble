import Link from "next/link";

import { TagBadge } from "@/components/tag-badge";
import type { DocumentSummary } from "@/lib/data";
import { formatRelativeTime } from "@/lib/utils";

export function DocCard({ doc }: { doc: DocumentSummary }) {
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
        <span>Updated {formatRelativeTime(doc.updated_at)}</span>
      </div>
    </Link>
  );
}
