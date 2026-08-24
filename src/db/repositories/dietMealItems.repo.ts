import { db } from '../db'
import type { DietMealItem, MealSlotKey } from '../models'
import { moveToTrash } from './trash.repo'

export function listItemsByDiet(dietId: string) {
  return db.dietMealItems.where('dietId').equals(dietId).sortBy('order')
}

export function listItemsByDietAndMeal(dietId: string, meal: MealSlotKey) {
  return db.dietMealItems.where({ dietId, meal }).sortBy('order')
}

export interface DietMealItemInput {
  dietId: string
  meal: MealSlotKey
  name: string
  calories: number | null
}

export async function addMealItem(input: DietMealItemInput): Promise<void> {
  const count = await db.dietMealItems.where({ dietId: input.dietId, meal: input.meal }).count()
  const item: DietMealItem = {
    id: crypto.randomUUID(),
    ...input,
    order: count,
  }
  await db.dietMealItems.add(item)
}

export async function removeMealItem(id: string): Promise<void> {
  const item = await db.dietMealItems.get(id)
  if (!item) return
  await moveToTrash('dietMealItems', id, item.name, item)
  await db.dietMealItems.delete(id)
}
