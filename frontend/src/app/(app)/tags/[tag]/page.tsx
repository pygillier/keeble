import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getDocuments } from "@/lib/data";
import { DocCard } from "@/components/doc-card";
import { getIntl } from "@/i18n/resolve-locale";
import { formatRelativeTime } from "@/lib/utils";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const [{ locale, dict }, docs] = await Promise.all([
    getIntl(),
    getDocuments({ status: "published", tag }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <Link
          href="/tags"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-stone transition-colors hover:text-forest"
        >
          <ArrowLeftIcon className="size-3.5" />
          {dict.tags.allTags}
        </Link>
        <h1 className="font-display text-lg text-slate">{tag}</h1>
      </div>
      {docs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              updatedLabel={dict.common.updated(
                formatRelativeTime(doc.updated_at, locale, dict.common.justNow)
              )}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone">{dict.tags.emptyForTag(tag)}</p>
      )}
    </div>
  );
}
