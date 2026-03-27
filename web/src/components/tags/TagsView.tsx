'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ActionIcon, Button, Modal, TextInput } from '@mantine/core';
import { IconEdit, IconPlus, IconTag, IconTrash } from '@tabler/icons-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createTagAction, deleteTagAction, updateTagAction } from '@/lib/actions/tag';
import type { Tag } from '@/types';

interface TagWithCount extends Tag {
  count: number;
}

interface TagsViewProps {
  tags: TagWithCount[];
}

const DEFAULT_COLOR = '#2B6E4E';

export function TagsView({ tags }: TagsViewProps) {
  const t = useTranslations('tags');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Modal state: null = closed, 'create' = new tag, Tag object = editing
  const [modal, setModal] = useState<null | 'create' | TagWithCount>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(DEFAULT_COLOR);
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<TagWithCount | null>(null);

  function openCreate() {
    setFormName('');
    setFormColor(DEFAULT_COLOR);
    setFormError('');
    setModal('create');
  }

  function openEdit(tag: TagWithCount) {
    setFormName(tag.name);
    setFormColor(tag.color || DEFAULT_COLOR);
    setFormError('');
    setModal(tag);
  }

  function closeModal() {
    setModal(null);
    setFormError('');
  }

  function handleSave() {
    if (!formName.trim()) {
      setFormError(t('nameRequired'));
      return;
    }
    startTransition(async () => {
      const data = { name: formName.trim(), color: formColor };
      const result =
        modal === 'create'
          ? await createTagAction(data)
          : await updateTagAction((modal as TagWithCount).id, data);

      if (result.success) {
        closeModal();
        router.refresh();
      } else {
        setFormError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      const result = await deleteTagAction(id);
      setDeleteTarget(null);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div style={{ padding: '16px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#2C3E50',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('all')}
        </h2>
        {isAuthenticated && (
          <Button
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={openCreate}
            style={{ backgroundColor: '#2B6E4E' }}
          >
            {t('newTag')}
          </Button>
        )}
      </div>

      {/* Tag grid */}
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
          <p style={{ margin: 0, fontSize: '15px' }}>{t('noTags')}</p>
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
            <div key={tag.id} style={{ position: 'relative' }}>
              <Link
                href={`/tags/${encodeURIComponent(tag.name)}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: isAuthenticated ? '12px 12px 40px' : '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    borderLeft: `4px solid ${tag.color || DEFAULT_COLOR}`,
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

              {/* Admin controls — positioned over the card bottom */}
              {isAuthenticated && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    aria-label={t('editTag')}
                    onClick={(e) => {
                      e.preventDefault();
                      openEdit(tag);
                    }}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    aria-label={t('deleteTag')}
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(tag);
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        opened={modal !== null}
        onClose={closeModal}
        title={
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {modal === 'create' ? t('newTag') : t('editTag')}
          </span>
        }
        size="sm"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextInput
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={formName}
            onChange={(e) => setFormName(e.currentTarget.value)}
            error={formError || undefined}
            data-autofocus
            styles={{ label: { fontFamily: 'DM Sans, sans-serif', fontWeight: 600 } }}
          />

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                marginBottom: '6px',
              }}
            >
              {t('color')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.currentTarget.value)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid #D5DBDD',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4A6275' }}>
                {formColor}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="subtle" color="gray" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button loading={isPending} onClick={handleSave} style={{ backgroundColor: '#2B6E4E' }}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {t('deleteTag')}
          </span>
        }
        size="sm"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <IconTag size={20} color="#C92A2A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p
              style={{
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                color: '#2C3E50',
              }}
            >
              {t('deleteConfirm', { name: deleteTarget?.name ?? '' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="subtle" color="gray" onClick={() => setDeleteTarget(null)}>
              {t('cancel')}
            </Button>
            <Button color="red" loading={isPending} onClick={handleDelete}>
              {t('deleteConfirmButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
