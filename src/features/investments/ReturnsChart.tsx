import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/currency'
import { capitalizeFirst } from '@/utils/date'
import type { MonthTotal } from '@/db/repositories/investments.repo'

const WIDTH = 320
const HEIGHT = 156
const TOP = 26 // espaço em cima pro valor da barra escolhida
const BOTTOM = 24 // espaço embaixo pros nomes dos meses
const BAR_WIDTH = 22 // barras finas (teto de 24 px), com bastante "ar" entre elas
const RADIUS = 4

const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const monthLong = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

function parseMonth(key: string): Date {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/** Valor curto pro rótulo em cima da barra: R$ 1,2 mil / R$ 118 */
function compact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  if (abs >= 1000) return `${sign}R$ ${(abs / 1000).toFixed(1).replace('.', ',')} mil`
  return `${sign}R$ ${Math.round(abs)}`
}

/** Barra com a ponta de dados arredondada (4 px) e a base reta, crescendo da linha de base. */
function barPath(x: number, baseline: number, top: number, positive: boolean): string {
  const w = BAR_WIDTH
  const r = Math.min(RADIUS, Math.abs(top - baseline) / 2)
  if (positive) return `M${x},${baseline} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${baseline} Z`
  return `M${x},${baseline} V${top - r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top - r} V${baseline} Z`
}

/** Retorno total por mês (últimos 6). Uma série só: sem legenda — o título já diz o que é. O mês
 * em foco usa a cor de destaque e os outros ficam apagados; toque numa barra pra trocar. Há uma
 * versão em tabela pra leitor de tela. */
export function ReturnsChart({ data, title = 'Retorno por mês', column = 'Retorno' }: { data: MonthTotal[]; title?: string; column?: string }) {
  const [selected, setSelected] = useState(data.length - 1)
  const values = data.map((d) => d.total)
  const max = Math.max(0, ...values)
  const min = Math.min(0, ...values)
  const range = max - min || 1
  const plotHeight = HEIGHT - TOP - BOTTOM
  const yFor = (value: number) => TOP + ((max - value) / range) * plotHeight
  const baseline = yFor(0)
  const slot = WIDTH / data.length
  const current = data[selected]

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h2>
        <p className="text-xs text-[var(--text-tertiary)]">{capitalizeFirst(monthLong.format(parseMonth(current.month)))}</p>
      </div>
      <p className="mb-2 text-[1.6rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">{formatCurrency(current.total)}</p>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="group" aria-label={`Gráfico de barras dos últimos ${data.length} meses. Há uma tabela logo abaixo.`}>
        <line x1="0" x2={WIDTH} y1={baseline} y2={baseline} stroke="var(--border-default)" strokeWidth="1" />
        {data.map((d, i) => {
          const x = i * slot + (slot - BAR_WIDTH) / 2
          const isSelected = i === selected
          const positive = d.total >= 0
          const top = d.total === 0 ? baseline - 2 : yFor(d.total)
          return (
            <g key={d.month}>
              {d.total === 0 ? (
                <rect x={x} y={baseline - 2} width={BAR_WIDTH} height="2" rx="1" fill="var(--border-default)" />
              ) : (
                <path
                  d={barPath(x, baseline, top, positive)}
                  fill={positive ? 'var(--accent)' : 'var(--danger-strong)'}
                  opacity={isSelected ? 1 : 0.4}
                  style={{ transformBox: 'fill-box', transformOrigin: positive ? 'bottom' : 'top', animation: `grow-y 700ms var(--ease-spring) ${i * 60}ms backwards`, transition: 'opacity 250ms' }}
                />
              )}
              {isSelected && d.total !== 0 && (
                <text x={x + BAR_WIDTH / 2} y={positive ? top - 7 : top + 15} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
                  {compact(d.total)}
                </text>
              )}
              <text x={x + BAR_WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fontSize="11" fill={isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)'} fontWeight={isSelected ? 600 : 400}>
                {monthShort.format(parseMonth(d.month)).replace('.', '')}
              </text>
              {/* área de toque: a coluna inteira do mês (53 px de largura, acima dos 44 mínimos) */}
              <rect
                x={i * slot}
                y="0"
                width={slot}
                height={HEIGHT}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`${monthLong.format(parseMonth(d.month))}: ${formatCurrency(d.total)}`}
                aria-pressed={isSelected}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(i)
                  }
                }}
              />
            </g>
          )
        })}
      </svg>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-[var(--text-tertiary)]">Ver em tabela</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="text-[var(--text-tertiary)]">
              <th scope="col" className="py-1 font-normal">
                Mês
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                {column}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-t border-[var(--border-subtle)]">
                <td className="py-1.5 text-[var(--text-secondary)]">{capitalizeFirst(monthLong.format(parseMonth(d.month)))}</td>
                <td className="py-1.5 text-right tabular-nums text-[var(--text-primary)]">{formatCurrency(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  )
}
