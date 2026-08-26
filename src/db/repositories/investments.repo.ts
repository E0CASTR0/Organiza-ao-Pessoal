import { db } from '../db'
import type { Investment, InvestmentCategory, InvestmentReturn } from '../models'
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
}

export async function updateInvestment(id: string, input: Partial<InvestmentInput>): Promise<void> {
  const patch: Partial<Investment> = { ...input }
  if (input.currentQuote !== undefined) {
    patch.quoteUpdatedAt = new Date().toISOString()
  }
  await db.investments.update(id, patch)
}

export async function removeInvestment(id: string): Promise<void> {
  const investment = await db.investments.get(id)
  if (!investment) return
  await moveToTrash('investments', id, investment.name, investment)
  await db.investments.delete(id)
  await db.investmentReturns.where('investmentId').equals(id).delete()
}

// ---------- Retornos (lançamentos que se acumulam, não sobrescrevem) ----------
// Cada "adicionar retorno" grava uma linha nova. O retorno "do mês" é a soma das linhas
// com month = mês atual — reinicia sozinho todo dia 1 (o mês novo simplesmente ainda não
// tem lançamentos), sem precisar apagar nada. O retorno "total" soma tudo, pra sempre.

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function listReturnsByInvestment(investmentId: string) {
  return db.investmentReturns.where('investmentId').equals(investmentId).reverse().sortBy('createdAt')
}

export function listReturnsByInvestmentAndMonth(investmentId: string, month: string) {
  return db.investmentReturns.where({ investmentId, month }).toArray()
}

/** Todos os lançamentos de um mês, de todos os investimentos — usado pra somar o total
 * do mês e o retorno por investimento numa passada só, em vez de uma consulta por linha. */
export function listReturnsByMonth(month: string) {
  return db.investmentReturns.where('month').equals(month).toArray()
}

export async function addInvestmentReturn(investmentId: string, value: number): Promise<void> {
  const entry: InvestmentReturn = {
    id: crypto.randomUUID(),
    investmentId,
    month: currentMonth(),
    value,
    createdAt: new Date().toISOString(),
  }
  await db.investmentReturns.add(entry)
}

export async function removeInvestmentReturn(id: string): Promise<void> {
  const entry = await db.investmentReturns.get(id)
  if (!entry) return
  await moveToTrash('investmentReturns', id, `Retorno de ${entry.month}`, entry)
  await db.investmentReturns.delete(id)
}

/** Soma de todos os retornos de todos os investimentos no mês atual — reinicia sozinho a
 * cada mês (é só a query filtrar por um "month" que ainda não tem lançamentos). */
export async function totalReturnThisMonth(): Promise<number> {
  const all = await db.investmentReturns.where('month').equals(currentMonth()).toArray()
  return all.reduce((sum, r) => sum + r.value, 0)
}

/** Soma de todos os retornos, de todos os meses, pra sempre — cresce sem nunca resetar. */
export async function totalReturnAllTime(): Promise<number> {
  const all = await db.investmentReturns.toArray()
  return all.reduce((sum, r) => sum + r.value, 0)
}
