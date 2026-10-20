import { useState } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label?: string
  /** Risca o texto e o esmaece quando marcado (padrão). Desligue quando o texto descreve o
   * estado em vez de ser o item em si (ex: "Comprado" / "Não comprado"). */
  strike?: boolean
  className?: string
  'aria-label'?: string
}

/** Checkbox customizado (não o input nativo) pra caber no visual "old money" —
 * usado em metas do dia, prioridades, tarefas, comprado/não comprado, pago/não pago.
 * Ao marcar: a caixinha preenche com um "pop", o visto é desenhado traço a traço e o texto
 * é riscado e esmaece (a animação está em motion.css, ligada ao data-checked). */
export function Checkbox({ checked, onChange, label, strike = true, className = '', ...rest }: CheckboxProps) {
  const [popping, setPopping] = useState(false)

  const handleClick = () => {
    // o "pop" só ao marcar, e só por esta interação (não ao abrir a tela com itens já feitos)
    if (!checked) {
      setPopping(true)
      window.setTimeout(() => setPopping(false), 340)
    }
    onChange()
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-checked={checked}
      onClick={handleClick}
      className={`check inline-flex shrink-0 items-center gap-2.5 text-left ${className}`}
      {...rest}
    >
      <span data-pop={popping} className="check-box flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
          <path
            className="check-tick"
            d="M1 5L4.5 8.5L11 1.5"
            pathLength={1}
            stroke="var(--accent-contrast)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label && <span className={strike ? 'check-label' : 'text-[var(--text-primary)]'}>{label}</span>}
    </button>
  )
}
