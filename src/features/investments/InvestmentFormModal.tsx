import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addInvestment, updateInvestment, removeInvestment } from '@/db/repositories/investments.repo'
import { InvestmentReturnLog } from './InvestmentReturnLog'
import type { Investment, InvestmentCategory } from '@/db/models'

interface InvestmentFormModalProps {
  open: boolean
  onClose: () => void
  categories: InvestmentCategory[]
  defaultCategoryId: string | null
  editing: Investment | null
}

export function InvestmentFormModal({ open, onClose, categories, defaultCategoryId, editing }: InvestmentFormModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [amountInvested, setAmountInvested] = useState('')
  const [currentQuote, setCurrentQuote] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setCategoryId(editing?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '')
    setName(editing?.name ?? '')
    setTicker(editing?.ticker ?? '')
    setAmountInvested(editing ? String(editing.amountInvested) : '')
    setCurrentQuote(editing?.currentQuote != null ? String(editing.currentQuote) : '')
    setNotes(editing?.notes ?? '')
  }, [open, editing, defaultCategoryId, categories])

  const handleSave = async () => {
    if (!name.trim() || !categoryId) return
    const input = {
      categoryId,
      name: name.trim(),
      ticker: ticker.trim() || null,
      amountInvested: Number(amountInvested) || 0,
      currentQuote: currentQuote.trim() ? Number(currentQuote) : null,
      notes,
    }
    if (editing) {
      await updateInvestment(editing.id, input)
    } else {
      await addInvestment(input)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeInvestment(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar investimento' : 'Novo investimento'}>
      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--text-secondary)]">Categoria</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated-1)] px-3.5 py-2.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Nome / empresa" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Tesouro Selic, PETR4..." autoFocus />
        <TextField label="Ticker (opcional)" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="Ex: PETR4" />
        <TextField label="Valor investido" type="number" inputMode="decimal" step="0.01" value={amountInvested} onChange={(e) => setAmountInvested(e.target.value)} />
        <TextField label="Cotação atual (opcional)" type="number" inputMode="decimal" step="0.01" value={currentQuote} onChange={(e) => setCurrentQuote(e.target.value)} />
        <TextArea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        {editing && <InvestmentReturnLog investmentId={editing.id} />}

        <div className="mt-1 flex items-center justify-between gap-2.5">
          {editing ? (
            <Button variant="ghost" onClick={() => void handleDelete()}>
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSave()}>Salvar</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
