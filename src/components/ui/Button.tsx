import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] active:bg-[var(--accent-pressed)] disabled:opacity-40',
  secondary:
    'bg-[var(--bg-elevated-2)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-elevated-3)] disabled:opacity-40',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-1)] disabled:opacity-40',
  danger:
    'bg-[var(--danger)] text-[var(--danger-contrast)] hover:bg-[var(--danger-strong)] disabled:opacity-40',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-[var(--radius-sm)] gap-1.5',
  md: 'text-[0.95rem] px-4 py-2.5 rounded-[var(--radius-md)] gap-2',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 whitespace-nowrap select-none disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
