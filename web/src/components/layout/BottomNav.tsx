'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useComputedColorScheme } from '@mantine/core';
import {
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconTag,
  IconTagFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react';

const NAV_ITEMS = [
  { href: '/', labelKey: 'home', Icon: IconHome, IconActive: IconHomeFilled },
  { href: '/search', labelKey: 'search', Icon: IconSearch, IconActive: IconSearch },
  { href: '/tags', labelKey: 'tags', Icon: IconTag, IconActive: IconTagFilled },
  { href: '/profile', labelKey: 'profile', Icon: IconUser, IconActive: IconUserFilled },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  return (
    <nav
      aria-label={t('home')}
      style={{
        display: 'flex',
        borderTop: `1px solid ${isDark ? '#373A40' : '#D5DBDD'}`,
        backgroundColor: isDark ? '#141517' : '#F7F5F0',
      }}
    >
      {NAV_ITEMS.map(({ href, labelKey, Icon, IconActive }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        const ActiveIcon = IconActive;
        const IdleIcon = Icon;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '56px',
              paddingBlock: '8px',
              textDecoration: 'none',
              color: isActive ? '#2B6E4E' : (isDark ? '#909296' : '#6C838D'),
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              gap: '3px',
            }}
          >
            {isActive ? <ActiveIcon size={24} /> : <IdleIcon size={24} stroke={1.5} />}
            <span>{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
