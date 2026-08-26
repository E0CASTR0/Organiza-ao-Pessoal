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
    // position:fixed direto no viewport (bottom:0), com um valor FIXO de 20px de respiro
    // embaixo — não usa mais env(safe-area-inset-bottom) nem depende da altura calculada
    // do container pai: no aparelho real, esses cálculos vinham dando um espaço vazio
    // grande demais embaixo da barra, então em vez de tentar acertar o valor "certo"
    // dinamicamente, travei num número fixo pequeno que gruda a barra na base de verdade.
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] pb-5"
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
