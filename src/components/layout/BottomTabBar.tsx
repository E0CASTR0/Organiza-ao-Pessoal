import { NavLink, useLocation } from 'react-router-dom'
import { HomeIcon, CalendarIcon, ListIcon, DumbbellIcon, GridIcon } from '@/components/ui/icons'
import { currentTabIndex } from './tabs'
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
  const { pathname } = useLocation()
  const activeIndex = currentTabIndex(pathname)

  return (
    // position:fixed direto no viewport (bottom:0), com um valor FIXO de 20px de respiro
    // embaixo — não usa mais env(safe-area-inset-bottom) nem depende da altura calculada
    // do container pai: no aparelho real, esses cálculos vinham dando um espaço vazio
    // grande demais embaixo da barra, então em vez de tentar acertar o valor "certo"
    // dinamicamente, travei num número fixo pequeno que gruda a barra na base de verdade.
    // position:fixed direto no viewport (bottom:0) com respiro fixo — confirmado funcionando
    // no aparelho real (o bug anterior era só cache do Safari). Em 20/10/2026 o respiro de baixo
    // caiu de 20px pra 12px (+ 4px do próprio botão) e a barra ficou mais baixa/compacta, como a
    // do Instagram: o texto das abas fica a ~16px da borda, ainda acima do risquinho do iPhone.
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] pb-3">
      <div className="relative mx-auto flex max-w-lg items-stretch justify-between px-2">
        {/* Indicador da aba ativa: uma barrinha prateada colada no topo da barra que DESLIZA de uma
            aba pra outra. É só um enfeite visual posicionado dentro do contêiner das abas
            (absolute, sem entrar no fluxo): não altera a posição, a altura nem o espaçamento da
            barra. left-2 = o px-2 do contêiner; a largura é a de uma aba (5 abas iguais). */}
        <span
          aria-hidden="true"
          className="tab-indicator pointer-events-none absolute left-2 top-0 flex justify-center"
          style={{ width: 'calc((100% - 1rem) / 5)', transform: `translate3d(${activeIndex * 100}%, 0, 0)` }}
        >
          <span className="h-[2px] w-7 rounded-full bg-[var(--accent)]" />
        </span>
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex flex-1 flex-col items-center gap-1 pb-1 pt-2.5 text-[11px] font-medium transition-colors duration-200 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
              }`
            }
          >
            {/* só o ícone "afunda" sob o dedo — a barra em si não se mexe */}
            <Icon width={22} height={22} className="transition-transform duration-200 ease-[var(--ease-spring)] group-active:scale-90" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
