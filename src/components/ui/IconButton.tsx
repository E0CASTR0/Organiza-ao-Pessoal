import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Tone = 'muted' | 'danger' | 'accent'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  /** Texto pra leitor de tela (o botão só tem ícone). */
  label: string
  tone?: Tone
  children: ReactNode
}

const toneClasses: Record<Tone, string> = {
  muted: 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
  danger: 'text-[var(--text-tertiary)] hover:text-[var(--danger-strong)]',
  accent: 'text-[var(--accent)] hover:text-[var(--accent-strong)]',
}

/** Botão só de ícone com área de toque de ~40 px (o confortável pro dedo é 44) sem mexer no
 * layout: o padding grande é compensado por uma margem negativa igual, então o espaço que ele
 * ocupa na tela continua sendo o do ícone. Cuidado: dois IconButtons lado a lado precisam de
 * pelo menos 24 px de espaço entre os ícones, senão as áreas de toque se sobrepõem. */
export function IconButton({ label, tone = 'muted', className = '', children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`press -m-3 inline-flex shrink-0 items-center justify-center rounded-full p-3 ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
