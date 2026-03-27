import Link from 'next/link';
import { TagPill } from '@/components/ui/TagPill';
import type { Tag } from '@/types';

interface ResultCardProps {
  id: string;
  title: string;
  body: string;
  tags?: Tag[];
  query: string;
}

/**
 * Wraps all occurrences of `query` in `text` with <mark> tags.
 * Returns an array of segments for rendering.
 */
function highlight(text: string, query: string): Array<{ part: string; marked: boolean }> {
  if (!query.trim()) return [{ part: text, marked: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part) => ({ part, marked: regex.test(part) }));
}

/**
 * Extracts a ~160-char snippet around the first match of `query` in `body`.
 */
function snippet(body: string, query: string): string {
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return body.slice(0, 160);
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + 100);
  const s = (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
  return s;
}

export function ResultCard({ id, title, body, tags = [], query }: ResultCardProps) {
  const titleParts = highlight(title, query);
  const snippetText = snippet(body, query);
  const snippetParts = highlight(snippetText, query);

  return (
    <Link href={`/doc/${id}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}
      >
        {/* Title with highlight */}
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#2C3E50',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.35,
          }}
        >
          {titleParts.map((seg, i) =>
            seg.marked ? (
              <mark
                key={i}
                style={{
                  background: '#FFF3B0',
                  color: '#7A4F1A',
                  borderRadius: '2px',
                  padding: '0 1px',
                }}
              >
                {seg.part}
              </mark>
            ) : (
              <span key={i}>{seg.part}</span>
            ),
          )}
        </h3>

        {/* Body snippet with highlight */}
        <p
          style={{
            margin: '0 0 10px',
            fontSize: '13px',
            color: '#4A6275',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.5,
          }}
        >
          {snippetParts.map((seg, i) =>
            seg.marked ? (
              <mark
                key={i}
                style={{
                  background: '#FFF3B0',
                  color: '#7A4F1A',
                  borderRadius: '2px',
                  padding: '0 1px',
                }}
              >
                {seg.part}
              </mark>
            ) : (
              <span key={i}>{seg.part}</span>
            ),
          )}
        </p>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <TagPill key={tag.id} label={tag.name} variant="slate" />
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
