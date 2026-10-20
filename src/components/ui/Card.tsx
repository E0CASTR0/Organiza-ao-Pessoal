import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

/** Cartão com acabamento em camadas (brilho de topo, contorno em degradê, realce de 1 px) —
 * ver `.surface` em surfaces.css. */
export function Card({ children, elevated = false, className = '', onClick, ...rest }: CardProps) {
  const interactive = typeof onClick === 'function'
  return (
    <div
      // cartão clicável também precisa funcionar pelo teclado (Enter / Espaço)
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                e.currentTarget.click()
              }
            }
          : undefined
      }
      // cartão clicável "afunda" um pouquinho sob o dedo, igual aos botões
      className={`surface rounded-[var(--radius-md)] ${elevated ? 'surface-raised' : ''} ${
        interactive ? 'surface-interactive press cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}
