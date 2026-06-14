import { getTags } from "@/lib/data";
import { TagBadge } from "@/components/tag-badge";

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-display text-lg text-slate">Browse by category</h1>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <TagBadge
              key={tag}
              tag={`${tag} (${count})`}
              href={`/tags/${tag}`}
              className="px-3 py-1.5 text-sm"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone">No tags yet.</p>
      )}
    </div>
  );
}
