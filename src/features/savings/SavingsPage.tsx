import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ArrowDownIcon, ArrowUpIcon, PiggyIcon, PlusIcon, MinusIcon } from '@/components/ui/icons'
import { ReturnsChart } from '@/features/investments/ReturnsChart'
import { listSavingsEntries, summarize, monthlyNet } from '@/db/repositories/savings.repo'
import { getSettings } from '@/db/repositories/settings.repo'
import { getProfile } from '@/db/repositories/profile.repo'
import { formatCurrency } from '@/utils/currency'
import { capitalizeFirst, formatDateShort } from '@/utils/date'
import { SavingsEntryFormModal, type SavingsKind } from './SavingsEntryFormModal'
import { SavingsGoalModal } from './SavingsGoalModal'
import type { SavingsEntry } from '@/db/models'

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

/** Caixinha: o dinheiro guardado. Saldo grande, meta opcional com barra de progresso, gráfico do
 * que sobrou em cada mês e o histórico de tudo que entrou e saiu. */
export function SavingsPage() {
  const entries = useLiveQuery(() => listSavingsEntries(), [])
  const settings = useLiveQuery(() => getSettings(), [])
  const profile = useLiveQuery(() => getProfile(), [])
  const [formOpen, setFormOpen] = useState(false)
  const [kind, setKind] = useState<SavingsKind>('deposit')
  const [editing, setEditing] = useState<SavingsEntry | null>(null)
  const [goalOpen, setGoalOpen] = useState(false)

  const summary = useMemo(() => summarize(entries ?? []), [entries])
  const monthly = useMemo(() => monthlyNet(entries ?? [], 6), [entries])
  const goal = settings?.savingsGoal ?? null
  const progress = goal ? Math.max(0, Math.min(1, summary.balance / goal)) : 0
  const name = profile?.nickname || profile?.displayName

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: SavingsEntry[] }>()
    for (const entry of entries ?? []) {
      const key = entry.date.slice(0, 7)
      const [year, month] = key.split('-').map(Number)
      const group = map.get(key) ?? { label: capitalizeFirst(monthFormatter.format(new Date(year, month - 1, 1))), items: [] }
      group.items.push(entry)
      map.set(key, group)
    }
    return Array.from(map.values())
  }, [entries])

  const openNew = (nextKind: SavingsKind) => {
    setEditing(null)
    setKind(nextKind)
    setFormOpen(true)
  }

  const openEdit = (entry: SavingsEntry) => {
    setEditing(entry)
    setFormOpen(true)
  }

  return (
    <div className="reveal flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader title={name ? `Caixinha de ${name}` : 'Minha caixinha'} icon={<PiggyIcon width={20} height={20} />} />

      <Card className="flex flex-col p-5">
        <p className="text-sm text-[var(--text-secondary)]">Dinheiro guardado</p>
        <AnimatedNumber value={summary.balance} format={formatCurrency} className="mt-1 block text-[2.6rem] font-semibold leading-none tracking-tight text-[var(--text-primary)]" />
        {entries && entries.length > 0 && (
          <p className="mt-2.5 text-sm text-[var(--text-tertiary)]">
            {formatCurrency(summary.deposited)} guardados · {formatCurrency(summary.withdrawn)} retirados
          </p>
        )}

        {goal ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progresso da meta">
              <div className="bar-x h-full w-full rounded-full bg-[var(--accent)]" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[var(--text-secondary)]">
                {progress >= 1 ? 'Meta alcançada' : `${Math.round(progress * 100)}% de ${formatCurrency(goal)}`}
              </span>
              <button type="button" onClick={() => setGoalOpen(true)} className="press text-[var(--accent)]">
                Editar meta
              </button>
            </div>
            {progress < 1 && <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">Faltam {formatCurrency(goal - summary.balance)}</p>}
          </div>
        ) : (
          <button type="button" onClick={() => setGoalOpen(true)} className="press mt-3 self-start text-sm text-[var(--accent)]">
            Definir uma meta pra caixinha
          </button>
        )}

        <div className="mt-5 flex gap-2.5">
          <Button className="flex-1" onClick={() => openNew('deposit')}>
            <PlusIcon width={16} height={16} />
            Guardar
          </Button>
          <Button className="flex-1" variant="secondary" onClick={() => openNew('withdraw')} disabled={summary.balance <= 0}>
            <MinusIcon width={16} height={16} />
            Retirar
          </Button>
        </div>
      </Card>

      {entries && entries.length === 0 && (
        <EmptyState
          icon={<PiggyIcon width={22} height={22} />}
          title="Sua caixinha está vazia"
          description="Anote cada valor que você guardar e acompanhe o total crescer."
          actionLabel="Guardar o primeiro valor"
          onAction={() => openNew('deposit')}
        />
      )}

      {entries && entries.length > 0 && monthly.some((m) => m.total !== 0) && <ReturnsChart data={monthly} title="Guardado por mês" column="Guardado" />}

      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{group.label}</h2>
          <div className="flex flex-col gap-2">
            {group.items.map((entry) => {
              const deposit = entry.amount >= 0
              return (
                <Card key={entry.id} className="flex items-center gap-3 p-3" onClick={() => openEdit(entry)}>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${deposit ? 'bg-[var(--bg-elevated-3)] text-[var(--success-strong)]' : 'bg-[var(--bg-elevated-3)] text-[var(--text-secondary)]'}`}
                  >
                    {deposit ? <ArrowDownIcon width={16} height={16} /> : <ArrowUpIcon width={16} height={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-[var(--text-primary)]">{entry.note || (deposit ? 'Guardei' : 'Retirei')}</span>
                    <span className="block text-xs text-[var(--text-tertiary)]">{formatDateShort(entry.date)}</span>
                  </span>
                  <span className={`shrink-0 font-medium tabular-nums ${deposit ? 'text-[var(--success-strong)]' : 'text-[var(--text-primary)]'}`}>
                    {deposit ? '+' : '−'}
                    {formatCurrency(Math.abs(entry.amount))}
                  </span>
                </Card>
              )
            })}
          </div>
        </section>
      ))}

      <SavingsEntryFormModal open={formOpen} onClose={() => setFormOpen(false)} kind={kind} editing={editing} balance={summary.balance} />
      <SavingsGoalModal open={goalOpen} onClose={() => setGoalOpen(false)} current={goal} />
    </div>
  )
}
