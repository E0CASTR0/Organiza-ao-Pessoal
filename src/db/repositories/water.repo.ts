import { db } from '../db'
import type { DailyGoal, Settings } from '../models'

export const DEFAULT_WATER_LITERS = 3
export const DEFAULT_GLASS_ML = 250
const MAX_GLASSES = 40

type WaterSettings = Pick<Settings, 'waterLiters' | 'glassMl'> | undefined

export function waterLiters(settings: WaterSettings): number {
  return settings?.waterLiters ?? DEFAULT_WATER_LITERS
}

export function glassMl(settings: WaterSettings): number {
  return settings?.glassMl ?? DEFAULT_GLASS_ML
}

/** Quantos copos fecham a meta do dia, ARREDONDANDO PRA CIMA (3 L em copos de 250 ml = 12;
 * 8,4 copos viram 9) — pra nunca ficar um golinho abaixo da meta. */
export function waterTargetGlasses(settings: WaterSettings): number {
  return Math.max(1, Math.ceil((waterLiters(settings) * 1000) / glassMl(settings)))
}

/** Litros bebidos, com vírgula ("1,25"). */
export function formatLiters(glasses: number, settings: WaterSettings): string {
  const liters = (glasses * glassMl(settings)) / 1000
  return liters.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

/** A meta do dia que fecha sozinha quando a água fecha: a escolhida em Configurações; se nada
 * foi escolhido (undefined), a primeira meta cujo nome fala de água; se foi "nenhuma" (null), nenhuma. */
export function findLinkedWaterGoal(goals: DailyGoal[], settings: Settings | undefined): DailyGoal | undefined {
  const linked = settings?.waterLinkedGoalId
  if (linked === null) return undefined
  if (linked) return goals.find((goal) => goal.id === linked)
  return goals.find((goal) => /[áa]gua/i.test(goal.title))
}

export function getGlasses(date: string): Promise<number> {
  return db.waterLogs
    .where('date')
    .equals(date)
    .first()
    .then((log) => log?.glasses ?? 0)
}

/** Soma (ou subtrai) copos no dia, sem passar de 0 nem do teto. Quando o total chega à meta, a
 * meta diária ligada à água (ex: "Beber 3 litros de água") é marcada como feita sozinha; se o
 * total cair abaixo da meta de novo, só desmarca se foi a água que marcou (nunca desfaz um check
 * que você mesmo fez). */
export async function addGlasses(date: string, delta: number): Promise<void> {
  await db.transaction('rw', [db.waterLogs, db.settings, db.dailyGoals, db.dailyGoalCompletions], async () => {
    const now = new Date().toISOString()
    const existing = await db.waterLogs.where('date').equals(date).first()
    let glasses: number
    if (existing) {
      glasses = Math.min(MAX_GLASSES, Math.max(0, existing.glasses + delta))
      await db.waterLogs.update(existing.id, { glasses, updatedAt: now })
    } else {
      glasses = Math.min(MAX_GLASSES, Math.max(0, delta))
      if (glasses > 0) await db.waterLogs.add({ id: crypto.randomUUID(), date, glasses, updatedAt: now })
    }

    const settings = await db.settings.get('settings')
    const goal = findLinkedWaterGoal(await db.dailyGoals.toArray(), settings)
    if (!goal) return
    const done = glasses >= waterTargetGlasses(settings)
    const completion = await db.dailyGoalCompletions.where({ goalId: goal.id, date }).first()
    if (done && !completion) {
      await db.dailyGoalCompletions.add({ id: crypto.randomUUID(), goalId: goal.id, date, completedAt: now, auto: true })
    } else if (!done && completion?.auto) {
      await db.dailyGoalCompletions.delete(completion.id)
    }
  })
}
