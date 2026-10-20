import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { listItemsByDietAndMeal, addMealItem, removeMealItem } from '@/db/repositories/dietMealItems.repo'
import { MEAL_SLOT_LABELS } from '@/utils/mealSlots'
import { removeAnimated } from '@/utils/motion'
import type { MealSlotKey } from '@/db/models'

export function MealSlotRow({ dietId, meal }: { dietId: string; meal: MealSlotKey }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')

  const items = useLiveQuery(() => listItemsByDietAndMeal(dietId, meal), [dietId, meal]) ?? []
  const totalCalories = items.reduce((sum, item) => sum + (item.calories ?? 0), 0)

  const handleAdd = async () => {
    const value = name.trim()
    if (!value) return
    await addMealItem({ dietId, meal, name: value, calories: calories.trim() ? Number(calories) : null })
    setName('')
    setCalories('')
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{MEAL_SLOT_LABELS[meal]}</p>
        {totalCalories > 0 && <p className="text-xs text-[var(--text-tertiary)]">{totalCalories} kcal</p>}
      </div>

      {items.length > 0 && (
        <div className="mt-1 flex flex-col">
          {/* linhas de 36 px: a lixeira ampliada (IconButton) cabe na linha sem invadir a vizinha */}
          {items.map((item) => (
            <div key={item.id} data-row className="item-in flex min-h-9 items-center justify-between gap-2">
              <span className="truncate text-sm text-[var(--text-primary)]">{item.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                {item.calories != null && <span className="text-xs text-[var(--text-tertiary)]">{item.calories} kcal</span>}
                <IconButton label="Remover" tone="danger" onClick={(e) => void removeAnimated(e.currentTarget, () => removeMealItem(item.id))}>
                  <TrashIcon width={13} height={13} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        className="mt-2 flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          void handleAdd()
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prato / alimento"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated-1)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
        />
        <input
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          type="number"
          inputMode="numeric"
          placeholder="kcal"
          className="w-16 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated-1)] px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
        />
        <Button type="submit" size="sm" aria-label="Adicionar prato">
          <PlusIcon width={14} height={14} />
        </Button>
      </form>
    </div>
  )
}
