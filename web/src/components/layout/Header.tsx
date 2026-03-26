'use client';

import Link from 'next/link';
import { Avatar, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  /** Replaces the wordmark. Use for a back-nav link or an inline search bar. */
  children?: React.ReactNode;
}

export function AppHeader({ children }: HeaderProps) {
  const t = useTranslations('app');

  return (
    <header
      style={{
        backgroundColor: '#2B6E4E',
        color: 'white',
        height: '60px',
        paddingInline: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {children ?? (
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'Lora, serif',
                fontWeight: 500,
                fontSize: '22px',
                color: 'white',
                letterSpacing: '-0.01em',
              }}
            >
              {t('name')}
            </span>
          </Link>
        )}
      </div>

      <Group gap={0}>
        <Link href="/profile" aria-label="Profile">
          <Avatar
            size={36}
            radius="xl"
            color="green"
            style={{ cursor: 'pointer', backgroundColor: '#3D9970' }}
          />
        </Link>
      </Group>
    </header>
  );
}
