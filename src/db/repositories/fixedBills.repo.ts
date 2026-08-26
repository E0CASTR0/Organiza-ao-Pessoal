import { db } from '../db'
import type { FixedBill, FixedBillPayment } from '../models'
import { moveToTrash } from './trash.repo'

export function listFixedBills() {
  return db.fixedBills.orderBy('dueDay').toArray()
}

export interface FixedBillInput {
  name: string
  dueDay: number
  value: number
  notes: string
  imageBase64: string | null
}

export async function addFixedBill(input: FixedBillInput): Promise<void> {
  const count = await db.fixedBills.count()
  const bill: FixedBill = {
    id: crypto.randomUUID(),
    ...input,
    active: true,
    order: count,
    createdAt: new Date().toISOString(),
  }
  await db.fixedBills.add(bill)
}

export async function updateFixedBill(id: string, input: Partial<FixedBillInput>): Promise<void> {
  await db.fixedBills.update(id, input)
}

export async function toggleFixedBillActive(id: string): Promise<void> {
  const bill = await db.fixedBills.get(id)
  if (!bill) return
  await db.fixedBills.update(id, { active: !bill.active })
}

export async function removeFixedBill(id: string): Promise<void> {
  const bill = await db.fixedBills.get(id)
  if (!bill) return
  await moveToTrash('fixedBills', id, bill.name, bill)
  await db.fixedBills.delete(id)
  await db.fixedBillPayments.where('fixedBillId').equals(id).delete()
}

// ---------- Pagamentos ----------
// Cada conta tem seu próprio "ciclo" (vencimento até o próximo vencimento — ver
// utils/date.ts#currentBillCycleKey), não um mês de calendário compartilhado, então
// carregamos todos os pagamentos e cada tela decide qual "month" (chave de ciclo) checar
// pra cada conta individualmente.
export function listAllPayments() {
  return db.fixedBillPayments.toArray()
}

export async function togglePaid(fixedBillId: string, month: string): Promise<void> {
  const existing = await db.fixedBillPayments.where({ fixedBillId, month }).first()
  if (existing) {
    await db.fixedBillPayments.update(existing.id, {
      paidAt: existing.paidAt ? null : new Date().toISOString(),
    })
  } else {
    const payment: FixedBillPayment = {
      id: crypto.randomUUID(),
      fixedBillId,
      month,
      paidAt: new Date().toISOString(),
    }
    await db.fixedBillPayments.add(payment)
  }
}
