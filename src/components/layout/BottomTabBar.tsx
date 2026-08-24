import { NavLink } from 'react-router-dom'
import { HomeIcon, CalendarIcon, ListIcon, DumbbellIcon, GridIcon } from '@/components/ui/icons'
import type { ComponentType, SVGProps } from 'react'

interface Tab {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const tabs: Tab[] = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/agenda', label: 'Agenda', Icon: CalendarIcon },
  { to: '/listas', label: 'Listas', Icon: ListIcon },
  { to: '/rotina', label: 'Rotina', Icon: DumbbellIcon },
  { to: '/mais', label: 'Mais', Icon: GridIcon },
]

export function BottomTabBar() {
  return (
    // sem position:fixed de propósito — como item normal do flex-col do AppShell (que
    // já tem altura travada em h-dvh), essa barra fica sempre grudada na base real do
    // viewport, sem o "pulo" que o fixed causava entre páginas de alturas diferentes.
    <nav
      className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated-1)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
              }`
            }
          >
            <Icon width={22} height={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
