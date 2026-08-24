import { db } from '../db'
import type { DailyGoal, DailyGoalCompletion } from '../models'
import { moveToTrash } from './trash.repo'

/** Lista as metas cadastradas — persistentes, aparecem todo dia até serem apagadas de propósito. */
export function listGoals() {
  return db.dailyGoals.orderBy('order').toArray()
}

/** Conclusões do dia informado — é essa consulta, escopada por data, que faz o check
 * "reiniciar sozinho" à meia-noite: no dia seguinte simplesmente não existe conclusão
 * ainda pra essa data, sem precisar apagar nem agendar nada. */
export function listCompletionsByDate(date: string) {
  return db.dailyGoalCompletions.where('date').equals(date).toArray()
}

export async function addGoal(title: string): Promise<void> {
  const count = await db.dailyGoals.count()
  const goal: DailyGoal = {
    id: crypto.randomUUID(),
    title,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.dailyGoals.add(goal)
}

export async function toggleGoalForDate(goalId: string, date: string): Promise<void> {
  const existing = await db.dailyGoalCompletions.where({ goalId, date }).first()
  if (existing) {
    await db.dailyGoalCompletions.delete(existing.id)
  } else {
    const completion: DailyGoalCompletion = {
      id: crypto.randomUUID(),
      goalId,
      date,
      completedAt: new Date().toISOString(),
    }
    await db.dailyGoalCompletions.add(completion)
  }
}

export async function renameGoal(id: string, title: string): Promise<void> {
  await db.dailyGoals.update(id, { title })
}

export async function removeGoal(id: string): Promise<void> {
  const goal = await db.dailyGoals.get(id)
  if (!goal) return
  await moveToTrash('dailyGoals', id, goal.title, goal)
  await db.dailyGoals.delete(id)
  await db.dailyGoalCompletions.where('goalId').equals(id).delete()
}
