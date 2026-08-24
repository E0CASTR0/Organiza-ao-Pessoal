interface ToggleProps {
  checked: boolean
  onChange: () => void
  'aria-label'?: string
}

export function Toggle({ checked, onChange, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
        checked ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-elevated-3)] border-[var(--border-default)]'
      }`}
      {...rest}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--bg-elevated-1)] shadow-[0_1px_4px_var(--shadow)] transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
