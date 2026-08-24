import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { ImagePicker } from '@/components/ui/ImagePicker'
import { addShoppingItem, updateShoppingItem, removeShoppingItem } from '@/db/repositories/shoppingItems.repo'
import type { ShoppingItem } from '@/db/models'

interface ShoppingItemFormModalProps {
  open: boolean
  onClose: () => void
  editing: ShoppingItem | null
}

export function ShoppingItemFormModal({ open, onClose, editing }: ShoppingItemFormModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(editing?.name ?? '')
    setPrice(editing?.price != null ? String(editing.price) : '')
    setImage(editing?.imageBase64 ?? null)
  }, [open, editing])

  const handleSave = async () => {
    if (!name.trim()) return
    const priceValue = price.trim() ? Number(price) : null
    if (editing) {
      await updateShoppingItem(editing.id, { name: name.trim(), price: priceValue, imageBase64: image })
    } else {
      await addShoppingItem({ name: name.trim(), price: priceValue, imageBase64: image })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (editing) await removeShoppingItem(editing.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar item' : 'Novo item'}>
      <div className="flex flex-col gap-4">
        <ImagePicker value={image} onChange={setImage} />
        <TextField label="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Tênis, relógio..." autoFocus />
        <TextField label="Valor (opcional)" type="number" inputMode="decimal" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
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
