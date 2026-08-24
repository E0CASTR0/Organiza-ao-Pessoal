import { useEffect, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { ThemeMode } from '@/db/models'
import { getSettings, setTheme as persistTheme } from '@/db/repositories/settings.repo'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

function readInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignora — segue com o padrão
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme)
  const settings = useLiveQuery(() => getSettings(), [])

  // Assim que o Dexie carrega, ele vira a fonte da verdade (pode divergir do cache rápido do localStorage)
  useEffect(() => {
    if (settings && settings.theme !== theme) {
      setThemeState(settings.theme)
    }
  }, [settings, theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const applyTheme = (next: ThemeMode) => {
    setThemeState(next)
    void persistTheme(next)
  }

  const value: ThemeContextValue = {
    theme,
    toggleTheme: () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
    setTheme: applyTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
