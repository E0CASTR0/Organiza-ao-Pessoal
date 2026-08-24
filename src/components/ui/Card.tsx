import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

export function Card({ children, elevated = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--border-subtle)] ${
        elevated ? 'bg-[var(--bg-elevated-2)]' : 'bg-[var(--bg-elevated-1)]'
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
