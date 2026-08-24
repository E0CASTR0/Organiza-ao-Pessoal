import { db } from '../db'
import type { EventItem } from '../models'
import { moveToTrash } from './trash.repo'

export function listEventsByDate(date: string) {
  return db.events.where('date').equals(date).sortBy('time')
}

export function listEventsBetween(startDate: string, endDate: string) {
  return db.events.where('date').between(startDate, endDate, true, true).sortBy('date')
}

export interface EventInput {
  title: string
  date: string
  time: string | null
  notes: string
}

export async function addEvent(input: EventInput): Promise<void> {
  const now = new Date().toISOString()
  const event: EventItem = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  await db.events.add(event)
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  await db.events.update(id, { ...input, updatedAt: new Date().toISOString() })
}

export async function removeEvent(id: string): Promise<void> {
  const event = await db.events.get(id)
  if (!event) return
  await moveToTrash('events', id, event.title, event)
  await db.events.delete(id)
}
