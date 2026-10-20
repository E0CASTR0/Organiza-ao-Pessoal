import { db } from '../db'
import type { SavingsEntry } from '../models'
import { moveToTrash } from './trash.repo'

/** Lançamentos da Caixinha, os mais recentes primeiro (mesma data: o último lançado em cima). */
export async function listSavingsEntries(): Promise<SavingsEntry[]> {
  const all = await db.savingsEntries.toArray()
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export interface SavingsInput {
  date: string
  amount: number // positivo = guardou, negativo = retirou
  note: string
}

export async function addSavingsEntry(input: SavingsInput): Promise<void> {
  await db.savingsEntries.add({ id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() })
}

export async function updateSavingsEntry(id: string, input: SavingsInput): Promise<void> {
  await db.savingsEntries.update(id, input)
}

export async function removeSavingsEntry(id: string): Promise<void> {
  const entry = await db.savingsEntries.get(id)
  if (!entry) return
  await moveToTrash('savingsEntries', id, entry.note || (entry.amount >= 0 ? 'Depósito' : 'Retirada'), entry)
  await db.savingsEntries.delete(id)
}

export interface SavingsSummary {
  balance: number
  deposited: number
  withdrawn: number
}

export function summarize(entries: SavingsEntry[]): SavingsSummary {
  let deposited = 0
  let withdrawn = 0
  for (const entry of entries) {
    if (entry.amount >= 0) deposited += entry.amount
    else withdrawn += -entry.amount
  }
  return { balance: deposited - withdrawn, deposited, withdrawn }
}

/** Quanto sobrou (guardou − retirou) em cada um dos últimos `count` meses, do mais antigo ao mais novo. */
export function monthlyNet(entries: SavingsEntry[], count = 6): { month: string; total: number }[] {
  const totals = new Map<string, number>()
  for (const entry of entries) {
    const month = entry.date.slice(0, 7)
    totals.set(month, (totals.get(month) ?? 0) + entry.amount)
  }
  const result: { month: string; total: number }[] = []
  const cursor = new Date()
  cursor.setDate(1)
  cursor.setMonth(cursor.getMonth() - (count - 1))
  for (let i = 0; i < count; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    result.push({ month: key, total: totals.get(key) ?? 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return result
}
