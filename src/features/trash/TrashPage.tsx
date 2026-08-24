import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TrashIcon } from '@/components/ui/icons'
import { listTrash, restoreTrashItem, purgeTrashItem, purgeAllTrash } from '@/db/repositories/trash.repo'

const ENTITY_LABELS: Record<string, string> = {
  dailyGoals: 'Meta do dia',
  events: 'Evento da agenda',
  monthlyPriorities: 'Prioridade do mês',
  shoppingItems: 'Item de compras',
  workTasks: 'Tarefa de trabalho',
  investmentCategories: 'Categoria de investimento',
  investments: 'Investimento',
  workoutDays: 'Dia de treino',
  exercises: 'Exercício',
  diets: 'Dieta',
  fixedBills: 'Conta fixa',
}

export function TrashPage() {
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false)
  const items = useLiveQuery(() => listTrash(), []) ?? []

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Configurações" to="/mais/configuracoes" />
      <PageHeader
        title="Lixeira"
        subtitle="Itens excluídos ficam aqui até você restaurar ou apagar de vez."
        icon={<TrashIcon width={20} height={20} />}
        action={
          items.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setConfirmPurgeAll(true)}>
              Esvaziar
            </Button>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState title="Lixeira vazia" description="Nada foi excluído ainda." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{ENTITY_LABELS[item.entityType] ?? item.entityType}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="secondary" onClick={() => void restoreTrashItem(item.id)}>
                  Restaurar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void purgeTrashItem(item.id)}>
                  Apagar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmPurgeAll}
        title="Esvaziar lixeira"
        description="Todos os itens da lixeira serão apagados definitivamente. Essa ação não pode ser desfeita."
        confirmLabel="Esvaziar"
        danger
        onConfirm={() => {
          void purgeAllTrash()
          setConfirmPurgeAll(false)
        }}
        onCancel={() => setConfirmPurgeAll(false)}
      />
    </div>
  )
}
