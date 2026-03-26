'use client';

import { useTranslations } from 'next-intl';
import { useSearch } from '@/lib/hooks/useSearch';
import { ResultCard } from './ResultCard';

interface SearchResultsProps {
  query: string;
}

function Skeleton() {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          height: '16px',
          width: '60%',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, #ECF0F1 25%, #DFE6E9 50%, #ECF0F1 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.2s infinite',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          height: '13px',
          width: '90%',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, #ECF0F1 25%, #DFE6E9 50%, #ECF0F1 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.2s infinite',
          marginBottom: '6px',
        }}
      />
      <div
        style={{
          height: '13px',
          width: '75%',
          borderRadius: '6px',
          background: 'linear-gradient(90deg, #ECF0F1 25%, #DFE6E9 50%, #ECF0F1 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.2s infinite',
        }}
      />
    </div>
  );
}

export function SearchResults({ query }: SearchResultsProps) {
  const t = useTranslations('search');
  const { results, loading } = useSearch(query);

  if (!query.trim()) return null;

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Result count */}
      {!loading && (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '13px',
            color: '#6C838D',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('results', { count: results.length })}
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((doc) => (
            <ResultCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              body={doc.body}
              tags={doc.expand?.tags}
              query={query}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6C838D',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ margin: 0, fontSize: '15px' }}>{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
