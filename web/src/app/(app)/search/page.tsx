import { getTranslations } from 'next-intl/server';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? '';
  const t = await getTranslations('search');

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      {/* Search input */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBar initialValue={query} />
      </div>

      {/* Results or prompt */}
      {query ? (
        <SearchResults query={query} />
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6C838D',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ margin: 0, fontSize: '15px' }}>{t('placeholder')}</p>
        </div>
      )}
    </div>
  );
}
