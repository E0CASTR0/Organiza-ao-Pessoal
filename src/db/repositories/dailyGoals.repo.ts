import { db } from '../db'
import type { DailyGoal } from '../models'
import { moveToTrash } from './trash.repo'

export function listGoalsByDate(date: string) {
  return db.dailyGoals.where('date').equals(date).sortBy('order')
}

export async function addGoal(date: string, title: string): Promise<void> {
  const count = await db.dailyGoals.where('date').equals(date).count()
  const goal: DailyGoal = {
    id: crypto.randomUUID(),
    date,
    title,
    completed: false,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.dailyGoals.add(goal)
}

export async function toggleGoal(id: string): Promise<void> {
  const goal = await db.dailyGoals.get(id)
  if (!goal) return
  await db.dailyGoals.update(id, { completed: !goal.completed })
}

export async function renameGoal(id: string, title: string): Promise<void> {
  await db.dailyGoals.update(id, { title })
}

export async function removeGoal(id: string): Promise<void> {
  const goal = await db.dailyGoals.get(id)
  if (!goal) return
  await moveToTrash('dailyGoals', id, goal.title, goal)
  await db.dailyGoals.delete(id)
}
