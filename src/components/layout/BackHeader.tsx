import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@/components/ui/icons'

export function BackHeader({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="mb-4 flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    >
      <ChevronLeftIcon width={20} height={20} />
      <span className="text-sm font-medium">{title}</span>
    </button>
  )
}
