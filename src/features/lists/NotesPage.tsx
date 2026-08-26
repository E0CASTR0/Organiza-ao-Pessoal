import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { listNotes } from '@/db/repositories/notes.repo'
import { formatDateShort, toDateKey } from '@/utils/date'
import { NoteFormModal } from './NoteFormModal'
import type { Note } from '@/db/models'

export function NotesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const notes = useLiveQuery(() => listNotes(), []) ?? []

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={openNew} className="self-end">
        <PlusIcon width={16} height={16} />
        Nova nota
      </Button>

      {notes.length === 0 ? (
        <EmptyState title="Nenhuma anotação ainda" description="Um bloco de notas livre pra lembretes e ideias soltas." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <Card key={note.id} className="cursor-pointer p-3.5" onClick={() => openEdit(note)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{note.title}</p>
                  {note.content && <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-sm text-[var(--text-tertiary)]">{note.content}</p>}
                </div>
                <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{formatDateShort(toDateKey(new Date(note.updatedAt)))}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NoteFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
