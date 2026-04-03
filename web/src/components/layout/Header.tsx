'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { IconSearch, IconX } from '@tabler/icons-react';
import { SearchBar } from '@/components/search/SearchBar';

interface HeaderProps {
  /** Replaces the wordmark. Use for a back-nav link or an inline search bar. */
  children?: React.ReactNode;
}

export function AppHeader({ children }: HeaderProps) {
  const t = useTranslations('app');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

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
      {searchOpen ? (
        <div ref={searchRef} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <SearchBar compact autoFocus />
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <IconX size={20} />
          </button>
        </div>
      ) : (
        <>
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
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <IconSearch size={22} />
          </button>
        </>
      )}
    </header>
  );
}
