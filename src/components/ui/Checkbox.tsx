interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label?: string
  'aria-label'?: string
}

/** Checkbox customizado (não o input nativo) pra caber no visual "old money" —
 * usado em metas do dia, prioridades, tarefas, comprado/não comprado, pago/não pago. */
export function Checkbox({ checked, onChange, label, ...rest }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="inline-flex items-center gap-2.5 shrink-0"
      {...rest}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
          checked
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'bg-transparent border-[var(--border-default)]'
        }`}
      >
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1.5" stroke="var(--accent-contrast)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span className="text-[var(--text-primary)]">{label}</span>}
    </button>
  )
}
