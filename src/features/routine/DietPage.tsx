import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon, CheckIcon } from '@/components/ui/icons'
import { listDiets, setActiveDiet } from '@/db/repositories/diets.repo'
import { DietFormModal } from './DietFormModal'
import type { Diet } from '@/db/models'

export function DietPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Diet | null>(null)
  const diets = useLiveQuery(() => listDiets(), []) ?? []

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (diet: Diet) => {
    setEditing(diet)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={openNew} className="self-end">
        <PlusIcon width={16} height={16} />
        Nova dieta
      </Button>

      {diets.length === 0 ? (
        <EmptyState title="Nenhuma dieta cadastrada" description="Crie uma dieta com título e descrição da alimentação." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {diets.map((diet) => (
            <Card key={diet.id} className={`p-4 ${diet.isActive ? 'border-[var(--accent)]' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => openEdit(diet)}>
                  <p className="font-medium text-[var(--text-primary)]">{diet.title}</p>
                  {diet.content && <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-[var(--text-tertiary)]">{diet.content}</p>}
                </button>
                {diet.isActive ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-elevated-3)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    <CheckIcon width={12} height={12} />
                    Atual
                  </span>
                ) : (
                  <button
                    onClick={() => void setActiveDiet(diet.id)}
                    className="shrink-0 rounded-full border border-[var(--border-default)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    Ativar
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <DietFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
