import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getPb } from '@/lib/pb';
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

  // Count how many documents reference each tag ID
  const countMap: Record<string, number> = {};
  for (const doc of docs) {
    for (const tagId of doc.tags) {
      countMap[tagId] = (countMap[tagId] ?? 0) + 1;
    }
  }

  return tags.map((tag) => ({ ...tag, count: countMap[tag.id] ?? 0 }));
}

export default async function TagsPage() {
  const t = await getTranslations('tags');
  const tags = await getTagsWithCounts();

  return (
    <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
      <h2
        style={{
          margin: '0 0 16px',
          fontSize: '18px',
          fontWeight: 600,
          color: '#2C3E50',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {t('all')}
      </h2>

      {tags.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6C838D',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
          <p style={{ margin: 0, fontSize: '15px' }}>No categories yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  borderLeft: `4px solid ${tag.color || '#2B6E4E'}`,
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#2C3E50',
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: 1.3,
                  }}
                >
                  {tag.name}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#6C838D',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {t('documents', { count: tag.count })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
