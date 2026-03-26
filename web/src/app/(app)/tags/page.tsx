import { getPb } from '@/lib/pb';
import { TagsView } from '@/components/tags/TagsView';
import type { Tag, Document } from '@/types';

interface TagWithCount extends Tag {
  count: number;
}

async function getTagsWithCounts(): Promise<TagWithCount[]> {
  const pb = getPb();

  const [tags, docs] = await Promise.all([
    pb.collection('tags').getFullList<Tag>({ sort: 'name' }),
    pb.collection('documents').getFullList<Document>({ fields: 'tags' }),
  ]);

  const countMap: Record<string, number> = {};
  for (const doc of docs) {
    for (const tagId of doc.tags) {
      countMap[tagId] = (countMap[tagId] ?? 0) + 1;
    }
  }

  return tags.map((tag) => ({ ...tag, count: countMap[tag.id] ?? 0 }));
}

export default async function TagsPage() {
  const tags = await getTagsWithCounts();
  return <TagsView tags={tags} />;
}
