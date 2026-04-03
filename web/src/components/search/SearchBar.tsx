'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconSearch } from '@tabler/icons-react';

interface SearchBarProps {
  /** When true, renders a compact white-on-green style for use in the header */
  compact?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  compact = false,
  initialValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced navigation: fires 300 ms after the user stops typing
  useEffect(() => {
    if (!value.trim()) return;

    debounceRef.current = setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  if (compact) {
    // Header variant — white input on green background
    return (
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: '8px',
            paddingInline: '10px',
            height: '38px',
          }}
        >
          <IconSearch size={16} color="rgba(255,255,255,0.8)" />
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            autoFocus={autoFocus}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'white',
              fontSize: '15px',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>
      </form>
    );
  }

  // Default variant — parchment-background input for page content
  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'white',
          border: '1px solid #D5DBDD',
          borderRadius: '10px',
          paddingInline: '14px',
          height: '48px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <IconSearch size={18} color="#6C838D" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '16px',
            fontFamily: 'DM Sans, sans-serif',
            color: '#2C3E50',
          }}
        />
      </div>
    </form>
  );
}
