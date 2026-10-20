import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon, ReceiptIcon } from '@/components/ui/icons'
import { listFixedBills, listAllPayments, togglePaid } from '@/db/repositories/fixedBills.repo'
import { currentBillCycleKey, currentMonthKey, formatMonthLabel } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { FixedBillFormModal } from './FixedBillFormModal'
import type { FixedBill } from '@/db/models'

export function FixedBillsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FixedBill | null>(null)

  const bills = useLiveQuery(() => listFixedBills(), []) ?? []
  const payments = useLiveQuery(() => listAllPayments(), []) ?? []

  const activeBills = bills.filter((b) => b.active)
  // cada conta tem seu próprio ciclo (vence dia X, fica "pago" até o próximo dia X) —
  // não reseta todo dia 1, só quando o vencimento daquela conta específica chega de novo
  const cycleKeyFor = (bill: FixedBill) => currentBillCycleKey(bill.dueDay)
  const isPaid = (bill: FixedBill) => payments.some((p) => p.fixedBillId === bill.id && p.month === cycleKeyFor(bill) && p.paidAt)
  const totalMonth = activeBills.reduce((sum, b) => sum + b.value, 0)
  const paidBills = activeBills.filter((b) => isPaid(b))
  const totalPaid = paidBills.reduce((sum, b) => sum + b.value, 0)
  const paidRatio = activeBills.length > 0 ? paidBills.length / activeBills.length : 0

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (bill: FixedBill) => {
    setEditing(bill)
    setModalOpen(true)
  }

  return (
    <div className="reveal flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader
        title="Contas Fixas"
        subtitle={formatMonthLabel(currentMonthKey())}
        icon={<ReceiptIcon width={20} height={20} />}
        action={
          <Button size="sm" onClick={openNew}>
            <PlusIcon width={16} height={16} />
            Nova conta
          </Button>
        }
      />

      <div className="reveal grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-[var(--text-secondary)]">Total do mês</p>
          <p className="mt-1 font-heading text-2xl text-[var(--text-primary)]">{formatCurrency(totalMonth)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-[var(--text-secondary)]">Já pago</p>
          <p className="mt-1 font-heading text-2xl text-[var(--success)]">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      {activeBills.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              {paidBills.length} de {activeBills.length} {activeBills.length === 1 ? 'conta paga' : 'contas pagas'}
            </span>
            <span className="text-[var(--text-tertiary)]">{Math.round(paidRatio * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-default)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(paidRatio * 100)} aria-label="Contas pagas">
            <div className="bar-x h-full w-full rounded-full bg-[var(--success-strong)]" style={{ transform: `scaleX(${paidRatio})` }} />
          </div>
        </div>
      )}

      {activeBills.length === 0 ? (
        <EmptyState title="Nenhuma conta fixa cadastrada" description="Adicione contas recorrentes com dia de vencimento e valor." />
      ) : (
        <div className="reveal flex flex-col gap-2.5">
          {activeBills
            .slice()
            .sort((a, b) => a.dueDay - b.dueDay)
            .map((bill) => (
              <Card key={bill.id} className="flex items-center justify-between gap-3 p-3.5">
                {/* sem texto, a caixinha de 20 px sozinha é difícil de acertar: -m-3/p-3 amplia a
                    área de toque sem mudar o layout */}
                <Checkbox className="-m-3 p-3" aria-label={`Marcar ${bill.name} como paga`} checked={isPaid(bill)} onChange={() => void togglePaid(bill.id, cycleKeyFor(bill))} />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
                  {bill.imageBase64 ? <img src={bill.imageBase64} alt="" width={40} height={40} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <ReceiptIcon width={18} height={18} />}
                </span>
                <button className="min-w-0 flex-1 text-left" onClick={() => openEdit(bill)}>
                  <p className="truncate font-medium text-[var(--text-primary)]">{bill.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Vence dia {bill.dueDay}</p>
                </button>
                <p className="shrink-0 text-sm text-[var(--text-secondary)]">{formatCurrency(bill.value)}</p>
              </Card>
            ))}
        </div>
      )}

      <FixedBillFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
