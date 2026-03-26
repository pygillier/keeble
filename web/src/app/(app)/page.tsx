import { getPb } from '@/lib/pb';
import { HomeView } from '@/components/doc/HomeView';
import type { Document, Tag } from '@/types';

export default async function HomePage() {
  const pb = getPb();

  const [docsResult, tags] = await Promise.allSettled([
    pb.collection('documents').getList<Document>(1, 10, {
      sort: '-updated',
      expand: 'tags',
    }),
    pb.collection('tags').getFullList<Tag>({ sort: 'name' }),
  ]);

  const docs = docsResult.status === 'fulfilled' ? docsResult.value.items : [];
  const tagList = tags.status === 'fulfilled' ? tags.value : [];

  return <HomeView docs={docs} tags={tagList} />;
}
