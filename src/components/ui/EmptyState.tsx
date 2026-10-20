import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  /** Ícone opcional (22 px) mostrado num círculo acima do título. */
  icon?: ReactNode
  /** Botão que ensina o que fazer pra preencher a tela. */
  actionLabel?: string
  onAction?: () => void
}

/** Tela vazia que convida a agir: ícone, uma frase do que é e, quando faz sentido, o botão pra
 * começar. O `empty-fade` só mostra depois de 160 ms — evita a "piscada" de vazio enquanto o
 * banco ainda está respondendo (ver motion.css). */
export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-fade surface flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] px-6 py-8 text-center">
      {icon && <span className="surface surface-raised mb-1.5 flex h-11 w-11 items-center justify-center rounded-full text-[var(--accent)]">{icon}</span>}
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      {description && <p className="max-w-[28ch] text-sm text-[var(--text-secondary)]">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-2.5">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
