import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@/components/ui/icons'

export function BackHeader({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      // padding extra só pra ampliar a área de toque; as margens negativas compensam, então o
      // texto continua exatamente no mesmo lugar de antes
      className="press -ml-1 -mt-1.5 mb-2.5 flex items-center gap-1 py-1.5 pl-1 pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    >
      <ChevronLeftIcon width={20} height={20} />
      <span className="text-sm font-medium">{title}</span>
    </button>
  )
}
