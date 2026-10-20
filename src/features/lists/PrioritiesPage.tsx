import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { TextField } from '@/components/ui/TextField'
import { TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons'
import { listPrioritiesByMonth, addPriority, togglePriority, removePriority } from '@/db/repositories/monthlyPriorities.repo'
import { currentMonthKey, formatMonthLabel } from '@/utils/date'
import { useRemoveWithUndo } from '@/components/ui/useRemoveWithUndo'

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

export function PrioritiesPage() {
  const removeRow = useRemoveWithUndo()
  const [month, setMonth] = useState(currentMonthKey())
  const [newTitle, setNewTitle] = useState('')

  const priorities = useLiveQuery(() => listPrioritiesByMonth(month), [month]) ?? []

  const handleAdd = async () => {
    const title = newTitle.trim()
    if (!title) return
    await addPriority(month, title)
    setNewTitle('')
  }

  return (
    <div className="reveal flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <IconButton label="Mês anterior" onClick={() => setMonth((m) => shiftMonth(m, -1))}>
          <ChevronLeftIcon width={20} height={20} />
        </IconButton>
        <p className="text-sm font-medium text-[var(--text-primary)]">{formatMonthLabel(month)}</p>
        <IconButton label="Próximo mês" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
          <ChevronRightIcon width={20} height={20} />
        </IconButton>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          {priorities.length === 0 && <p className="empty-fade text-sm text-[var(--text-tertiary)]">Nenhuma prioridade para este mês.</p>}
          {priorities.length > 0 && (
            // key={month}: trocar de mês refaz a entrada das linhas (e não mexe no campo de baixo)
            <div key={month} className="reveal flex flex-col gap-0.5">
              {priorities.map((item) => (
                <div key={item.id} data-row className="flex min-h-11 items-center justify-between gap-2">
                  <Checkbox className="self-stretch" checked={item.completed} onChange={() => void togglePriority(item.id)} label={item.title} />
                  <IconButton label="Remover" tone="danger" onClick={(e) => void removeRow(e.currentTarget, { message: 'Prioridade removida', entityType: 'monthlyPriorities', entityId: item.id, remove: () => removePriority(item.id) })}>
                    <TrashIcon width={16} height={16} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <form
            className="mt-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void handleAdd()
            }}
          >
            <TextField value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nova prioridade do mês" className="flex-1" />
            <Button type="submit" aria-label="Adicionar prioridade">
              <PlusIcon width={18} height={18} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
