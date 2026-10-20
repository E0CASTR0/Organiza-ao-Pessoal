import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { addGoal } from '@/db/repositories/dailyGoals.repo'
import { addEvent } from '@/db/repositories/events.repo'
import { addNote } from '@/db/repositories/notes.repo'
import { addShoppingItem } from '@/db/repositories/shoppingItems.repo'
import { addWorkTask } from '@/db/repositories/workTasks.repo'
import { addPriority } from '@/db/repositories/monthlyPriorities.repo'
import { currentMonthKey, todayKey } from '@/utils/date'
import { parseCurrencyInput } from '@/utils/currency'

type Kind = 'meta' | 'evento' | 'nota' | 'compra' | 'tarefa' | 'prioridade'

const KINDS: { value: Kind; label: string; field: string; placeholder: string; done: string }[] = [
  { value: 'meta', label: 'Meta do dia', field: 'Meta', placeholder: 'Ex: Beber água, estudar…', done: 'Meta adicionada' },
  { value: 'evento', label: 'Evento', field: 'Título', placeholder: 'Ex: Reunião, consulta…', done: 'Evento adicionado na agenda' },
  { value: 'nota', label: 'Nota', field: 'Título', placeholder: 'Título (opcional)', done: 'Nota salva' },
  { value: 'compra', label: 'Compra', field: 'Produto', placeholder: 'Ex: Tênis, relógio…', done: 'Item adicionado na lista de compras' },
  { value: 'tarefa', label: 'Tarefa de trabalho', field: 'Tarefa', placeholder: 'Ex: Enviar proposta…', done: 'Tarefa adicionada' },
  { value: 'prioridade', label: 'Prioridade do mês', field: 'Prioridade', placeholder: 'Ex: Fechar o curso…', done: 'Prioridade adicionada' },
]

/** Folha de "adicionar rápido": uma porta só pra criar qualquer coisa do app sem ir até a tela
 * de cada uma. Os campos mudam conforme o tipo escolhido. */
export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [kind, setKind] = useState<Kind>('meta')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayKey())
  const [time, setTime] = useState('')
  const [content, setContent] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const config = KINDS.find((k) => k.value === kind) ?? KINDS[0]

  const reset = () => {
    setTitle('')
    setTime('')
    setContent('')
    setPrice('')
    setDate(todayKey())
    setError('')
  }

  const close = () => {
    onClose()
    reset()
  }

  const handleSave = async () => {
    const value = title.trim()
    // nota pode ter só o texto; os outros tipos precisam do título
    if (!value && !(kind === 'nota' && content.trim())) {
      setError(`Digite ${kind === 'meta' ? 'a meta' : 'um nome'} pra salvar.`)
      return
    }
    setSaving(true)
    try {
      if (kind === 'meta') await addGoal(value)
      else if (kind === 'evento') await addEvent({ title: value, date, time: time || null, notes: '' })
      else if (kind === 'nota') await addNote(value, content)
      else if (kind === 'compra') await addShoppingItem({ name: value, price: parseCurrencyInput(price), imageBase64: null })
      else if (kind === 'tarefa') await addWorkTask({ title: value, notes: '', dueDate: null })
      else await addPriority(currentMonthKey(), value)
      toast.show(config.done)
      close()
    } catch {
      setError('Não foi possível salvar. Tente de novo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Adicionar">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSave()
        }}
      >
        <div role="group" aria-label="O que adicionar" className="-mx-1 flex flex-wrap gap-2 px-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={kind === k.value}
              onClick={() => {
                setKind(k.value)
                setError('')
              }}
              className={`press rounded-full border px-3.5 py-2 text-sm font-medium ${
                kind === k.value
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <TextField
          label={config.field}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setError('')
          }}
          placeholder={config.placeholder}
          aria-invalid={error ? true : undefined}
        />

        {kind === 'evento' && (
          <div className="flex gap-3">
            <TextField label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
            <TextField label="Hora (opcional)" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1" />
          </div>
        )}
        {kind === 'nota' && <TextArea label="Anotação" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva aqui…" rows={5} />}
        {kind === 'compra' && <TextField label="Valor (opcional)" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 199,90" inputMode="decimal" />}

        {error && (
          <p role="alert" className="-mt-2 text-sm text-[var(--danger-strong)]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
