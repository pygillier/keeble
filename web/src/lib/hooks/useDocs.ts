'use client';

import { useEffect, useState } from 'react';
import type { Document } from '@/types';
import { getPb } from '@/lib/pb';

export function useDocs() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const pb = getPb();
    let unsubscribe: (() => void) | null = null;

    async function fetchAndSubscribe() {
      try {
        const records = await pb.collection('documents').getFullList<Document>({
          sort: '-updated',
          expand: 'tags,author',
        });
        setDocs(records);
        setLoading(false);

        unsubscribe = await pb.collection('documents').subscribe<Document>('*', (e) => {
          if (e.action === 'create') {
            setDocs((prev) => [e.record, ...prev]);
          } else if (e.action === 'update') {
            setDocs((prev) => prev.map((d) => (d.id === e.record.id ? e.record : d)));
          } else if (e.action === 'delete') {
            setDocs((prev) => prev.filter((d) => d.id !== e.record.id));
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load documents'));
        setLoading(false);
      }
    }

    fetchAndSubscribe();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { docs, loading, error };
}
