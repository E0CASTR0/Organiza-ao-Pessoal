import type { ReactNode } from 'react'

interface ProgressRingProps {
  value: number
  total: number
  size?: number
  stroke?: number
  children?: ReactNode
}

/** Anel de progresso (feito / total). O arco é um círculo só, com `pathLength=1` — assim
 * `strokeDashoffset` vai de 1 (vazio) a 0 (cheio) sem conta de circunferência. */
export function ProgressRing({ value, total, size = 108, stroke = 9, children }: ProgressRingProps) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0
  const radius = (size - stroke) / 2
  const center = size / 2
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value} de ${total} metas feitas`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border-default)" strokeWidth={stroke} />
        <circle
          className="ring-arc"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - ratio}
          opacity={ratio > 0 ? 1 : 0}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
