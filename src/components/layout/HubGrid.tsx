import { Link } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'

export interface HubTile {
  to: string
  label: string
  description?: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export function HubGrid({ tiles }: { tiles: HubTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map(({ to, label, description, Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-4 transition-colors hover:bg-[var(--bg-elevated-2)]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
            <Icon width={20} height={20} />
          </span>
          <span>
            <span className="block font-medium text-[var(--text-primary)]">{label}</span>
            {description && <span className="mt-0.5 block text-xs text-[var(--text-tertiary)]">{description}</span>}
          </span>
        </Link>
      ))}
    </div>
  )
}
