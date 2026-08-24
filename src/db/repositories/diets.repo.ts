import { db } from '../db'
import type { Diet, MealSlotKey } from '../models'
import { DEFAULT_ENABLED_MEALS } from '@/utils/mealSlots'
import { moveToTrash } from './trash.repo'

export async function listDiets() {
  // 'updatedAt' não é um índice no schema (só 'id') — orderBy() exige índice, então
  // ordenamos em memória, o que é perfeitamente rápido pro volume de dados de um app pessoal.
  const all = await db.diets.toArray()
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getActiveDiet() {
  return db.diets.filter((d) => d.isActive).first()
}

export async function addDiet(title: string, content: string, enabledMeals: MealSlotKey[] = DEFAULT_ENABLED_MEALS): Promise<void> {
  const now = new Date().toISOString()
  const anyActive = await db.diets.filter((d) => d.isActive).count()
  const diet: Diet = {
    id: crypto.randomUUID(),
    title,
    content,
    isActive: anyActive === 0, // primeira dieta criada já vira a ativa
    enabledMeals,
    createdAt: now,
    updatedAt: now,
  }
  await db.diets.add(diet)
}

export async function updateDiet(id: string, title: string, content: string, enabledMeals: MealSlotKey[]): Promise<void> {
  await db.diets.update(id, { title, content, enabledMeals, updatedAt: new Date().toISOString() })
}

/** Marca essa dieta como ativa e desmarca qualquer outra — sem apagar nenhuma. */
export async function setActiveDiet(id: string): Promise<void> {
  await db.transaction('rw', db.diets, async () => {
    const all = await db.diets.toArray()
    await Promise.all(
      all.map((diet) => db.diets.update(diet.id, { isActive: diet.id === id })),
    )
  })
}

export async function removeDiet(id: string): Promise<void> {
  const diet = await db.diets.get(id)
  if (!diet) return
  await moveToTrash('diets', id, diet.title, diet)
  await db.diets.delete(id)
  await db.dietMealItems.where('dietId').equals(id).delete()
}
