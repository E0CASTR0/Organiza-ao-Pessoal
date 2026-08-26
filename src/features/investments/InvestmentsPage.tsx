import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon, TrashIcon, WalletIcon } from '@/components/ui/icons'
import { listCategories, listInvestments, listReturnsByMonth, totalReturnAllTime, removeCategory } from '@/db/repositories/investments.repo'
import { currentMonthKey } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { InvestmentFormModal } from './InvestmentFormModal'
import { CategoryFormModal } from './CategoryFormModal'
import type { Investment } from '@/db/models'

export function InvestmentsPage() {
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null)

  const month = currentMonthKey()
  const categories = useLiveQuery(() => listCategories(), []) ?? []
  const investments = useLiveQuery(() => listInvestments(), []) ?? []
  const monthReturns = useLiveQuery(() => listReturnsByMonth(month), [month]) ?? []
  const allTimeReturn = useLiveQuery(() => totalReturnAllTime(), [monthReturns]) ?? 0

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amountInvested, 0)
  const totalReturnThisMonth = monthReturns.reduce((sum, r) => sum + r.value, 0)
  const returnThisMonthFor = (investmentId: string) => monthReturns.filter((r) => r.investmentId === investmentId).reduce((sum, r) => sum + r.value, 0)

  const openNew = (categoryId: string) => {
    setEditing(null)
    setDefaultCategoryId(categoryId)
    setInvestmentModalOpen(true)
  }

  const openEdit = (investment: Investment) => {
    setEditing(investment)
    setDefaultCategoryId(investment.categoryId)
    setInvestmentModalOpen(true)
  }

  const handleRemoveCategory = async (id: string) => {
    try {
      await removeCategory(id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível remover a categoria.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader
        title="Investimentos"
        icon={<WalletIcon width={20} height={20} />}
        action={
          <Button size="sm" onClick={() => setCategoryModalOpen(true)}>
            <PlusIcon width={16} height={16} />
            Categoria
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Total investido</p>
          <p className="mt-1 font-[var(--font-heading)] text-xl text-[var(--text-primary)]">{formatCurrency(totalInvested)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Retorno do mês</p>
          <p className="mt-1 font-[var(--font-heading)] text-xl text-[var(--text-primary)]">{formatCurrency(totalReturnThisMonth)}</p>
        </Card>
        <Card className="col-span-2 p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Retorno total (todos os meses)</p>
          <p className="mt-1 font-[var(--font-heading)] text-xl text-[var(--success)]">{formatCurrency(allTimeReturn)}</p>
        </Card>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria ainda" description="Crie categorias como CDI, Liquidez Diária ou Bolsa de Valores." />
      ) : (
        categories.map((category) => {
          const items = investments.filter((inv) => inv.categoryId === category.id)
          return (
            <section key={category.id}>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{category.name}</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => openNew(category.id)} className="text-[var(--accent)] hover:text-[var(--accent-strong)]" aria-label="Adicionar investimento">
                    <PlusIcon width={16} height={16} />
                  </button>
                  {items.length === 0 && (
                    <button onClick={() => void handleRemoveCategory(category.id)} className="text-[var(--text-tertiary)] hover:text-[var(--danger)]" aria-label="Remover categoria">
                      <TrashIcon width={14} height={14} />
                    </button>
                  )}
                </div>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">Nenhum investimento nessa categoria.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {items.map((investment) => {
                    const returnThisMonth = returnThisMonthFor(investment.id)
                    return (
                      <Card key={investment.id} className="cursor-pointer p-3.5" onClick={() => openEdit(investment)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--text-primary)]">
                              {investment.name}
                              {investment.ticker && <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">{investment.ticker}</span>}
                            </p>
                            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">Investido: {formatCurrency(investment.amountInvested)}</p>
                            {investment.currentQuote != null && <p className="text-xs text-[var(--text-tertiary)]">Cotação: {formatCurrency(investment.currentQuote)}</p>}
                          </div>
                          {returnThisMonth !== 0 && (
                            <p className={`shrink-0 text-sm font-medium ${returnThisMonth >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                              {returnThisMonth >= 0 ? '+' : ''}
                              {formatCurrency(returnThisMonth)}
                            </p>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })
      )}

      <InvestmentFormModal
        open={investmentModalOpen}
        onClose={() => setInvestmentModalOpen(false)}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        editing={editing}
      />
      <CategoryFormModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
    </div>
  )
}
