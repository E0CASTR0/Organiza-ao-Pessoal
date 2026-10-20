import { useEffect, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { AccentKey, ThemeMode } from '@/db/models'
import { getSettings, setTheme as persistTheme, setAccent as persistAccent } from '@/db/repositories/settings.repo'
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

const ACCENTS: AccentKey[] = ['prata', 'champagne', 'bronze', 'salvia']

function readInitialAccent(): AccentKey {
  try {
    const saved = localStorage.getItem('accent')
    if (saved && (ACCENTS as string[]).includes(saved)) return saved as AccentKey
  } catch {
    // ignora — segue com o padrão
  }
  return 'prata'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme)
  const [accent, setAccentState] = useState<AccentKey>(readInitialAccent)
  const settings = useLiveQuery(() => getSettings(), [])

  // Assim que o Dexie carrega, ele vira a fonte da verdade (pode divergir do cache rápido do localStorage)
  useEffect(() => {
    if (settings && settings.theme !== theme) {
      setThemeState(settings.theme)
    }
  }, [settings, theme])

  useEffect(() => {
    if (settings?.accent && settings.accent !== accent) {
      setAccentState(settings.accent)
    }
  }, [settings, accent])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  const applyTheme = (next: ThemeMode) => {
    setThemeState(next)
    void persistTheme(next)
  }

  const value: ThemeContextValue = {
    theme,
    toggleTheme: () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
    setTheme: applyTheme,
    accent,
    setAccent: (next) => {
      setAccentState(next)
      void persistAccent(next)
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
