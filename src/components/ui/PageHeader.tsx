import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="mb-1 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="surface surface-raised flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-heading truncate text-[1.55rem] font-semibold leading-tight text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
