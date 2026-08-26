import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { SwipeView } from './SwipeView'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    // fixed + inset-0 direto no container do app: gruda nas 4 bordas do viewport real,
    // sem depender de nenhum cálculo de altura (dvh/%/JS já se mostraram não confiáveis
    // no modo instalado do iOS real).
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)]">
      <main
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingTop: 'calc(var(--safe-top) + 1.25rem)' }}
      >
        {/* pb-28 dá espaço pro conteúdo não ficar escondido atrás da barra, que agora é
            fixed (fora do fluxo do flex) — o valor é um chute generoso fixo, não precisa
            bater exato com a altura real da barra, só precisa ser grande o bastante */}
        <SwipeView>
          <div className="mx-auto max-w-lg px-4 pb-28">{children}</div>
        </SwipeView>
      </main>
      <BottomTabBar />
    </div>
  )
}
