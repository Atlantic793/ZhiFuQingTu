type Props = {
  enabled: boolean;
  onChange: (next: boolean) => void;
  compact?: boolean;
};

const PortraitToggle = ({ enabled, onChange, compact = false }: Props) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      title={enabled ? '已结合个人画像作答' : '未结合个人画像'}
      className={`inline-flex items-center gap-1.5 rounded-claude-pill border px-2.5 py-1 transition-colors ${
        enabled
          ? 'border-claude-primary/40 bg-claude-primary/10 text-claude-ink'
          : 'border-claude-hairline bg-white text-claude-muted hover:text-claude-ink'
      } ${compact ? 'text-[11px]' : 'text-xs'}`}
    >
      <span
        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-claude-primary' : 'bg-claude-hairline'
        }`}
      >
        <span
          className={`absolute h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      结合画像
    </button>
  );
};

export default PortraitToggle;
