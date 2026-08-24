import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextArea } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addDiet, updateDiet, removeDiet } from '@/db/repositories/diets.repo'
import type { Diet } from '@/db/models'

interface DietFormModalProps {
  open: boolean
  onClose: () => void
  editing: Diet | null
}

export function DietFormModal({ open, onClose, editing }: DietFormModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setContent(editing?.content ?? '')
  }, [open, editing])

  const handleSave = async () => {
    if (!title.trim()) return
    if (editing) {
      await updateDiet(editing.id, title.trim(), content)
    } else {
      await addDiet(title.trim(), content)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeDiet(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar dieta' : 'Nova dieta'}>
      <div className="flex flex-col gap-3.5">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cutting, Bulk, Low carb..." autoFocus />
        <TextArea label="Descrição" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Refeições, observações..." rows={6} />
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
