import { Card } from '@/components/ui/Card'
import { CheckIcon } from '@/components/ui/icons'
import { useTheme } from '@/theme/useTheme'
import type { AccentKey } from '@/db/models'

const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: 'prata', label: 'Prata', swatch: '#c7c3b8' },
  { key: 'champagne', label: 'Champagne', swatch: '#d6c29a' },
  { key: 'bronze', label: 'Bronze', swatch: '#c9a07e' },
  { key: 'salvia', label: 'Sálvia', swatch: '#9db8a4' },
]

/** Personalização: cor de destaque do app. */
export function AppearanceSection() {
  const { accent, setAccent } = useTheme()

  return (
    <Card className="p-4">
      <h2 className="font-medium text-[var(--text-primary)]">Cor de destaque</h2>
      <p className="mb-3 text-sm text-[var(--text-tertiary)]">Botões, anel de metas e detalhes ativos.</p>
      <div role="radiogroup" aria-label="Cor de destaque" className="flex gap-3">
        {ACCENTS.map(({ key, label, swatch }) => {
          const selected = accent === key
          return (
            <button key={key} type="button" role="radio" aria-checked={selected} aria-label={label} onClick={() => setAccent(key)} className="press flex flex-1 flex-col items-center gap-1.5">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${selected ? 'border-[var(--text-primary)]' : 'border-transparent'}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#0a0a0a]" style={{ backgroundColor: swatch }}>
                  {selected && <CheckIcon width={16} height={16} />}
                </span>
              </span>
              <span className={`text-xs ${selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
