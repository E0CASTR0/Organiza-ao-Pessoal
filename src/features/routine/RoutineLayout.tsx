import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { DumbbellIcon } from '@/components/ui/icons'

const segments = [
  { value: 'treino', label: 'Treino' },
  { value: 'dieta', label: 'Dieta' },
]

export function RoutineLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = segments.find((s) => location.pathname.endsWith(s.value))?.value ?? 'treino'

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Rotina" icon={<DumbbellIcon width={20} height={20} />} />
      <SegmentedControl segments={segments} value={current} onChange={(v) => navigate(`/rotina/${v}`)} />
      <Outlet />
    </div>
  )
}
