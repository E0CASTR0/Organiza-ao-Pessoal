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
      {/* posição base travada em left-0.5/top-0.5 — sem isso o navegador calcula uma posição
          "estática" ambígua pro span (o <button> tem text-align:center por padrão), o que fazia
          o círculo pular pro meio da trilha em vez de deslizar de um lado pro outro */}
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--bg-elevated-1)] shadow-[0_1px_4px_var(--shadow)] transition-transform duration-150 ${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
