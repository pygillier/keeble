'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Text } from '@mantine/core';
import { HeaderSlot } from '@/components/layout/AppShell';
import { SearchBar } from '@/components/search/SearchBar';
import { TagRow } from '@/components/layout/TagRow';
import { DocCard } from '@/components/doc/DocCard';
import { toTagIds } from '@/lib/utils';
import type { Document, Tag } from '@/types';

interface HomeViewProps {
  docs: Document[];
  tags: Tag[];
}

export function HomeView({ docs, tags }: HomeViewProps) {
  const t = useTranslations('home');
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  const filtered =
    activeTagId === null ? docs : docs.filter((d) => toTagIds(d.tags).includes(activeTagId));

  return (
    <>
      {/* Inject compact SearchBar into the green header — mobile only */}
      <Box hiddenFrom="md">
        <HeaderSlot>
          <SearchBar compact />
        </HeaderSlot>
      </Box>

      <div style={{ padding: '20px 16px', maxWidth: '760px', margin: '0 auto' }}>
        {/* Desktop search bar */}
        <Box visibleFrom="md" mb="lg">
          <SearchBar />
        </Box>

        {/* Tag category row */}
        {tags.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <Text
              size="sm"
              fw={600}
              c="dimmed"
              mb={10}
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {t('tags')}
            </Text>
            <TagRow tags={tags} activeTagId={activeTagId} onSelect={setActiveTagId} />
          </section>
        )}

        {/* Recent guides list */}
        <section>
          <Text
            size="sm"
            fw={600}
            c="dimmed"
            mb={10}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {t('recent')}
          </Text>

          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                color: '#6C838D',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <p style={{ margin: 0, fontSize: '15px' }}>{t('noDocuments')}</p>
              <Box visibleFrom="md" component="p" style={{ margin: '8px 0 0', fontSize: '14px' }}>
                <Link href="/edit/new" style={{ color: '#2B6E4E' }}>
                  {t('addFirst')}
                </Link>
              </Box>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((doc) => (
                <DocCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  tags={toTagIds(doc.tags).flatMap((id) => tagById.get(id) ?? [])}
                  updated={doc.updated}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
