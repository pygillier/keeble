import Link from "next/link";
import { PlusIcon, SearchIcon } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { getDocuments, getTags } from "@/lib/data";
import { TagBadge } from "@/components/tag-badge";
import { DocCard } from "@/components/doc-card";

export default async function Home() {
  const [user, tags, docs] = await Promise.all([
    getSessionUser(),
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
        Search guides…
      </Link>

      {tags.length > 0 && (
        <section>
          <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-stone uppercase">
            Browse by category
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <TagBadge key={tag} tag={tag} href={`/tags/${tag}`} title={`${count} guide${count === 1 ? "" : "s"}`} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-1 flex-col">
        <h2 className="mb-2 text-[10px] font-semibold tracking-wider text-stone uppercase">
          Recent guides
        </h2>
        {docs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone">
            No guides yet{user ? `, ${user.display_name}` : ""}. Check back
            once your family adds some.
          </p>
        )}
      </section>

      {user?.role === "editor" && (
        <Link
          href="/docs/new"
          className="fixed bottom-20 right-4 flex size-12 items-center justify-center rounded-full bg-amber text-white shadow-lg transition-colors hover:bg-amber/90"
          aria-label="New guide"
        >
          <PlusIcon className="size-5" />
        </Link>
      )}
    </div>
  );
}
