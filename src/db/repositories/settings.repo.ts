import { db } from '../db'
import type { ThemeMode } from '../models'

export function getSettings() {
  return db.settings.get('settings')
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  await db.settings.update('settings', { theme, updatedAt: new Date().toISOString() })
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // localStorage indisponível (modo privado etc) — sem problema, o Dexie continua sendo a fonte da verdade
  }
}
