import { db } from '../db'
import type { WorkTask } from '../models'
import { moveToTrash } from './trash.repo'

export function listWorkTasks() {
  return db.workTasks.orderBy('order').toArray()
}

export interface WorkTaskInput {
  title: string
  notes: string
  dueDate: string | null
}

export async function addWorkTask(input: WorkTaskInput): Promise<void> {
  const count = await db.workTasks.count()
  const task: WorkTask = {
    id: crypto.randomUUID(),
    ...input,
    completed: false,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.workTasks.add(task)
}

export async function toggleWorkTask(id: string): Promise<void> {
  const task = await db.workTasks.get(id)
  if (!task) return
  await db.workTasks.update(id, { completed: !task.completed })
}

export async function updateWorkTask(id: string, input: Partial<WorkTaskInput>): Promise<void> {
  await db.workTasks.update(id, input)
}

export async function removeWorkTask(id: string): Promise<void> {
  const task = await db.workTasks.get(id)
  if (!task) return
  await moveToTrash('workTasks', id, task.title, task)
  await db.workTasks.delete(id)
}
