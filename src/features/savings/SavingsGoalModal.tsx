import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { setSavingsGoal } from '@/db/repositories/settings.repo'
import { parseCurrencyInput } from '@/utils/currency'

interface SavingsGoalModalProps {
  open: boolean
  onClose: () => void
  current: number | null
}

/** Define (ou tira) a meta de quanto guardar na Caixinha. */
export function SavingsGoalModal({ open, onClose, current }: SavingsGoalModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setValue(current ? current.toLocaleString('pt-BR', { minimumFractionDigits: 2, useGrouping: false }) : '')
  }, [open, current])

  const handleSave = async () => {
    const parsed = parseCurrencyInput(value)
    if (parsed === null || parsed <= 0) {
      setError('Digite um valor maior que zero.')
      return
    }
    await setSavingsGoal(parsed)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Meta da Caixinha">
      <form
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSave()
        }}
      >
        <TextField
          label="Quanto você quer juntar? (R$)"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder="Ex: 10000,00"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          autoFocus
        />
        {error && (
          <p role="alert" className="-mt-1 text-sm text-[var(--danger-strong)]">
            {error}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-2.5">
          {current ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void setSavingsGoal(null)
                onClose()
              }}
            >
              Tirar meta
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar meta</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
