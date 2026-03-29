'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { getCurrentUserAction } from '@/lib/actions/auth';

export function DesktopFab() {
  const router = useRouter();
  const tEditor = useTranslations('editor');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getCurrentUserAction().then((user) => setIsAdmin(user?.is_admin ?? false));
  }, []);

  if (!isAdmin) return null;

  return (
    <Box visibleFrom="md">
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 200,
        }}
      >
        <Tooltip label={tEditor('newDocument')} position="left">
          <ActionIcon
            size={56}
            radius="xl"
            aria-label={tEditor('newDocument')}
            onClick={() => router.push('/edit/new')}
            style={{
              backgroundColor: '#2B6E4E',
              color: 'white',
              boxShadow: '0 4px 12px rgba(43,110,78,0.4)',
            }}
          >
            <IconPlus size={26} stroke={2} />
          </ActionIcon>
        </Tooltip>
      </div>
    </Box>
  );
}
