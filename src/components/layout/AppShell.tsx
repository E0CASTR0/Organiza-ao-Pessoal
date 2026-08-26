import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { SwipeView } from './SwipeView'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    // h-full (não h-dvh): no modo instalado (standalone) do iOS, h-dvh às vezes calcula
    // uma altura menor que o viewport real, deixando uma faixa preta sobrando embaixo —
    // como o html/body já estão travados em position:fixed;inset:0 (ver theme.css), só
    // herdar 100% dessa altura já travada é mais confiável que recalcular via dvh.
    <div className="flex h-full flex-col bg-[var(--bg-base)]">
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
