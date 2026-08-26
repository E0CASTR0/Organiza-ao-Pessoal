import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { listShoppingItems, toggleBought } from '@/db/repositories/shoppingItems.repo'
import { formatCurrency } from '@/utils/currency'
import { ShoppingItemFormModal } from './ShoppingItemFormModal'
import type { ShoppingItem } from '@/db/models'

export function ShoppingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const items = useLiveQuery(() => listShoppingItems(), []) ?? []

  const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0)

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (item: ShoppingItem) => {
    setEditing(item)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <Card className="flex items-center justify-between p-4">
          <p className="text-sm text-[var(--text-secondary)]">Total da lista</p>
          <p className="font-[var(--font-heading)] text-xl text-[var(--text-primary)]">{formatCurrency(total)}</p>
        </Card>
      )}

      <Button onClick={openNew} className="self-end">
        <PlusIcon width={16} height={16} />
        Adicionar item
      </Button>

      {items.length === 0 ? (
        <EmptyState title="Sua lista está vazia" description="Adicione produtos com foto, nome e valor." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <button type="button" onClick={() => openEdit(item)} className="block w-full text-left">
                <div className="aspect-square w-full bg-[var(--bg-elevated-2)]">
                  {item.imageBase64 ? (
                    <img src={item.imageBase64} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--text-tertiary)]">Sem imagem</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-medium text-[var(--text-primary)]">{item.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{formatCurrency(item.price)}</p>
                </div>
              </button>
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-3 py-2.5">
                <Checkbox checked={item.bought} onChange={() => void toggleBought(item.id)} label={item.bought ? 'Comprado' : 'Não comprado'} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShoppingItemFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
