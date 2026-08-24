interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-6 py-10 text-center">
      <p className="text-[var(--text-secondary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-tertiary)]">{description}</p>}
    </div>
  )
}
