'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ActionIcon, Box, Button, Menu, Modal, TextInput } from '@mantine/core';
import { IconFile, IconPlus, IconTag } from '@tabler/icons-react';
import { getCurrentUserAction } from '@/lib/actions/auth';
import { createTagAction } from '@/lib/actions/tag';

const DEFAULT_COLOR = '#2B6E4E';

export function DesktopFab() {
  const router = useRouter();
  const tEditor = useTranslations('editor');
  const tTags = useTranslations('tags');
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(DEFAULT_COLOR);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getCurrentUserAction().then((user) => setIsAdmin(user?.is_admin ?? false));
  }, []);

  if (!isAdmin) return null;

  function openTagModal() {
    setFormName('');
    setFormColor(DEFAULT_COLOR);
    setFormError('');
    setTagModalOpen(true);
  }

  function closeTagModal() {
    setTagModalOpen(false);
    setFormError('');
  }

  function handleSaveTag() {
    if (!formName.trim()) {
      setFormError(tTags('nameRequired'));
      return;
    }
    startTransition(async () => {
      const result = await createTagAction({ name: formName.trim(), color: formColor });
      if (result.success) {
        closeTagModal();
        router.refresh();
      } else {
        setFormError(result.error);
      }
    });
  }

  return (
    <Box visibleFrom="md">
      {/* FAB — fixed bottom-right */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 200,
        }}
      >
        <Menu position="top-end" offset={12} withinPortal>
          <Menu.Target>
            <ActionIcon
              size={56}
              radius="xl"
              aria-label="Create"
              style={{
                backgroundColor: '#2B6E4E',
                color: 'white',
                boxShadow: '0 4px 12px rgba(43,110,78,0.4)',
              }}
            >
              <IconPlus size={26} stroke={2} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconFile size={16} />}
              onClick={() => router.push('/edit/new')}
            >
              {tEditor('newDocument')}
            </Menu.Item>
            <Menu.Item leftSection={<IconTag size={16} />} onClick={openTagModal}>
              {tTags('newTag')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* New tag modal */}
      <Modal
        opened={tagModalOpen}
        onClose={closeTagModal}
        title={
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {tTags('newTag')}
          </span>
        }
        size="sm"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextInput
            label={tTags('name')}
            placeholder={tTags('namePlaceholder')}
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
              {tTags('color')}
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
            <Button variant="subtle" color="gray" onClick={closeTagModal}>
              {tTags('cancel')}
            </Button>
            <Button
              loading={isPending}
              onClick={handleSaveTag}
              style={{ backgroundColor: '#2B6E4E' }}
            >
              {tTags('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </Box>
  );
}
