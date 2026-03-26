'use client';

import { useEffect, useRef, useState } from 'react';
import { getPb } from '@/lib/pb';
import type { Document, Tag } from '@/types';

export interface SearchResult {
  id: string;
  title: string;
  body: string;
  slug: string;
  tags: string[];
  images: string[];
  author: string;
  created: string;
  updated: string;
  expand?: { tags?: Tag[] };
  /** Indicates which field produced the best match for ranking */
  _matchType: 'title' | 'tag' | 'body';
}

function classifyMatch(doc: Document, query: string): 'title' | 'tag' | 'body' {
  const q = query.toLowerCase();
  if (doc.title.toLowerCase().includes(q)) return 'title';
  const tagNames = doc.expand?.tags?.map((t) => t.name.toLowerCase()) ?? [];
  if (tagNames.some((n) => n.includes(q))) return 'tag';
  return 'body';
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const pb = getPb();
        const q = query.trim().replace(/"/g, '\\"');
        const records = await pb.collection('documents').getFullList<Document>({
          filter: `title ~ "${q}" || body ~ "${q}" || tags.name ~ "${q}"`,
          expand: 'tags',
          sort: '-updated',
        });

        // Rank: title match > tag match > body match
        const ranked = [...records]
          .map((doc) => ({
            ...doc,
            _matchType: classifyMatch(doc, query.trim()),
          }))
          .sort((a, b) => {
            const order = { title: 0, tag: 1, body: 2 };
            return order[a._matchType] - order[b._matchType];
          }) as SearchResult[];

        setResults(ranked);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, loading, error };
}
