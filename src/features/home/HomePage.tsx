import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrashIcon, CalendarIcon, ReceiptIcon, PlusIcon } from '@/components/ui/icons'
import { listGoalsByDate, addGoal, toggleGoal, removeGoal } from '@/db/repositories/dailyGoals.repo'
import { listEventsByDate } from '@/db/repositories/events.repo'
import { listFixedBills } from '@/db/repositories/fixedBills.repo'
import { todayKey, formatDateLong } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { getProfile } from '@/db/repositories/profile.repo'

export function HomePage() {
  const today = todayKey()
  const [newGoal, setNewGoal] = useState('')

  const profile = useLiveQuery(() => getProfile(), [])
  const goals = useLiveQuery(() => listGoalsByDate(today), [today]) ?? []
  const todayEvents = useLiveQuery(() => listEventsByDate(today), [today]) ?? []
  const bills = useLiveQuery(() => listFixedBills(), []) ?? []

  const upcomingBills = bills.filter((bill) => {
    if (!bill.active) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const dueThisMonth = new Date(now.getFullYear(), now.getMonth(), bill.dueDay)
    // se o dia já passou nesse mês, a próxima ocorrência é no mês seguinte
    const nextOccurrence = dueThisMonth >= now ? dueThisMonth : new Date(now.getFullYear(), now.getMonth() + 1, bill.dueDay)
    const diffDays = Math.ceil((nextOccurrence.getTime() - now.getTime()) / 86_400_000)
    return diffDays >= 0 && diffDays <= 3
  })

  const handleAddGoal = async () => {
    const title = newGoal.trim()
    if (!title) return
    await addGoal(today, title)
    setNewGoal('')
  }

  const greetingName = profile?.nickname || profile?.displayName

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={greetingName ? `Olá, ${greetingName}` : 'Início'}
        subtitle={formatDateLong(today)}
      />

      <section>
        <h2 className="mb-2.5 text-sm font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Metas de hoje</h2>
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            {goals.length === 0 && <p className="text-sm text-[var(--text-tertiary)]">Nenhuma meta adicionada ainda.</p>}
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between gap-2">
                <Checkbox
                  checked={goal.completed}
                  onChange={() => void toggleGoal(goal.id)}
                  label={goal.title}
                />
                <button
                  type="button"
                  onClick={() => void removeGoal(goal.id)}
                  aria-label="Remover meta"
                  className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--danger)]"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            ))}
            <form
              className="mt-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void handleAddGoal()
              }}
            >
              <TextField
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Nova meta para hoje"
                className="flex-1"
              />
              <Button type="submit" size="md" aria-label="Adicionar meta">
                <PlusIcon width={18} height={18} />
              </Button>
            </form>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2.5 text-sm font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Hoje</h2>
        {todayEvents.length === 0 && upcomingBills.length === 0 ? (
          <EmptyState title="Nada agendado por aqui" description="Eventos da agenda e contas próximas do vencimento aparecem aqui." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayEvents.map((event) => (
              <Card key={event.id} className="flex items-center gap-3 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
                  <CalendarIcon width={18} height={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{event.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{event.time ?? 'Dia inteiro'}</p>
                </div>
              </Card>
            ))}
            {upcomingBills.map((bill) => (
              <Card key={bill.id} className="flex items-center gap-3 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
                  <ReceiptIcon width={18} height={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{bill.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Vence dia {bill.dueDay}</p>
                </div>
                <p className="shrink-0 text-sm text-[var(--text-secondary)]">{formatCurrency(bill.value)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
