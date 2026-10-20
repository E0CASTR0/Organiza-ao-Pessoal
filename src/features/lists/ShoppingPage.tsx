import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { listShoppingItems, toggleBought } from '@/db/repositories/shoppingItems.repo'
import { formatCurrency } from '@/utils/currency'
import { ShoppingItemFormModal } from './ShoppingItemFormModal'
import type { ShoppingItem } from '@/db/models'

export function ShoppingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const items = useLiveQuery(() => listShoppingItems(), []) ?? []

  // O total é o que AINDA FALTA comprar: marcou "comprado", o valor sai da conta.
  const remaining = items.filter((item) => !item.bought).reduce((sum, item) => sum + (item.price ?? 0), 0)
  const spent = items.filter((item) => item.bought).reduce((sum, item) => sum + (item.price ?? 0), 0)
  const boughtCount = items.filter((item) => item.bought).length

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (item: ShoppingItem) => {
    setEditing(item)
    setModalOpen(true)
  }

  return (
    <div className="reveal flex flex-col gap-4">
      {items.length > 0 && (
        <Card className="flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm text-[var(--text-secondary)]">{remaining === 0 && boughtCount === items.length ? 'Tudo comprado' : 'Falta comprar'}</p>
            <AnimatedNumber value={remaining} format={formatCurrency} className="mt-0.5 block text-[1.9rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]" />
          </div>
          <div className="shrink-0 text-right text-sm text-[var(--text-tertiary)]">
            <p>
              {boughtCount} de {items.length} {items.length === 1 ? 'item comprado' : 'itens comprados'}
            </p>
            {spent > 0 && <p>{formatCurrency(spent)} já comprado</p>}
          </div>
        </Card>
      )}

      <Button onClick={openNew} className="self-end">
        <PlusIcon width={16} height={16} />
        Adicionar item
      </Button>

      {items.length === 0 ? (
        <EmptyState title="Sua lista está vazia" description="Adicione produtos com foto, nome e valor." />
      ) : (
        <div className="reveal grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <button type="button" onClick={() => openEdit(item)} className="press block w-full text-left">
                <div className="aspect-square w-full bg-[var(--bg-elevated-2)]">
                  {item.imageBase64 ? (
                    <img src={item.imageBase64} alt={item.name} width={320} height={320} loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
                <Checkbox strike={false} checked={item.bought} onChange={() => void toggleBought(item.id)} label={item.bought ? 'Comprado' : 'Não comprado'} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShoppingItemFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
