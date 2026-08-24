import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

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
      <PageHeader title="Rotina" />
      <SegmentedControl segments={segments} value={current} onChange={(v) => navigate(`/rotina/${v}`)} />
      <Outlet />
    </div>
  )
}
