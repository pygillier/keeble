interface TagPillProps {
  label: string;
  variant?: 'green' | 'amber' | 'slate';
  active?: boolean;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  green: {
    background: '#EAF5EE',
    color: '#2B6E4E',
    border: '1px solid #A3D6B8',
    activeBackground: '#2B6E4E',
    activeColor: '#ffffff',
  },
  amber: {
    background: '#FDF4EE',
    color: '#C06438',
    border: '1px solid #EDB07B',
    activeBackground: '#D97B4F',
    activeColor: '#ffffff',
  },
  slate: {
    background: '#ECF0F1',
    color: '#4A6275',
    border: '1px solid #B2BEC3',
    activeBackground: '#4A6275',
    activeColor: '#ffffff',
  },
};

export function TagPill({ label, variant = 'green', active = false, onClick }: TagPillProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingInline: '10px',
        paddingBlock: '4px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.4,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        border: active ? 'none' : s.border,
        background: active ? s.activeBackground : s.background,
        color: active ? s.activeColor : s.color,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {label}
    </span>
  );
}
