import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPb } from '@/lib/pb';
import { DocCard } from '@/components/doc/DocCard';
import type { Tag, Document } from '@/types';

interface TagPageProps {
  params: Promise<{ name: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const t = await getTranslations('tags');
  const pb = getPb();

  // Find the tag by name
  let tag: Tag | null = null;
  try {
    const results = await pb.collection('tags').getFirstListItem<Tag>(
      `name = "${decodedName.replace(/"/g, '\\"')}"`,
    );
    tag = results;
  } catch {
    notFound();
  }

  if (!tag) notFound();

  // Fetch all documents that have this tag
  const docs = await pb.collection('documents').getFullList<Document>({
    filter: `tags.id ?= "${tag.id}"`,
    sort: '-updated',
    expand: 'tags',
  });

  return (
    <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Back link + heading */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          href="/tags"
          style={{
            fontSize: '13px',
            color: '#2B6E4E',
            textDecoration: 'none',
            fontFamily: 'DM Sans, sans-serif',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px',
          }}
        >
          ← All categories
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '3px',
              backgroundColor: tag.color || '#2B6E4E',
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#2C3E50',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {tag.name}
          </h2>
          <span
            style={{
              fontSize: '13px',
              color: '#6C838D',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {t('documents', { count: docs.length })}
          </span>
        </div>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6C838D',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
          <p style={{ margin: 0, fontSize: '15px' }}>{t('documents', { count: 0 })}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {docs.map((doc) => (
            <DocCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              tags={doc.expand?.tags}
              updated={doc.updated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
