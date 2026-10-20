import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { listWorkoutDays, renameWorkoutDay, listExercisesByDay, removeExercise } from '@/db/repositories/workout.repo'
import { WEEKDAY_SHORT, toWeekdayIndex } from '@/utils/date'
import { removeAnimated } from '@/utils/motion'
import { ExerciseFormModal } from './ExerciseFormModal'
import type { Exercise } from '@/db/models'

export function WorkoutPage() {
  const [selectedWeekday, setSelectedWeekday] = useState(() => toWeekdayIndex(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')

  const days = useLiveQuery(() => listWorkoutDays(), []) ?? []
  const currentDay = days.find((d) => d.weekday === selectedWeekday)
  const exercises = useLiveQuery(() => (currentDay ? listExercisesByDay(currentDay.id) : []), [currentDay?.id]) ?? []

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (exercise: Exercise) => {
    setEditing(exercise)
    setModalOpen(true)
  }

  const startRenaming = () => {
    setLabelDraft(currentDay?.label ?? '')
    setEditingLabel(true)
  }

  const saveLabel = async () => {
    if (currentDay && labelDraft.trim()) {
      await renameWorkoutDay(currentDay.id, labelDraft.trim())
    }
    setEditingLabel(false)
  }

  return (
    <div className="reveal flex flex-col gap-4">
      <div data-hscroll className="flex gap-1.5 overflow-x-auto pb-1">
        {WEEKDAY_SHORT.map((label, weekday) => (
          <button
            key={weekday}
            onClick={() => setSelectedWeekday(weekday)}
            className={`press shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              selectedWeekday === weekday
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                : 'border-[var(--border-default)] text-[var(--text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {currentDay && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            {editingLabel ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void saveLabel()
                }}
              >
                <TextField value={labelDraft} onChange={(e) => setLabelDraft(e.target.value)} autoFocus className="flex-1" />
                <Button type="submit" size="sm">
                  Ok
                </Button>
              </form>
            ) : (
              <button onClick={startRenaming} className="press text-left">
                <p className="font-heading text-lg text-[var(--text-primary)]">{currentDay.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Toque para renomear</p>
              </button>
            )}
          </div>
        </Card>
      )}

      {exercises.length === 0 ? (
        <EmptyState title="Nenhum exercício neste dia" description="Adicione os exercícios do treino." />
      ) : (
        <div key={selectedWeekday} className="reveal flex flex-col gap-2.5">
          {exercises.map((exercise) => (
            <Card key={exercise.id} data-row className="p-3.5" onClick={() => openEdit(exercise)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">{exercise.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {exercise.sets}x{exercise.reps}
                    {exercise.weight ? ` · ${exercise.weight}` : ''}
                  </p>
                  {exercise.notes && <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{exercise.notes}</p>}
                </div>
                <IconButton
                  label="Remover exercício"
                  tone="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    void removeAnimated(e.currentTarget, () => removeExercise(exercise.id))
                  }}
                >
                  <TrashIcon width={16} height={16} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={openNew} className="self-start">
        <PlusIcon width={16} height={16} />
        Adicionar exercício
      </Button>

      {currentDay && <ExerciseFormModal open={modalOpen} onClose={() => setModalOpen(false)} workoutDayId={currentDay.id} editing={editing} />}
    </div>
  )
}
