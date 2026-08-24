import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { addCategory } from '@/db/repositories/investments.repo'

export function CategoryFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return
    await addCategory(name.trim())
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova categoria">
      <div className="flex flex-col gap-4">
        <TextField label="Nome da categoria" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Fundos Imobiliários" autoFocus />
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSave()}>Adicionar</Button>
        </div>
      </div>
    </Modal>
  )
}
