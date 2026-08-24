import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addExercise, updateExercise, removeExercise } from '@/db/repositories/workout.repo'
import type { Exercise } from '@/db/models'

interface ExerciseFormModalProps {
  open: boolean
  onClose: () => void
  workoutDayId: string
  editing: Exercise | null
}

export function ExerciseFormModal({ open, onClose, workoutDayId, editing }: ExerciseFormModalProps) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setSets(editing ? String(editing.sets) : '3')
    setReps(editing?.reps ?? '')
    setWeight(editing?.weight ?? '')
    setNotes(editing?.notes ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!name.trim()) return
    const input = { name: name.trim(), sets: Number(sets) || 0, reps: reps.trim(), weight: weight.trim() || null, notes }
    if (editing) {
      await updateExercise(editing.id, input)
    } else {
      await addExercise(workoutDayId, input)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeExercise(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar exercício' : 'Novo exercício'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Exercício" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Supino reto" autoFocus />
        <div className="flex gap-3">
          <TextField label="Séries" type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} className="flex-1" />
          <TextField label="Repetições" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Ex: 8-12" className="flex-1" />
        </div>
        <TextField label="Carga (opcional)" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ex: 20kg" />
        <TextArea label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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
