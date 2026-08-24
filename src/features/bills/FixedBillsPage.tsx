import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon, ReceiptIcon } from '@/components/ui/icons'
import { listFixedBills, listPaymentsByMonth, togglePaid } from '@/db/repositories/fixedBills.repo'
import { currentMonthKey, formatMonthLabel } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { FixedBillFormModal } from './FixedBillFormModal'
import type { FixedBill } from '@/db/models'

export function FixedBillsPage() {
  const month = currentMonthKey()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FixedBill | null>(null)

  const bills = useLiveQuery(() => listFixedBills(), []) ?? []
  const payments = useLiveQuery(() => listPaymentsByMonth(month), [month]) ?? []

  const activeBills = bills.filter((b) => b.active)
  const isPaid = (billId: string) => payments.some((p) => p.fixedBillId === billId && p.paidAt)
  const totalMonth = activeBills.reduce((sum, b) => sum + b.value, 0)
  const totalPaid = activeBills.filter((b) => isPaid(b.id)).reduce((sum, b) => sum + b.value, 0)

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (bill: FixedBill) => {
    setEditing(bill)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader
        title="Contas Fixas"
        subtitle={formatMonthLabel(month)}
        icon={<ReceiptIcon width={20} height={20} />}
        action={
          <Button size="sm" onClick={openNew}>
            <PlusIcon width={16} height={16} />
            Nova conta
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Total do mês</p>
          <p className="mt-1 font-[var(--font-heading)] text-xl text-[var(--text-primary)]">{formatCurrency(totalMonth)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Já pago</p>
          <p className="mt-1 font-[var(--font-heading)] text-xl text-[var(--success)]">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      {activeBills.length === 0 ? (
        <EmptyState title="Nenhuma conta fixa cadastrada" description="Adicione contas recorrentes com dia de vencimento e valor." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {activeBills
            .slice()
            .sort((a, b) => a.dueDay - b.dueDay)
            .map((bill) => (
              <Card key={bill.id} className="flex items-center justify-between gap-3 p-3.5">
                <Checkbox checked={isPaid(bill.id)} onChange={() => void togglePaid(bill.id, month)} />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-elevated-3)] text-[var(--accent)]">
                  {bill.imageBase64 ? <img src={bill.imageBase64} alt="" className="h-full w-full object-cover" /> : <ReceiptIcon width={18} height={18} />}
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
