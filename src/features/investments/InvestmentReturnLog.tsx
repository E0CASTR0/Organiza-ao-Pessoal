import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { addInvestmentReturn, listReturnsByInvestmentAndMonth, removeInvestmentReturn } from '@/db/repositories/investments.repo'
import { currentMonthKey, formatMonthLabel } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'

/** Lançamentos de retorno do mês atual pra um investimento — em vez de um campo único que
 * se sobrescreve, cada "adicionar" soma. Reinicia sozinho todo dia 1 (o mês novo ainda não
 * tem lançamento nenhum). */
export function InvestmentReturnLog({ investmentId }: { investmentId: string }) {
  const [value, setValue] = useState('')
  const month = currentMonthKey()
  const entries = useLiveQuery(() => listReturnsByInvestmentAndMonth(investmentId, month), [investmentId, month]) ?? []
  const total = entries.reduce((sum, e) => sum + e.value, 0)

  const handleAdd = async () => {
    const num = Number(value.replace(',', '.'))
    if (!num) return
    await addInvestmentReturn(investmentId, num)
    setValue('')
  }

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Retornos de {formatMonthLabel(month)}</span>
        <span className="text-sm font-medium text-[var(--success)]">{formatCurrency(total)}</span>
      </div>

      {entries.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-[var(--text-primary)]">{formatCurrency(entry.value)}</span>
              <button type="button" onClick={() => void removeInvestmentReturn(entry.id)} aria-label="Remover lançamento" className="text-[var(--text-tertiary)] hover:text-[var(--danger)]">
                <TrashIcon width={13} height={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        className="mt-2.5 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          void handleAdd()
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Adicionar retorno (R$)"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated-1)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
        />
        <Button type="submit" size="sm" aria-label="Adicionar lançamento">
          <PlusIcon width={14} height={14} />
        </Button>
      </form>
    </div>
  )
}
