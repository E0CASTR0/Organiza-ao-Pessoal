import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addNote, updateNote, removeNote } from '@/db/repositories/notes.repo'
import { restoreLatestFromTrash } from '@/db/repositories/trash.repo'
import { useToast } from '@/components/ui/ToastContext'
import type { Note } from '@/db/models'

interface NoteFormModalProps {
  open: boolean
  onClose: () => void
  editing: Note | null
  /** Chamado com o id quando uma nota NOVA é salva (pra abrir ela em seguida). */
  onCreated?: (id: string) => void
}

export function NoteFormModal({ open, onClose, editing, onCreated }: NoteFormModalProps) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setContent(editing?.content ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return
    const finalTitle = title.trim() || content.trim().slice(0, 40) || 'Sem título'
    if (editing) {
      await updateNote(editing.id, finalTitle, content)
    } else {
      const id = await addNote(finalTitle, content)
      onCreated?.(id)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) {
      const id = editing.id
      await removeNote(id)
      toast.show('Nota excluída', { actionLabel: 'Desfazer', onAction: () => restoreLatestFromTrash('notes', id) })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar nota' : 'Nova nota'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" autoFocus />
        <TextArea label="Anotação" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva aqui…" rows={10} />
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
