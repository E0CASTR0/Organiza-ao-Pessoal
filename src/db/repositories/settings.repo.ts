import { db } from '../db'
import type { AccentKey, ThemeMode } from '../models'

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

export async function setAccent(accent: AccentKey): Promise<void> {
  await db.settings.update('settings', { accent, updatedAt: new Date().toISOString() })
  try {
    localStorage.setItem('accent', accent)
  } catch {
    // idem
  }
}

export async function setWaterGoal(waterGoal: number): Promise<void> {
  await db.settings.update('settings', { waterGoal, updatedAt: new Date().toISOString() })
}
