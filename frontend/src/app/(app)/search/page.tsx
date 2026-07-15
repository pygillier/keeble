"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { TagBadge } from "@/components/tag-badge";
import type { DocumentSummary } from "@/lib/data";
import { useDictionary } from "@/i18n/locale-context";

function findMatch(text: string, query: string): number {
  if (!query) return -1;
  return text.toLowerCase().indexOf(query.toLowerCase());
}

function highlight(text: string, query: string) {
  const index = findMatch(text, query);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-highlight text-inherit">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

function snippet(content: string, query: string, context = 50) {
  const plain = content.replace(/\s+/g, " ").trim();
  const index = findMatch(plain, query);
  if (index === -1) return plain.slice(0, context * 2);

  const start = Math.max(0, index - context);
  const end = Math.min(plain.length, index + query.length + context);
  return `${start > 0 ? "…" : ""}${plain.slice(start, end)}${
    end < plain.length ? "…" : ""
  }`;
}

export default function SearchPage() {
  const dict = useDictionary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocumentSummary[] | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(async () => {
      const response = await apiFetch(
        `/api/documents?q=${encodeURIComponent(trimmed)}`
      );
      setResults(response.ok ? await response.json() : []);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) setResults(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-2 rounded-pill border-[1.5px] border-leaf bg-card px-3.5 py-2.5 text-sm">
        <SearchIcon className="size-4 text-forest" />
        <input
          autoFocus
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder={dict.common.searchPlaceholder}
          className="flex-1 bg-transparent text-slate outline-none placeholder:text-stone"
        />
        {query && (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            aria-label={dict.search.clear}
            className="text-stone transition-colors hover:text-forest"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {results !== null && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-stone">
            {dict.search.resultCount(results.length)}
          </p>
          {results.map((doc) => (
            <Link
              key={doc.id}
              href={`/docs/${doc.slug}`}
              className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-leaf"
            >
              <div className="mb-1 text-sm font-semibold text-slate">
                {highlight(doc.title, query)}
              </div>
              <p className="mb-2 text-xs leading-relaxed text-stone">
                {highlight(snippet(doc.content_md, query), query)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    className="px-1.5 py-0.5 text-[10px]"
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
