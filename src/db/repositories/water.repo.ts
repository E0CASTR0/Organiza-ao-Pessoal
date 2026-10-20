import { db } from '../db'

const DEFAULT_GOAL = 8
const MAX_GLASSES = 30

export function getGlasses(date: string): Promise<number> {
  return db.waterLogs
    .where('date')
    .equals(date)
    .first()
    .then((log) => log?.glasses ?? 0)
}

/** Soma (ou subtrai) copos no dia, sem passar de 0 nem de MAX_GLASSES. */
export async function addGlasses(date: string, delta: number): Promise<void> {
  await db.transaction('rw', db.waterLogs, async () => {
    const existing = await db.waterLogs.where('date').equals(date).first()
    const now = new Date().toISOString()
    if (existing) {
      const glasses = Math.min(MAX_GLASSES, Math.max(0, existing.glasses + delta))
      await db.waterLogs.update(existing.id, { glasses, updatedAt: now })
    } else if (delta > 0) {
      await db.waterLogs.add({ id: crypto.randomUUID(), date, glasses: Math.min(MAX_GLASSES, delta), updatedAt: now })
    }
  })
}

export { DEFAULT_GOAL as DEFAULT_WATER_GOAL }
