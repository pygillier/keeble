import { getPb } from '@/lib/pb';
import { getCurrentUserAction } from '@/lib/actions/auth';
import { DocsView } from '@/components/doc/DocsView';
import type { Document, Tag } from '@/types';

export default async function DocsPage() {
  const pb = getPb();

  const [docsResult, tagsResult, user] = await Promise.allSettled([
    pb.collection('documents').getFullList<Document>({ sort: '-updated' }),
    pb.collection('tags').getFullList<Tag>({ sort: 'name' }),
    getCurrentUserAction(),
  ]);

  const docs = docsResult.status === 'fulfilled' ? docsResult.value : [];
  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];
  const isAdmin = user.status === 'fulfilled' ? (user.value?.is_admin ?? false) : false;

  return <DocsView docs={docs} tags={tags} isAdmin={isAdmin} />;
}
