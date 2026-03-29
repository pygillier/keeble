import Link from 'next/link';
import { TagPill } from '@/components/ui/TagPill';
import type { Tag } from '@/types';

interface DocCardProps {
  id: string;
  title: string;
  description?: string;
  tags?: Tag[];
  updated: string;
  emoji?: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function DocCard({
  id,
  title,
  description,
  tags = [],
  updated,
  emoji = '📄',
}: DocCardProps) {
  return (
    <Link href={`/doc/${id}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}
      >
        {/* Emoji icon slot */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#EAF5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#2C3E50',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: 1.3,
              marginBottom: description ? '4px' : '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h3>

          {description && (
            <p
              style={{
                margin: '0 0 6px',
                fontSize: '13px',
                color: '#6C838D',
                fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {tags.slice(0, 2).map((tag) => (
              <TagPill key={tag.id} label={tag.name} variant="green" />
            ))}
            <span
              style={{
                fontSize: '12px',
                color: '#6C838D',
                fontFamily: 'DM Sans, sans-serif',
                marginLeft: 'auto',
              }}
            >
              {relativeTime(updated)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
