import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { addSavingsEntry, updateSavingsEntry, removeSavingsEntry } from '@/db/repositories/savings.repo'
import { restoreLatestFromTrash } from '@/db/repositories/trash.repo'
import { parseCurrencyInput, formatCurrency } from '@/utils/currency'
import { todayKey } from '@/utils/date'
import type { SavingsEntry } from '@/db/models'

export type SavingsKind = 'deposit' | 'withdraw'

interface SavingsEntryFormModalProps {
  open: boolean
  onClose: () => void
  /** Tipo do lançamento novo (quando `editing` é null). */
  kind: SavingsKind
  editing: SavingsEntry | null
  /** Saldo atual — uma retirada nova não pode passar dele. */
  balance: number
}

/** Folha pra guardar ou retirar dinheiro da Caixinha (ou editar/excluir um lançamento). */
export function SavingsEntryFormModal({ open, onClose, kind, editing, balance }: SavingsEntryFormModalProps) {
  const toast = useToast()
  const [type, setType] = useState<SavingsKind>(kind)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayKey())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (editing) {
      setType(editing.amount >= 0 ? 'deposit' : 'withdraw')
      setAmount(Math.abs(editing.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, useGrouping: false }))
      setDate(editing.date)
      setNote(editing.note)
    } else {
      setType(kind)
      setAmount('')
      setDate(todayKey())
      setNote('')
    }
  }, [open, editing, kind])

  const handleSave = async () => {
    const value = parseCurrencyInput(amount)
    if (value === null || value <= 0) {
      setError('Digite um valor maior que zero.')
      return
    }
    if (!editing && type === 'withdraw' && value > balance) {
      setError(`Você só tem ${formatCurrency(balance)} guardado.`)
      return
    }
    const signed = type === 'deposit' ? value : -value
    if (editing) await updateSavingsEntry(editing.id, { date, amount: signed, note: note.trim() })
    else await addSavingsEntry({ date, amount: signed, note: note.trim() })
    toast.show(type === 'deposit' ? `${formatCurrency(value)} guardados` : `${formatCurrency(value)} retirados`)
    onClose()
  }

  const handleDelete = async () => {
    if (!editing) return
    const id = editing.id
    await removeSavingsEntry(id)
    toast.show('Lançamento excluído', { actionLabel: 'Desfazer', onAction: () => restoreLatestFromTrash('savingsEntries', id) })
    onClose()
  }

  const title = editing ? 'Editar lançamento' : type === 'deposit' ? 'Guardar dinheiro' : 'Retirar dinheiro'

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSave()
        }}
      >
        {editing && (
          <div role="radiogroup" aria-label="Tipo do lançamento" className="flex gap-2">
            {(['deposit', 'withdraw'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={type === option}
                onClick={() => setType(option)}
                className={`press flex-1 rounded-full border py-2 text-sm font-medium ${
                  type === option ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                }`}
              >
                {option === 'deposit' ? 'Guardei' : 'Retirei'}
              </button>
            ))}
          </div>
        )}
        <TextField
          label="Valor (R$)"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError('')
          }}
          placeholder="Ex: 250,00"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          autoFocus
        />
        <div className="flex gap-3">
          <TextField label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
        </div>
        <TextField label="Observação (opcional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: Salário, viagem, 13º…" />
        {error && (
          <p role="alert" className="-mt-1 text-sm text-[var(--danger-strong)]">
            {error}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-2.5">
          {editing ? (
            <Button type="button" variant="ghost" onClick={() => void handleDelete()}>
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{type === 'deposit' ? 'Guardar' : 'Retirar'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
