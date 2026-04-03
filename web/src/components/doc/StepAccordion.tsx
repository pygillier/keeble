'use client';

import { useTranslations } from 'next-intl';
import type { DocStep } from '@/lib/markdown';

interface StepAccordionProps {
  step: DocStep;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onMarkDone: () => void;
  onImageClick: (src: string) => void;
}

export function StepAccordion({
  step,
  isOpen,
  isCompleted,
  onToggle,
  onMarkDone,
  onImageClick,
}: StepAccordionProps) {
  const t = useTranslations('doc');

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      onImageClick(target.getAttribute('src') ?? '');
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        opacity: isCompleted ? 0.65 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Header row — always visible, tap to toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Numbered circle */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Lora, serif',
            fontSize: '16px',
            fontWeight: 500,
            backgroundColor: isCompleted ? '#3D9970' : '#2B6E4E',
            color: 'white',
            transition: 'background-color 0.2s',
          }}
        >
          {isCompleted ? '✓' : step.number}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#2C3E50',
              fontFamily: 'DM Sans, sans-serif',
              display: 'block',
            }}
          >
            {step.title || t('step', { number: step.number })}
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6C838D"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible content */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '3000px' : '0',
          transition: 'max-height 0.35s ease',
        }}
      >
        <style>{`.step-content img { max-width: 100%; height: auto; }`}</style>
        <div
          className="step-content"
          style={{ padding: '0 16px 8px', fontSize: '17px', lineHeight: 1.7, color: '#2C3E50' }}
          // Images in the rendered HTML are intercepted for the lightbox
          onClick={handleContentClick}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: step.html }}
        />

        {!isCompleted && (
          <div style={{ padding: '8px 16px 16px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkDone();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2B6E4E',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              ✓ {t('markDone')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
