import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { TextField } from '@/components/ui/TextField'
import { NoteIcon, PlusIcon, SearchIcon } from '@/components/ui/icons'
import { listNotes } from '@/db/repositories/notes.repo'
import { toDateKey, addDays } from '@/utils/date'
import { NoteFormModal } from './NoteFormModal'
import type { Note } from '@/db/models'

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** Primeira linha com texto do conteúdo, sem quebras — a "prévia" embaixo do título. */
function preview(note: Note): string {
  return note.content.replace(/\s+/g, ' ').trim()
}

function groupLabel(note: Note, today: Date): string {
  const key = toDateKey(new Date(note.updatedAt))
  if (key === toDateKey(today)) return 'Hoje'
  if (key === toDateKey(addDays(today, -1))) return 'Ontem'
  if (key >= toDateKey(addDays(today, -7))) return 'Últimos 7 dias'
  if (key >= toDateKey(addDays(today, -30))) return 'Últimos 30 dias'
  return 'Mais antigas'
}

/** Lista de notas no estilo do app Notas do iPhone: agrupada por data, com busca. Tocar numa
 * nota ABRE pra leitura (não pra edição) — `base` é o começo do caminho (/listas/notas ou
 * /mais/notas), pra a tela de leitura voltar pro lugar certo. */
export function NotesList({ base }: { base: string }) {
  const navigate = useNavigate()
  const notes = useLiveQuery(() => listNotes(), [])
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const groups = useMemo(() => {
    if (!notes) return []
    const term = query.trim().toLowerCase()
    const filtered = term ? notes.filter((n) => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)) : notes
    const today = new Date()
    const map = new Map<string, Note[]>()
    for (const note of filtered) {
      const label = groupLabel(note, today)
      map.set(label, [...(map.get(label) ?? []), note])
    }
    return Array.from(map.entries())
  }, [notes, query])

  const total = notes?.length ?? 0

  return (
    <div className="reveal flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <TextField
            aria-label="Buscar nas notas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nas notas…"
            type="search"
            enterKeyHint="search"
          />
        </div>
        <Button onClick={() => setCreating(true)} aria-label="Nova nota">
          <PlusIcon width={18} height={18} />
        </Button>
      </div>

      {notes && total === 0 && (
        <EmptyState
          icon={<NoteIcon width={22} height={22} />}
          title="Nenhuma anotação ainda"
          description="Guarde lembretes, ideias e listas soltas."
          actionLabel="Escrever a primeira"
          onAction={() => setCreating(true)}
        />
      )}
      {notes && total > 0 && groups.length === 0 && <EmptyState icon={<SearchIcon width={22} height={22} />} title="Nada encontrado" description="Tente outra palavra." />}

      {groups.map(([label, items]) => (
        <section key={label}>
          <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{label}</h2>
          <div className="flex flex-col gap-2">
            {items.map((note) => {
              const updated = new Date(note.updatedAt)
              const isToday = toDateKey(updated) === toDateKey(new Date())
              return (
                <Link
                  key={note.id}
                  to={`${base}/${note.id}`}
                  className="surface surface-interactive press flex flex-col gap-0.5 rounded-[var(--radius-md)] px-4 py-3"
                >
                  <span className="truncate font-semibold text-[var(--text-primary)]">{note.title || 'Nota sem título'}</span>
                  <span className="flex gap-2 text-sm text-[var(--text-tertiary)]">
                    <span className="shrink-0 text-[var(--text-secondary)]">{isToday ? timeFormatter.format(updated) : dayFormatter.format(updated)}</span>
                    <span className="truncate">{preview(note) || 'Sem texto adicional'}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {total > 0 && (
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          {total} {total === 1 ? 'nota' : 'notas'}
        </p>
      )}

      <NoteFormModal open={creating} onClose={() => setCreating(false)} editing={null} onCreated={(id) => navigate(`${base}/${id}`)} />
    </div>
  )
}

