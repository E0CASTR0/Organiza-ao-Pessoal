import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
            {icon}
          </span>
        )}
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
