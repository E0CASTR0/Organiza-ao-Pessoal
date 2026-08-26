import { db } from '../db'
import type { Note } from '../models'
import { moveToTrash } from './trash.repo'

export async function listNotes() {
  // 'updatedAt' não é indexado — ordena em memória (mesmo padrão usado em diets.repo)
  const all = await db.notes.toArray()
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getNote(id: string) {
  return db.notes.get(id)
}

export async function addNote(title: string, content: string): Promise<string> {
  const now = new Date().toISOString()
  const note: Note = { id: crypto.randomUUID(), title, content, createdAt: now, updatedAt: now }
  await db.notes.add(note)
  return note.id
}

export async function updateNote(id: string, title: string, content: string): Promise<void> {
  await db.notes.update(id, { title, content, updatedAt: new Date().toISOString() })
}

export async function removeNote(id: string): Promise<void> {
  const note = await db.notes.get(id)
  if (!note) return
  await moveToTrash('notes', id, note.title || 'Nota sem título', note)
  await db.notes.delete(id)
}
