import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { listWorkTasks, addWorkTask, toggleWorkTask, removeWorkTask } from '@/db/repositories/workTasks.repo'
import { formatDateShort } from '@/utils/date'

export function WorkPage() {
  const [title, setTitle] = useState('')
  const tasks = useLiveQuery(() => listWorkTasks(), []) ?? []

  const handleAdd = async () => {
    const value = title.trim()
    if (!value) return
    await addWorkTask({ title: value, notes: '', dueDate: null })
    setTitle('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void handleAdd()
          }}
        >
          <TextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nova tarefa de trabalho" className="flex-1" />
          <Button type="submit" aria-label="Adicionar tarefa">
            <PlusIcon width={18} height={18} />
          </Button>
        </form>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState title="Nenhuma tarefa de trabalho" description="Organize pendências e projetos por aqui." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <Card key={task.id} className="flex items-center justify-between gap-2 p-3.5">
              <Checkbox checked={task.completed} onChange={() => void toggleWorkTask(task.id)} label={task.title} />
              <div className="flex shrink-0 items-center gap-2.5">
                {task.dueDate && <span className="text-xs text-[var(--text-tertiary)]">{formatDateShort(task.dueDate)}</span>}
                <button onClick={() => void removeWorkTask(task.id)} aria-label="Remover" className="text-[var(--text-tertiary)] hover:text-[var(--danger)]">
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
