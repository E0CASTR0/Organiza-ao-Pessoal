import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { addFixedBill, updateFixedBill, removeFixedBill, toggleFixedBillActive } from '@/db/repositories/fixedBills.repo'
import type { FixedBill } from '@/db/models'

interface FixedBillFormModalProps {
  open: boolean
  onClose: () => void
  editing: FixedBill | null
}

export function FixedBillFormModal({ open, onClose, editing }: FixedBillFormModalProps) {
  const [name, setName] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setDueDay(editing ? String(editing.dueDay) : '1')
    setValue(editing ? String(editing.value) : '')
    setNotes(editing?.notes ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!name.trim()) return
    const input = { name: name.trim(), dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1)), value: Number(value) || 0, notes }
    if (editing) {
      await updateFixedBill(editing.id, input)
    } else {
      await addFixedBill(input)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeFixedBill(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar conta' : 'Nova conta fixa'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aluguel, academia, streaming..." autoFocus />
        <div className="flex gap-3">
          <TextField label="Dia do vencimento" type="number" inputMode="numeric" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="flex-1" />
          <TextField label="Valor" type="number" inputMode="decimal" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1" />
        </div>
        <TextArea label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        {editing && (
          <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-3.5 py-2.5">
            <span className="text-sm text-[var(--text-secondary)]">Conta ativa</span>
            <Toggle checked={editing.active} onChange={() => void toggleFixedBillActive(editing.id)} />
          </div>
        )}
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
