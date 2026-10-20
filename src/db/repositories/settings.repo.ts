import { db } from '../db'
import type { AccentKey, NotificationPrefs, ThemeMode } from '../models'

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

export async function setNotificationPrefs(notifications: NotificationPrefs): Promise<void> {
  await db.settings.update('settings', { notifications, updatedAt: new Date().toISOString() })
}

export async function setSavingsGoal(savingsGoal: number | null): Promise<void> {
  await db.settings.update('settings', { savingsGoal, updatedAt: new Date().toISOString() })
}

export async function setWaterConfig(config: { waterLiters?: number; glassMl?: number; waterLinkedGoalId?: string | null }): Promise<void> {
  await db.settings.update('settings', { ...config, updatedAt: new Date().toISOString() })
}
