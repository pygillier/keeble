'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseDoc } from '@/lib/markdown';
import { toTagIds } from '@/lib/utils';
import { createDocAction, updateDocAction, deleteDocAction } from '@/lib/actions/doc';
import { FrontmatterSidebar } from './FrontmatterSidebar';
import type { Document, Tag } from '@/types';

interface DocEditorProps {
  doc?: Document;
  allTags: Tag[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function DocEditor({ doc, allTags }: DocEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(doc?.title ?? '');
  const [slug, setSlug] = useState(doc?.slug ?? '');
  const [description, setDescription] = useState(doc?.description ?? '');
  const [body, setBody] = useState(doc?.body ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(toTagIds(doc?.tags));
  const [previewHtml, setPreviewHtml] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Track whether user manually edited the slug (stop auto-generation if so)
  const slugManualRef = useRef(!!doc);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<{ start: number; end: number } | null>(null);

  // Mobile: redirect away from editor
  useEffect(() => {
    if (window.innerWidth < 768) {
      router.replace(doc ? `/doc/${doc.id}` : '/');
    }
  }, [doc, router]);

  // Auto-generate slug from title for new docs
  useEffect(() => {
    if (!slugManualRef.current && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  // Debounced live preview
  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await parseDoc(body);
      setPreviewHtml(result.html);
    }, 300);
    return () => clearTimeout(timer);
  }, [body]);

  function handleSlugChange(v: string) {
    slugManualRef.current = true;
    setSlug(v);
  }

  // Tab key inserts 2 spaces
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = body.slice(0, start) + '  ' + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.selectionStart = start + 2;
      el.selectionEnd = start + 2;
    });
  }

  // Save cursor position when textarea loses focus (e.g. user clicks the image drop zone)
  function handleTextareaBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    savedSelectionRef.current = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
  }

  // Insert markdown at the last known cursor position, or at end of file
  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const saved = savedSelectionRef.current;
    const start = saved?.start ?? body.length;
    const end = saved?.end ?? body.length;
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    savedSelectionRef.current = null;
    requestAnimationFrame(() => {
      el.selectionStart = start + text.length;
      el.selectionEnd = start + text.length;
      el.focus();
    });
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaveStatus('saving');
    const data = {
      title: title.trim(),
      slug: slug.trim() || slugify(title.trim()),
      description,
      body,
      tags: selectedTagIds,
    };
    try {
      if (doc) {
        const result = await updateDocAction(doc.id, data);
        if (!result.success) throw new Error(result.error);
        setSaveStatus('saved');
        router.refresh();
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        const result = await createDocAction(data);
        if (!result.success) throw new Error(result.error);
        router.push(`/edit/${result.id}`);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  async function handleMdImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const parsed = await parseDoc(text);
    if (parsed.frontmatter.title) setTitle(parsed.frontmatter.title as string);
    if (parsed.frontmatter.slug) {
      slugManualRef.current = true;
      setSlug(parsed.frontmatter.slug as string);
    }
    if (parsed.frontmatter.description) setDescription(parsed.frontmatter.description as string);
    setBody(parsed.content);
    if (Array.isArray(parsed.frontmatter.tags)) {
      const names = (parsed.frontmatter.tags as string[]).map((t) => t.toLowerCase());
      const matched = allTags.filter((t) => names.includes(t.name.toLowerCase())).map((t) => t.id);
      if (matched.length) setSelectedTagIds(matched);
    }
  }

  async function handleDelete() {
    if (!doc) return;
    const result = await deleteDocAction(doc.id);
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setShowDeleteConfirm(false);
    }
  }

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? '✓ Saved'
        : saveStatus === 'error'
          ? 'Error'
          : doc
            ? 'Save'
            : 'Create';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #D5DBDD',
          backgroundColor: 'white',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#2C3E50',
            fontFamily: 'DM Sans, sans-serif',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title || (doc ? 'Edit guide' : 'New guide')}
        </span>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <input
            ref={mdFileInputRef}
            type="file"
            accept=".md,text/markdown"
            style={{ display: 'none' }}
            onChange={handleMdImport}
          />
          <button
            onClick={() => mdFileInputRef.current?.click()}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #D5DBDD',
              background: 'white',
              color: '#4A6275',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer',
            }}
          >
            Import .md
          </button>
          {doc && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E57373',
                background: 'white',
                color: '#C62828',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || !title.trim()}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background:
                saveStatus === 'saved' ? '#2B6E4E' : saveStatus === 'error' ? '#C62828' : '#2B6E4E',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
              opacity: !title.trim() ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* ── Main three-pane layout ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '260px 1fr 1fr',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            overflowY: 'auto',
            padding: '16px',
            borderRight: '1px solid #D5DBDD',
            backgroundColor: '#F7F5F0',
          }}
        >
          <FrontmatterSidebar
            title={title}
            slug={slug}
            description={description}
            selectedTagIds={selectedTagIds}
            allTags={allTags}
            docId={doc?.id}
            onTitleChange={setTitle}
            onSlugChange={handleSlugChange}
            onDescriptionChange={setDescription}
            onTagsChange={setSelectedTagIds}
            onImageInsert={insertAtCursor}
          />
        </div>

        {/* Editor pane */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid #D5DBDD',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6C838D',
              fontFamily: 'DM Sans, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid #D5DBDD',
              backgroundColor: 'white',
            }}
          >
            Markdown
          </div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleTextareaBlur}
            placeholder={
              '## Step 1: Getting started\n\nDescribe what to do here.\n\n## Step 2: Next step\n\nContinue…'
            }
            spellCheck={false}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              outline: 'none',
              padding: '16px',
              fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
              fontSize: '14px',
              lineHeight: 1.65,
              color: '#2C3E50',
              backgroundColor: '#FAFAFA',
              overflow: 'auto',
            }}
          />
        </div>

        {/* Preview pane */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6C838D',
              fontFamily: 'DM Sans, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid #D5DBDD',
              backgroundColor: 'white',
            }}
          >
            Preview
          </div>
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', backgroundColor: 'white' }}
          >
            <style>{`
              .keeble-preview h1,
              .keeble-preview h2 {
                font-family: 'Lora', serif;
                font-weight: 500;
                color: #2B6E4E;
                line-height: 1.3;
              }
              .keeble-preview h2 {
                font-size: 22px;
                margin: 24px 0 10px;
                padding-bottom: 6px;
                border-bottom: 2px solid #EAF5EE;
              }
              .keeble-preview h3 {
                font-family: 'DM Sans', sans-serif;
                font-weight: 600;
                font-size: 16px;
                color: #2C3E50;
                margin: 16px 0 8px;
              }
              .keeble-preview p {
                font-family: 'DM Sans', sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #2C3E50;
                margin: 0 0 12px;
              }
              .keeble-preview ul, .keeble-preview ol {
                font-family: 'DM Sans', sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #2C3E50;
                margin: 0 0 12px;
                padding-left: 24px;
              }
              .keeble-preview img {
                max-width: 100%;
                border-radius: 8px;
                margin: 8px 0;
              }
              .keeble-preview code {
                background: #EAF5EE;
                color: #1a5438;
                padding: 2px 5px;
                border-radius: 4px;
                font-size: 13px;
              }
              .keeble-preview pre {
                background: #1e2d25;
                color: #a8d5b5;
                padding: 12px 16px;
                border-radius: 8px;
                overflow-x: auto;
                font-size: 13px;
                line-height: 1.6;
              }
              .keeble-preview pre code {
                background: none;
                color: inherit;
                padding: 0;
              }
              .keeble-preview blockquote {
                border-left: 3px solid #2B6E4E;
                margin: 0 0 12px;
                padding: 4px 0 4px 14px;
                color: #4A6275;
                font-style: italic;
              }
            `}</style>
            {previewHtml ? (
              <div className="keeble-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p
                style={{
                  color: '#B2BEC3',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  fontStyle: 'italic',
                }}
              >
                Preview will appear here…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete confirmation dialog ── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px 24px',
              maxWidth: '360px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 8px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '17px',
                fontWeight: 600,
                color: '#2C3E50',
              }}
            >
              Delete this guide?
            </h3>
            <p
              style={{
                margin: '0 0 20px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                color: '#6C838D',
              }}
            >
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #D5DBDD',
                  background: 'white',
                  color: '#2C3E50',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#C62828',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
