import { db } from '../db'
import type { MonthlyPriority } from '../models'
import { moveToTrash } from './trash.repo'

export function listPrioritiesByMonth(month: string) {
  return db.monthlyPriorities.where('month').equals(month).sortBy('order')
}

export async function addPriority(month: string, title: string): Promise<void> {
  const count = await db.monthlyPriorities.where('month').equals(month).count()
  const priority: MonthlyPriority = {
    id: crypto.randomUUID(),
    month,
    title,
    completed: false,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.monthlyPriorities.add(priority)
}

export async function togglePriority(id: string): Promise<void> {
  const item = await db.monthlyPriorities.get(id)
  if (!item) return
  await db.monthlyPriorities.update(id, { completed: !item.completed })
}

export async function removePriority(id: string): Promise<void> {
  const item = await db.monthlyPriorities.get(id)
  if (!item) return
  await moveToTrash('monthlyPriorities', id, item.title, item)
  await db.monthlyPriorities.delete(id)
}
