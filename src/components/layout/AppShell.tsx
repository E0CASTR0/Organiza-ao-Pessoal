import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { SwipeView } from './SwipeView'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    // --app-height vem de window.innerHeight, calculado em JS (ver index.html) — nem
    // h-dvh nem h-full (100%) se mostraram confiáveis no modo instalado do iOS (sobrava
    // uma faixa preta embaixo da barra de navegação); window.innerHeight é a fonte da
    // verdade que o próprio Safari usa pro tamanho real da tela nesse modo.
    <div className="flex h-[var(--app-height)] flex-col bg-[var(--bg-base)]">
      <main
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingTop: 'calc(var(--safe-top) + 1.25rem)' }}
      >
        <SwipeView>
          <div className="mx-auto max-w-lg px-4 pb-6">{children}</div>
        </SwipeView>
      </main>
      <BottomTabBar />
    </div>
  )
}
