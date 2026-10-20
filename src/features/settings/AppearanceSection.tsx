import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { CheckIcon, MinusIcon, PlusIcon } from '@/components/ui/icons'
import { useTheme } from '@/theme/useTheme'
import { getSettings, setWaterGoal } from '@/db/repositories/settings.repo'
import { DEFAULT_WATER_GOAL } from '@/db/repositories/water.repo'
import type { AccentKey } from '@/db/models'

const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: 'prata', label: 'Prata', swatch: '#c7c3b8' },
  { key: 'champagne', label: 'Champagne', swatch: '#d6c29a' },
  { key: 'bronze', label: 'Bronze', swatch: '#c9a07e' },
  { key: 'salvia', label: 'Sálvia', swatch: '#9db8a4' },
]

/** Personalização: cor de destaque do app e meta diária de água. */
export function AppearanceSection() {
  const { accent, setAccent } = useTheme()
  const settings = useLiveQuery(() => getSettings(), [])
  const waterGoal = settings?.waterGoal ?? DEFAULT_WATER_GOAL

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div>
        <h2 className="font-medium text-[var(--text-primary)]">Cor de destaque</h2>
        <p className="mb-3 text-sm text-[var(--text-tertiary)]">Botões, anel de metas e detalhes ativos.</p>
        <div role="radiogroup" aria-label="Cor de destaque" className="flex gap-3">
          {ACCENTS.map(({ key, label, swatch }) => {
            const selected = accent === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label}
                onClick={() => setAccent(key)}
                className="press flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${selected ? 'border-[var(--text-primary)]' : 'border-transparent'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#0a0a0a]" style={{ backgroundColor: swatch }}>
                    {selected && <CheckIcon width={16} height={16} />}
                  </span>
                </span>
                <span className={`text-xs ${selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
        <div>
          <h2 className="font-medium text-[var(--text-primary)]">Meta de água</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Copos por dia na tela inicial.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Diminuir meta de água"
            disabled={waterGoal <= 1}
            onClick={() => void setWaterGoal(Math.max(1, waterGoal - 1))}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span className="w-6 text-center text-lg font-semibold tabular-nums text-[var(--text-primary)]" aria-live="polite">
            {waterGoal}
          </span>
          <button
            type="button"
            aria-label="Aumentar meta de água"
            disabled={waterGoal >= 20}
            onClick={() => void setWaterGoal(Math.min(20, waterGoal + 1))}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </Card>
  )
}
