'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ActionIcon, Box, Button, Modal, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { deleteDocAction } from '@/lib/actions/doc';
import { TagRow } from '@/components/layout/TagRow';
import { DocCard } from '@/components/doc/DocCard';
import { toTagIds } from '@/lib/utils';
import type { Document, Tag } from '@/types';

interface DocsViewProps {
  docs: Document[];
  tags: Tag[];
  isAdmin: boolean;
}

export function DocsView({ docs, tags, isAdmin }: DocsViewProps) {
  const t = useTranslations('docs');
  const tDoc = useTranslations('doc');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const tagById = new Map(tags.map((tag) => [tag.id, tag]));

  const filtered =
    activeTagId === null ? docs : docs.filter((d) => toTagIds(d.tags).includes(activeTagId));

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const result = await deleteDocAction(id);
      setDeleteTarget(null);
      if (result.success) router.refresh();
    });
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: '760px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <Text
          size="sm"
          fw={600}
          c="dimmed"
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {t('title')}
        </Text>
        <Text size="sm" c="dimmed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {t('count', { count: filtered.length })}
        </Text>
      </div>

      {tags.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <TagRow tags={tags} activeTagId={activeTagId} onSelect={setActiveTagId} />
        </section>
      )}

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
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((doc) => (
            <div key={doc.id} style={{ position: 'relative' }}>
              <DocCard
                id={doc.id}
                title={doc.title}
                description={doc.description}
                tags={toTagIds(doc.tags).flatMap((id) => tagById.get(id) ?? [])}
                updated={doc.updated}
              />

              {isAdmin && (
                <Box
                  visibleFrom="md"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    aria-label={tDoc('edit')}
                    component={Link}
                    href={`/edit/${doc.id}`}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    aria-label={tDoc('delete')}
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Box>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {tDoc('delete')}
          </span>
        }
        size="sm"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              color: '#2C3E50',
            }}
          >
            {tDoc('deleteConfirm')}
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="subtle" color="gray" onClick={() => setDeleteTarget(null)}>
              {tDoc('cancel')}
            </Button>
            <Button color="red" loading={isPending} onClick={handleDelete}>
              {tDoc('deleteConfirmButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
