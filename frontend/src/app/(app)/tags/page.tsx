import { getTags } from "@/lib/data";
import { TagBadge } from "@/components/tag-badge";
import { getIntl } from "@/i18n/resolve-locale";

export default async function TagsPage() {
  const [{ dict }, tags] = await Promise.all([getIntl(), getTags()]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-display text-lg text-slate">{dict.tags.title}</h1>
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
        <p className="text-sm text-stone">{dict.tags.empty}</p>
      )}
    </div>
  );
}
