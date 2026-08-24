import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addEvent, updateEvent, removeEvent, type EventInput } from '@/db/repositories/events.repo'
import type { EventItem } from '@/db/models'

interface EventFormModalProps {
  open: boolean
  onClose: () => void
  defaultDate: string
  editing: EventItem | null
}

export function EventFormModal({ open, onClose, defaultDate, editing }: EventFormModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setDate(editing?.date ?? defaultDate)
    setTime(editing?.time ?? '')
    setNotes(editing?.notes ?? '')
  }, [open, editing, defaultDate])

  const handleSave = async () => {
    if (!title.trim()) return
    const input: EventInput = { title: title.trim(), date, time: time || null, notes }
    if (editing) {
      await updateEvent(editing.id, input)
    } else {
      await addEvent(input)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeEvent(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar evento' : 'Novo evento'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião, consulta..." autoFocus />
        <div className="flex gap-3">
          <TextField label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
          <TextField label="Hora (opcional)" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
        </div>
        <TextArea label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalhes do evento..." rows={3} />
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
