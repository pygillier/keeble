'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AppShell, NavLink } from '@mantine/core';
import {
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconTag,
  IconTagFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react';
import { AppHeader } from './Header';
import { BottomNav } from './BottomNav';

const NAV_ITEMS = [
  { href: '/', labelKey: 'home', Icon: IconHome, IconActive: IconHomeFilled },
  { href: '/search', labelKey: 'search', Icon: IconSearch, IconActive: IconSearch },
  { href: '/tags', labelKey: 'tags', Icon: IconTag, IconActive: IconTagFilled },
  { href: '/profile', labelKey: 'profile', Icon: IconUser, IconActive: IconUserFilled },
] as const;

function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav style={{ padding: '16px 8px' }}>
      {NAV_ITEMS.map(({ href, labelKey, Icon, IconActive }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        const ItemIcon = isActive ? IconActive : Icon;

        return (
          <NavLink
            key={href}
            component={Link}
            href={href}
            label={t(labelKey)}
            leftSection={<ItemIcon size={20} stroke={isActive ? 2 : 1.5} />}
            active={isActive}
            styles={{
              root: {
                borderRadius: '8px',
                marginBottom: '4px',
                color: isActive ? '#2B6E4E' : '#2C3E50',
                fontWeight: isActive ? 600 : 400,
                '--nav-link-color-active': '#EAF5EE',
              },
            }}
          />
        );
      })}
    </nav>
  );
}

interface KeebleAppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function KeebleAppShell({ children, header }: KeebleAppShellProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'md', collapsed: { mobile: true } }}
      styles={{
        main: { backgroundColor: '#F7F5F0' },
        navbar: { backgroundColor: 'white', borderRight: '1px solid #D5DBDD' },
        footer: { backgroundColor: '#F7F5F0' },
      }}
    >
      <AppShell.Header>
        <AppHeader>{header}</AppHeader>
      </AppShell.Header>

      <AppShell.Navbar>
        <SidebarNav />
      </AppShell.Navbar>

      <AppShell.Footer hiddenFrom="md">
        <BottomNav />
      </AppShell.Footer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
