interface Segment {
  value: string
  label: string
}

interface SegmentedControlProps {
  segments: Segment[]
  value: string
  onChange: (value: string) => void
}

/** Sub-navegação em pílulas usada dentro dos hubs (ex: Listas -> Prioridades | Compras | Trabalho). */
export function SegmentedControl({ segments, value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-1">
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          onClick={() => onChange(segment.value)}
          className={`flex-1 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
            value === segment.value
              ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
