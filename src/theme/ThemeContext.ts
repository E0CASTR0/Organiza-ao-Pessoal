import { createContext } from 'react'
import type { AccentKey, ThemeMode } from '@/db/models'

export interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  accent: AccentKey
  setAccent: (accent: AccentKey) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
