'use client';

import { useTranslations } from 'next-intl';
import { TagPill } from '@/components/ui/TagPill';
import type { Tag } from '@/types';

interface TagRowProps {
  tags: Tag[];
  activeTagId: string | null;
  onSelect: (tagId: string | null) => void;
}

export function TagRow({ tags, activeTagId, onSelect }: TagRowProps) {
  const t = useTranslations('tags');

  if (tags.length === 0) return null;

  return (
    <div
      role="list"
      aria-label={t('all')}
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBlock: '4px',
        paddingInline: '2px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* "All" pill */}
      <div role="listitem">
        <TagPill
          label={t('all')}
          variant="green"
          active={activeTagId === null}
          onClick={() => onSelect(null)}
        />
      </div>

      {tags.map((tag) => (
        <div key={tag.id} role="listitem">
          <TagPill
            label={tag.name}
            variant="green"
            active={activeTagId === tag.id}
            onClick={() => onSelect(activeTagId === tag.id ? null : tag.id)}
          />
        </div>
      ))}
    </div>
  );
}
