import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

/** Cartão com acabamento em camadas (brilho de topo, contorno em degradê, realce de 1 px) —
 * ver `.surface` em surfaces.css. */
export function Card({ children, elevated = false, className = '', onClick, ...rest }: CardProps) {
  return (
    <div
      // cartão clicável "afunda" um pouquinho sob o dedo, igual aos botões
      className={`surface rounded-[var(--radius-md)] ${elevated ? 'surface-raised' : ''} ${
        onClick ? 'surface-interactive press cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}
