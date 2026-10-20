import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { listWorkTasks, addWorkTask, toggleWorkTask, removeWorkTask } from '@/db/repositories/workTasks.repo'
import { formatDateShort } from '@/utils/date'
import { removeAnimated } from '@/utils/motion'

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
    <div className="reveal flex flex-col gap-4">
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
        // reveal: as tarefas entram em sequência ao abrir a aba e cada tarefa nova também aparece animada
        <div className="reveal flex flex-col gap-2.5">
          {tasks.map((task) => (
            <Card key={task.id} data-row className="flex items-center justify-between gap-2 p-3.5">
              <Checkbox className="self-stretch" checked={task.completed} onChange={() => void toggleWorkTask(task.id)} label={task.title} />
              <div className="flex shrink-0 items-center gap-2.5">
                {task.dueDate && <span className="text-xs text-[var(--text-tertiary)]">{formatDateShort(task.dueDate)}</span>}
                <IconButton label="Remover" tone="danger" onClick={(e) => void removeAnimated(e.currentTarget, () => removeWorkTask(task.id))}>
                  <TrashIcon width={16} height={16} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
