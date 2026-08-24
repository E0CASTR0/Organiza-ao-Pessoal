import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    // h-dvh (altura "dinâmica" do viewport) em vez de min-h-full/100vh: no Safari do
    // iPhone, a barra de endereço/navegação some e volta dependendo de quanto a página
    // rola, e 100vh não acompanha isso — o que fazia a barra de baixo (fixed) "pular"
    // ao trocar de página com altura de conteúdo diferente. Com o layout inteiro preso a
    // h-dvh e a barra como último item de um flex-col (não mais position:fixed), ela
    // sempre fica exatamente na base do viewport visível, sem recalcular nada.
    <div className="flex h-dvh flex-col bg-[var(--bg-base)]">
      <main
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ paddingTop: 'calc(var(--safe-top) + 1.25rem)' }}
      >
        <div className="mx-auto max-w-lg px-4 pb-6">{children}</div>
      </main>
      <BottomTabBar />
    </div>
  )
}
