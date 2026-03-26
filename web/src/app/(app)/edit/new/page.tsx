import { getPb } from '@/lib/pb';
import { DocEditor } from '@/components/doc/DocEditor';
import type { Tag } from '@/types';

export default async function NewDocPage() {
  const pb = getPb();
  const allTags = await pb.collection('tags').getFullList<Tag>({ sort: 'name' });
  return <DocEditor allTags={allTags} />;
}
