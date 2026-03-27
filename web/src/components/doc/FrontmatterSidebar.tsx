'use client';

import { useRef, useState } from 'react';
import { TagPill } from '@/components/ui/TagPill';
import type { Tag } from '@/types';

interface FrontmatterSidebarProps {
  title: string;
  slug: string;
  selectedTagIds: string[];
  allTags: Tag[];
  docId?: string; // undefined = new doc (image upload disabled)
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onTagsChange: (ids: string[]) => void;
  onImageInsert: (markdown: string) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: '1px solid #D5DBDD',
  borderRadius: '8px',
  padding: '8px 10px',
  fontSize: '14px',
  fontFamily: 'DM Sans, sans-serif',
  color: '#2C3E50',
  outline: 'none',
  background: 'white',
  boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#4A6275',
  fontFamily: 'DM Sans, sans-serif',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export function FrontmatterSidebar({
  title,
  slug,
  selectedTagIds,
  allTags,
  docId,
  onTitleChange,
  onSlugChange,
  onTagsChange,
  onImageInsert,
}: FrontmatterSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  function toggleTag(id: string) {
    if (selectedTagIds.includes(id)) {
      onTagsChange(selectedTagIds.filter((t) => t !== id));
    } else {
      onTagsChange([...selectedTagIds, id]);
    }
  }

  async function uploadImage(file: File) {
    if (!docId) return;
    setUploading(true);
    try {
      const { getPb } = await import('@/lib/pb');
      const pb = getPb();
      const formData = new FormData();
      formData.append('images', file);
      const updated = await pb.collection('documents').update(docId, formData);
      const filename = updated['images'][updated['images'].length - 1] as string;
      const url = pb.files.getUrl(updated, filename);
      const altText = file.name.replace(/\.[^.]+$/, '');
      onImageInsert(`![${altText}](${url})`);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) uploadImage(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Title */}
      <div>
        <label style={LABEL_STYLE}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Guide title…"
          style={INPUT_STYLE}
        />
      </div>

      {/* Slug */}
      <div>
        <label style={LABEL_STYLE}>URL slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="url-slug"
          style={{ ...INPUT_STYLE, fontFamily: 'monospace', fontSize: '13px' }}
        />
      </div>

      {/* Tags */}
      <div>
        <label style={LABEL_STYLE}>Tags</label>
        {allTags.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#6C838D',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            No tags yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allTags.map((tag) => (
              <TagPill
                key={tag.id}
                label={tag.name}
                variant="green"
                active={selectedTagIds.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image upload */}
      <div>
        <label style={LABEL_STYLE}>Images</label>
        {docId ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#2B6E4E' : '#D5DBDD'}`,
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                background: dragOver ? '#EAF5EE' : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#6C838D',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {uploading ? 'Uploading…' : 'Drag an image here or click to browse'}
              </p>
            </div>
          </>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#6C838D',
              fontFamily: 'DM Sans, sans-serif',
              fontStyle: 'italic',
            }}
          >
            Save the document first to enable image upload.
          </p>
        )}
      </div>
    </div>
  );
}
