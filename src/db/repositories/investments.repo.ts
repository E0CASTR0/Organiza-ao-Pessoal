import { db } from '../db'
import type { Investment, InvestmentCategory, InvestmentSnapshot } from '../models'
import { moveToTrash } from './trash.repo'

// ---------- Categorias ----------

export function listCategories() {
  return db.investmentCategories.orderBy('order').toArray()
}

export async function addCategory(name: string): Promise<void> {
  const count = await db.investmentCategories.count()
  const category: InvestmentCategory = { id: crypto.randomUUID(), name, order: count }
  await db.investmentCategories.add(category)
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await db.investmentCategories.update(id, { name })
}

export async function removeCategory(id: string): Promise<void> {
  const category = await db.investmentCategories.get(id)
  if (!category) return
  const inUse = await db.investments.where('categoryId').equals(id).count()
  if (inUse > 0) {
    throw new Error('Existem investimentos nessa categoria. Mova ou remova eles primeiro.')
  }
  await moveToTrash('investmentCategories', id, category.name, category)
  await db.investmentCategories.delete(id)
}

// ---------- Investimentos ----------

export function listInvestments() {
  return db.investments.toArray()
}

export function listInvestmentsByCategory(categoryId: string) {
  return db.investments.where('categoryId').equals(categoryId).toArray()
}

export interface InvestmentInput {
  categoryId: string
  name: string
  ticker: string | null
  amountInvested: number
  monthlyReturnValue: number
  currentQuote: number | null
  notes: string
}

export async function addInvestment(input: InvestmentInput): Promise<void> {
  const now = new Date().toISOString()
  const investment: Investment = {
    id: crypto.randomUUID(),
    ...input,
    quoteUpdatedAt: input.currentQuote != null ? now : null,
    priceSource: 'manual',
    createdAt: now,
  }
  await db.investments.add(investment)
  await writeSnapshot(investment)
}

export async function updateInvestment(id: string, input: Partial<InvestmentInput>): Promise<void> {
  const patch: Partial<Investment> = { ...input }
  if (input.currentQuote !== undefined) {
    patch.quoteUpdatedAt = new Date().toISOString()
  }
  await db.investments.update(id, patch)
  const updated = await db.investments.get(id)
  if (updated) await writeSnapshot(updated)
}

export async function removeInvestment(id: string): Promise<void> {
  const investment = await db.investments.get(id)
  if (!investment) return
  await moveToTrash('investments', id, investment.name, investment)
  await db.investments.delete(id)
  await db.investmentSnapshots.where('investmentId').equals(id).delete()
}

// ---------- Histórico mensal (snapshots) ----------

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

/** Grava (ou atualiza) o snapshot do mês atual pra esse investimento — é como o
 * histórico de lucro fica confiável mesmo editando o valor várias vezes no mesmo mês. */
async function writeSnapshot(investment: Investment): Promise<void> {
  const month = currentMonth()
  const existing = await db.investmentSnapshots.where({ investmentId: investment.id, month }).first()
  if (existing) {
    await db.investmentSnapshots.update(existing.id, {
      amountInvested: investment.amountInvested,
      returnValue: investment.monthlyReturnValue,
      quote: investment.currentQuote,
    })
  } else {
    const snapshot: InvestmentSnapshot = {
      id: crypto.randomUUID(),
      investmentId: investment.id,
      month,
      amountInvested: investment.amountInvested,
      returnValue: investment.monthlyReturnValue,
      quote: investment.currentQuote,
      createdAt: new Date().toISOString(),
    }
    await db.investmentSnapshots.add(snapshot)
  }
}

export function listSnapshotsByInvestment(investmentId: string) {
  return db.investmentSnapshots.where('investmentId').equals(investmentId).sortBy('month')
}

export async function totalProfitAllTime(): Promise<number> {
  const all = await db.investmentSnapshots.toArray()
  return all.reduce((sum, s) => sum + s.returnValue, 0)
}
