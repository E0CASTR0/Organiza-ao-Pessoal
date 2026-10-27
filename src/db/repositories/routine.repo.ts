import { db } from '../db'
import type { RoutineBlock } from '../models'
import { moveToTrash } from './trash.repo'

/** Todos os blocos da rotina, dia a dia, na ordem em que acontecem. */
export async function listRoutineBlocks(): Promise<RoutineBlock[]> {
  const all = await db.routineBlocks.toArray()
  return all.sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start))
}

export interface RoutineBlockInput {
  weekday: RoutineBlock['weekday']
  start: string
  end: string
  title: string
  skill: string
  category: RoutineBlock['category']
  detail: string
  focus: boolean
}

export async function addRoutineBlock(input: RoutineBlockInput): Promise<void> {
  const now = new Date().toISOString()
  const { focus, ...rest } = input
  await db.routineBlocks.add({ id: crypto.randomUUID(), ...rest, ...(focus ? { focus: true } : {}), createdAt: now, updatedAt: now })
}

export async function updateRoutineBlock(id: string, input: RoutineBlockInput): Promise<void> {
  const { focus, ...rest } = input
  await db.routineBlocks.update(id, { ...rest, focus: focus || undefined, updatedAt: new Date().toISOString() })
}

export async function removeRoutineBlock(id: string): Promise<void> {
  const block = await db.routineBlocks.get(id)
  if (!block) return
  await moveToTrash('routineBlocks', id, `${block.title} (${block.start})`, block)
  await db.routineBlocks.delete(id)
}
