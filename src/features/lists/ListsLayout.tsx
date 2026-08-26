import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ListIcon } from '@/components/ui/icons'

const segments = [
  { value: 'prioridades', label: 'Prioridades' },
  { value: 'compras', label: 'Compras' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'notas', label: 'Notas' },
]

export function ListsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = segments.find((s) => location.pathname.endsWith(s.value))?.value ?? 'prioridades'

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Listas" icon={<ListIcon width={20} height={20} />} />
      <SegmentedControl segments={segments} value={current} onChange={(v) => navigate(`/listas/${v}`)} />
      <Outlet />
    </div>
  )
}
