import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { SwipeView } from './SwipeView'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    // fixed + inset-0 direto no container do app, em vez de calcular a altura por
    // porcentagem/dvh/JS: nenhuma dessas contas se mostrou confiável no modo instalado
    // do iOS (sobrava uma faixa preta embaixo da barra de navegação). fixed+inset:0 não
    // depende de NENHUM cálculo de altura — só gruda direto nas 4 bordas do viewport
    // real, do mesmo jeito que o html/body já fazem (ver theme.css) pra travar o
    // "elástico" do scroll. É o mecanismo mais simples que existe pra isso.
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)]">
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
