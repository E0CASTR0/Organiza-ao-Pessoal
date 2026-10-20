import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

export function Card({ children, elevated = false, className = '', onClick, ...rest }: CardProps) {
  return (
    <div
      // cartão clicável "afunda" um pouquinho sob o dedo, igual aos botões
      className={`rounded-[var(--radius-md)] border border-[var(--border-subtle)] ${
        elevated ? 'bg-[var(--bg-elevated-2)]' : 'bg-[var(--bg-elevated-1)]'
      } ${onClick ? 'press cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  )
}
