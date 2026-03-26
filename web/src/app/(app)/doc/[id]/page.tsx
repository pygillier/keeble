import { notFound } from 'next/navigation';
import { getPb } from '@/lib/pb';
import { parseSteps } from '@/lib/markdown';
import { DocViewer } from '@/components/doc/DocViewer';
import type { Document, Tag } from '@/types';

interface Props {
  params: { id: string };
}

export default async function DocPage({ params }: Props) {
  const pb = getPb();

  let doc: Document;
  try {
    doc = await pb.collection('documents').getOne<Document>(params.id, {
      expand: 'tags',
    });
  } catch {
    notFound();
  }

  const steps = await parseSteps(doc.body);
  const tags: Tag[] = doc.expand?.tags ?? [];

  return <DocViewer doc={doc} steps={steps} tags={tags} />;
}
