import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addDiet, updateDiet, removeDiet } from '@/db/repositories/diets.repo'
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABELS, DEFAULT_ENABLED_MEALS } from '@/utils/mealSlots'
import type { Diet, MealSlotKey } from '@/db/models'

interface DietFormModalProps {
  open: boolean
  onClose: () => void
  editing: Diet | null
}

export function DietFormModal({ open, onClose, editing }: DietFormModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [enabledMeals, setEnabledMeals] = useState<MealSlotKey[]>(DEFAULT_ENABLED_MEALS)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setContent(editing?.content ?? '')
    setEnabledMeals(editing?.enabledMeals ?? DEFAULT_ENABLED_MEALS)
  }, [open, editing])

  const toggleMeal = (meal: MealSlotKey) => {
    setEnabledMeals((prev) => (prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]))
  }

  const handleSave = async () => {
    if (!title.trim()) return
    if (editing) {
      await updateDiet(editing.id, title.trim(), content, enabledMeals)
    } else {
      await addDiet(title.trim(), content, enabledMeals)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeDiet(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar dieta' : 'Nova dieta'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cutting, Bulk, Low carb..." autoFocus />
        <TextArea label="Descrição" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Observações gerais sobre a dieta..." rows={4} />

        <div>
          <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Refeições (aparecem na tela inicial)</span>
          <div className="flex flex-wrap gap-1.5">
            {MEAL_SLOT_ORDER.map((meal) => {
              const active = enabledMeals.includes(meal)
              return (
                <button
                  key={meal}
                  type="button"
                  onClick={() => toggleMeal(meal)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                  }`}
                >
                  {MEAL_SLOT_LABELS[meal]}
                </button>
              )
            })}
          </div>
        </div>

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
