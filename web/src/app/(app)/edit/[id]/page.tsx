import { notFound } from 'next/navigation';
import { getPb } from '@/lib/pb';
import { DocEditor } from '@/components/doc/DocEditor';
import type { Document, Tag } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const pb = getPb();

  let doc: Document;
  try {
    doc = await pb.collection('documents').getOne<Document>(id, { expand: 'tags' });
  } catch {
    notFound();
  }

  // Expand tags IDs from the expand field so DocEditor has the full tag objects
  const allTags = await pb.collection('tags').getFullList<Tag>({ sort: 'name' });

  return <DocEditor doc={doc} allTags={allTags} />;
}
