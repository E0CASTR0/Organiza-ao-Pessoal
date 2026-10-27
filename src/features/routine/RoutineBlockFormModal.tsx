import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/components/ui/ToastContext'
import { addRoutineBlock, updateRoutineBlock, removeRoutineBlock, type RoutineBlockInput } from '@/db/repositories/routine.repo'
import { restoreLatestFromTrash } from '@/db/repositories/trash.repo'
import { ROUTINE_CATEGORIES, type RoutineBlock, type RoutineCategory } from '@/db/models'
import { WEEKDAY_SHORT } from '@/utils/date'
import { CATEGORY_COLOR } from './routineStats'

interface RoutineBlockFormModalProps {
  open: boolean
  onClose: () => void
  defaultWeekday: RoutineBlock['weekday']
  editing: RoutineBlock | null
}

const chip = (active: boolean) =>
  `press shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
    active ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'
  }`

export function RoutineBlockFormModal({ open, onClose, defaultWeekday, editing }: RoutineBlockFormModalProps) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [weekday, setWeekday] = useState<RoutineBlock['weekday']>(defaultWeekday)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [skill, setSkill] = useState('')
  const [category, setCategory] = useState<RoutineCategory>('Estudo')
  const [detail, setDetail] = useState('')
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setWeekday(editing?.weekday ?? defaultWeekday)
    setStart(editing?.start ?? '')
    setEnd(editing?.end ?? '')
    setSkill(editing?.skill ?? '')
    setCategory(editing?.category ?? 'Estudo')
    setDetail(editing?.detail ?? '')
    setFocus(editing?.focus ?? false)
  }, [open, editing, defaultWeekday])

  const handleSave = async () => {
    if (!title.trim() || !start) return
    const input: RoutineBlockInput = { weekday, start, end, title: title.trim(), skill: skill.trim() || title.trim(), category, detail: detail.trim(), focus }
    if (editing) await updateRoutineBlock(editing.id, input)
    else await addRoutineBlock(input)
    onClose()
  }

  const handleDelete = async () => {
    if (!editing) return
    const id = editing.id
    await removeRoutineBlock(id)
    toast.show('Bloco removido', { actionLabel: 'Desfazer', onAction: () => restoreLatestFromTrash('routineBlocks', id) })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar bloco' : 'Novo bloco'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Atividade" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Programação" />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--text-secondary)]">Dia</span>
          <div data-hscroll className="flex gap-1.5 overflow-x-auto pb-1">
            {WEEKDAY_SHORT.map((label, index) => (
              <button key={label} type="button" onClick={() => setWeekday(index as RoutineBlock['weekday'])} className={chip(weekday === index)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <TextField label="Início" type="time" value={start} onChange={(e) => setStart(e.target.value)} className="flex-1" />
          <TextField label="Fim (opcional)" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="flex-1" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-[var(--text-secondary)]">Categoria</span>
          <div className="flex flex-wrap gap-1.5">
            {ROUTINE_CATEGORIES.map((name) => (
              <button key={name} type="button" onClick={() => setCategory(name)} className={`${chip(category === name)} inline-flex items-center gap-1.5`}>
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[name] }} />
                {name}
              </button>
            ))}
          </div>
        </div>

        <TextField label="Habilidade (agrupa o gráfico)" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Igual à atividade, se ficar vazio" />
        <TextArea label="Detalhe" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Ex: Diário ou texto curto" rows={2} />

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[var(--text-primary)]">Habilidade em foco do dia</p>
            <p className="text-xs text-[var(--text-tertiary)]">Aparece no resumo do dia</p>
          </div>
          <Toggle checked={focus} onChange={() => setFocus((value) => !value)} aria-label="Habilidade em foco do dia" />
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
