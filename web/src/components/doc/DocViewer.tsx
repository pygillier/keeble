'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ActionIcon, Box, Button } from '@mantine/core';
import { IconEdit, IconPencil } from '@tabler/icons-react';
import { HeaderSlot } from '@/components/layout/AppShell';
import { StepAccordion } from './StepAccordion';
import { ImageLightbox } from './ImageLightbox';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Document, Tag } from '@/types';
import type { DocStep } from '@/lib/markdown';

interface DocViewerProps {
  doc: Document;
  steps: DocStep[];
  tags: Tag[];
}

export function DocViewer({ doc, steps, tags }: DocViewerProps) {
  const t = useTranslations('doc');
  const { isAuthenticated } = useAuth();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [openStep, setOpenStep] = useState<number | null>(steps[0]?.number ?? null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  function handleMarkDone(stepNumber: number) {
    setCompleted((prev) => new Set(Array.from(prev).concat(stepNumber)));
    const idx = steps.findIndex((s) => s.number === stepNumber);
    if (idx !== -1 && idx < steps.length - 1) {
      setOpenStep(steps[idx + 1].number);
    }
  }

  const backLinkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
  };

  const backLink = <Link href="/" style={backLinkStyle}>← {t('back')}</Link>;

  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      {backLink}
      {isAuthenticated && (
        <Link href={`/edit/${doc.id}`} aria-label={t('edit')}>
          <ActionIcon variant="subtle" color="white" size="lg">
            <IconPencil size={18} />
          </ActionIcon>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Header slot — back link (+ edit button for admins) in the green app header */}
      <HeaderSlot>{headerContent}</HeaderSlot>

      {/* Document hero — green band with title + ghost tag pills */}
      <div
        style={{
          backgroundColor: '#2B6E4E',
          padding: '20px 16px 28px',
          color: 'white',
        }}
      >
        {/* Desktop-only: back link + edit button row */}
        <Box visibleFrom="md" mb={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {backLink}
          {isAuthenticated && (
            <Link href={`/edit/${doc.id}`}>
              <Button
                size="xs"
                variant="white"
                color="dark"
                leftSection={<IconEdit size={14} />}
              >
                {t('edit')}
              </Button>
            </Link>
          )}
        </Box>

        <h1
          style={{
            fontFamily: 'Lora, serif',
            fontWeight: 500,
            fontSize: 'clamp(20px, 5vw, 28px)',
            margin: '0 0 12px',
            lineHeight: 1.25,
            color: 'white',
          }}
        >
          {doc.title}
        </h1>

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step accordions */}
      <div
        style={{
          padding: '16px',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        {steps.map((step) => (
          <StepAccordion
            key={step.number}
            step={step}
            isOpen={openStep === step.number}
            isCompleted={completed.has(step.number)}
            onToggle={() => setOpenStep(openStep === step.number ? null : step.number)}
            onMarkDone={() => handleMarkDone(step.number)}
            onImageClick={setLightboxSrc}
          />
        ))}
      </div>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}
