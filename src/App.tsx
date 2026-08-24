import { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AppRoutes } from '@/router/routes'
import { ensureSeedData } from '@/db/db'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void ensureSeedData().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <ThemeProvider>
      <HashRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </HashRouter>
    </ThemeProvider>
  )
}
