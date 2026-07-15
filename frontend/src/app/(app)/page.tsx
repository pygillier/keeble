import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";

import { getDocuments, getTags } from "@/lib/data";
import { TagBadge } from "@/components/tag-badge";
import { DocCard } from "@/components/doc-card";
import { getIntl } from "@/i18n/resolve-locale";
import { formatRelativeTime } from "@/lib/utils";

export default async function Home() {
  const [{ user, locale, dict }, tags, docs] = await Promise.all([
    getIntl(),
    getTags(),
    getDocuments({ status: "published" }),
  ]);

  return (
    <div className="relative flex flex-1 flex-col gap-6 p-4">
      <Link
        href="/search"
        className="flex items-center gap-2 rounded-pill border border-border bg-card px-3.5 py-2.5 text-sm text-stone transition-colors hover:border-leaf"
      >
        <SearchIcon className="size-4" />
        {dict.common.searchPlaceholder}
      </Link>

      {tags.length > 0 && (
        <section>
          <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-stone uppercase">
            {dict.home.browseByCategory}
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <TagBadge key={tag} tag={tag} href={`/tags/${tag}`} title={dict.home.guideCount(count)} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-1 flex-col">
        <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-stone uppercase">
          {dict.home.recentGuides}
        </h2>
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
          <p className="text-sm text-stone">
            {dict.home.noGuidesYet(user?.display_name)}
          </p>
        )}
      </section>

      {user?.role === "editor" && (
        <Link
          href="/docs/new"
          className="fixed bottom-20 right-4 flex size-12 items-center justify-center rounded-full bg-amber text-white shadow-lg transition-colors hover:bg-amber/90"
          aria-label={dict.home.newGuide}
        >
          <PlusIcon className="size-5" />
        </Link>
      )}
    </div>
  );
}
