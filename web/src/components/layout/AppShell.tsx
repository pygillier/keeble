'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AppShell, NavLink, Stack } from '@mantine/core';
import { useComputedColorScheme } from '@mantine/core';
import {
  IconBook,
  IconBookFilled,
  IconHome,
  IconHomeFilled,
  IconTag,
  IconTagFilled,
  IconUser,
  IconUserFilled,
} from '@tabler/icons-react';
import { AppHeader } from './Header';
import { BottomNav } from './BottomNav';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DesktopFab } from './DesktopFab';

// ---------------------------------------------------------------------------
// Header slot — lets child pages inject content (e.g. SearchBar) into the
// green header band without requiring prop-drilling through the layout.
// ---------------------------------------------------------------------------

const HeaderSlotCtx = createContext<(node: ReactNode) => void>(() => {});

/**
 * Render this anywhere inside the (app) layout to place content in the
 * green header instead of the default wordmark. Unmounts cleanly.
 */
export function HeaderSlot({ children }: { children: ReactNode }) {
  const setSlot = useContext(HeaderSlotCtx);
  // Use a ref so the effect only runs on mount/unmount, not on every render.
  const ref = useRef(children);
  ref.current = children;

  useEffect(() => {
    setSlot(ref.current);
    return () => setSlot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSlot]);

  return null;
}

// ---------------------------------------------------------------------------
// Desktop sidebar nav
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: '/', labelKey: 'home', Icon: IconHome, IconActive: IconHomeFilled },
  { href: '/docs', labelKey: 'docs', Icon: IconBook, IconActive: IconBookFilled },
  { href: '/tags', labelKey: 'tags', Icon: IconTag, IconActive: IconTagFilled },
  { href: '/profile', labelKey: 'profile', Icon: IconUser, IconActive: IconUserFilled },
] as const;

function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  return (
    <Stack justify="space-between" style={{ height: '100%', padding: '16px 8px' }}>
      <nav>
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
                  color: isActive ? '#2B6E4E' : isDark ? '#C1C2C5' : '#2C3E50',
                  fontWeight: isActive ? 600 : 400,
                },
              }}
            />
          );
        })}
      </nav>

      <div style={{ paddingBottom: '8px' }}>
        <ThemeSwitcher />
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

interface KeebleAppShellProps {
  children: ReactNode;
}

export function KeebleAppShell({ children }: KeebleAppShellProps) {
  const [headerSlot, setHeaderSlot] = useState<ReactNode>(null);
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = colorScheme === 'dark';

  const handleSetSlot = useCallback((node: ReactNode) => {
    setHeaderSlot(node);
  }, []);

  return (
    <HeaderSlotCtx.Provider value={handleSetSlot}>
      <AppShell
        header={{ height: 60 }}
        footer={{ height: 56 }}
        navbar={{ width: 220, breakpoint: 'md', collapsed: { mobile: true } }}
        styles={{
          main: { backgroundColor: isDark ? '#141517' : '#F7F5F0' },
          navbar: {
            backgroundColor: isDark ? '#1A1B1E' : 'white',
            borderRight: `1px solid ${isDark ? '#373A40' : '#D5DBDD'}`,
          },
          footer: { backgroundColor: isDark ? '#141517' : '#F7F5F0' },
        }}
      >
        <AppShell.Header>
          <AppHeader>{headerSlot}</AppHeader>
        </AppShell.Header>

        <AppShell.Navbar>
          <SidebarNav />
        </AppShell.Navbar>

        <AppShell.Footer hiddenFrom="md">
          <BottomNav />
        </AppShell.Footer>

        <AppShell.Main>{children}</AppShell.Main>

        <DesktopFab />
      </AppShell>
    </HeaderSlotCtx.Provider>
  );
}
