import { db } from '../db'
import type { ShoppingItem } from '../models'
import { moveToTrash } from './trash.repo'

export function listShoppingItems() {
  return db.shoppingItems.orderBy('order').toArray()
}

export interface ShoppingItemInput {
  name: string
  price: number | null
  imageBase64: string | null
}

export async function addShoppingItem(input: ShoppingItemInput): Promise<void> {
  const count = await db.shoppingItems.count()
  const item: ShoppingItem = {
    id: crypto.randomUUID(),
    ...input,
    bought: false,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.shoppingItems.add(item)
}

export async function updateShoppingItem(id: string, input: Partial<ShoppingItemInput>): Promise<void> {
  await db.shoppingItems.update(id, input)
}

export async function toggleBought(id: string): Promise<void> {
  const item = await db.shoppingItems.get(id)
  if (!item) return
  await db.shoppingItems.update(id, { bought: !item.bought })
}

export async function removeShoppingItem(id: string): Promise<void> {
  const item = await db.shoppingItems.get(id)
  if (!item) return
  await moveToTrash('shoppingItems', id, item.name, item)
  await db.shoppingItems.delete(id)
}
