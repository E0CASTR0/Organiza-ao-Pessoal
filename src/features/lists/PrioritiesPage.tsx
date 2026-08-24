import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons'
import { listPrioritiesByMonth, addPriority, togglePriority, removePriority } from '@/db/repositories/monthlyPriorities.repo'
import { currentMonthKey, formatMonthLabel } from '@/utils/date'

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

export function PrioritiesPage() {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Mês anterior">
          <ChevronLeftIcon width={20} height={20} />
        </button>
        <p className="text-sm font-medium capitalize text-[var(--text-primary)]">{formatMonthLabel(month)}</p>
        <button onClick={() => setMonth((m) => shiftMonth(m, 1))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Próximo mês">
          <ChevronRightIcon width={20} height={20} />
        </button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          {priorities.length === 0 && <p className="text-sm text-[var(--text-tertiary)]">Nenhuma prioridade para este mês.</p>}
          {priorities.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <Checkbox checked={item.completed} onChange={() => void togglePriority(item.id)} label={item.title} />
              <button onClick={() => void removePriority(item.id)} aria-label="Remover" className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--danger)]">
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          ))}
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
