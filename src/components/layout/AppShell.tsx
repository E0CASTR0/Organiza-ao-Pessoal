import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[var(--bg-base)]">
      <main
        className="mx-auto max-w-lg px-4 pb-28"
        style={{ paddingTop: 'calc(var(--safe-top) + 1.25rem)' }}
      >
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
