import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DropIcon, MinusIcon, PlusIcon } from '@/components/ui/icons'
import { useToast } from '@/components/ui/ToastContext'
import { getSettings, setWaterConfig } from '@/db/repositories/settings.repo'
import { listGoals, addGoal } from '@/db/repositories/dailyGoals.repo'
import { findLinkedWaterGoal, glassMl, waterLiters, waterTargetGlasses } from '@/db/repositories/water.repo'

const GLASS_SIZES = [200, 250, 300, 350]

/** Meta de água do dia: em litros, com o tamanho do copo — o app calcula quantos copos isso dá
 * (arredondando pra cima) e marca sozinho a meta "Beber … de água" quando fecha. */
export function WaterSection() {
  const toast = useToast()
  const settings = useLiveQuery(() => getSettings(), [])
  const goals = useLiveQuery(() => listGoals(), []) ?? []
  const liters = waterLiters(settings)
  const ml = glassMl(settings)
  const target = waterTargetGlasses(settings)
  const linked = findLinkedWaterGoal(goals, settings)
  const selectValue = settings?.waterLinkedGoalId === null ? 'none' : settings?.waterLinkedGoalId ? settings.waterLinkedGoalId : 'auto'
  const litersLabel = liters.toLocaleString('pt-BR')
  const goalTitle = `Beber ${litersLabel} ${liters === 1 ? 'litro' : 'litros'} de água`

  const createGoal = async () => {
    await addGoal(goalTitle)
    toast.show('Meta criada. Ela fecha sozinha quando você bater a água do dia.')
  }

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div className="flex items-center gap-2">
        <DropIcon width={18} height={18} className="text-[var(--accent)]" />
        <h2 className="font-medium text-[var(--text-primary)]">Água</h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[var(--text-primary)]">Meta por dia</p>
          <p className="text-sm text-[var(--text-tertiary)]">
            {litersLabel} L ÷ {ml} ml = <span className="font-medium text-[var(--text-secondary)]">{target} copos</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Diminuir meta de litros"
            disabled={liters <= 1}
            onClick={() => void setWaterConfig({ waterLiters: Math.max(1, liters - 0.5) })}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span className="w-12 text-center text-lg font-semibold tabular-nums text-[var(--text-primary)]" aria-live="polite">
            {litersLabel} L
          </span>
          <button
            type="button"
            aria-label="Aumentar meta de litros"
            disabled={liters >= 6}
            onClick={() => void setWaterConfig({ waterLiters: Math.min(6, liters + 0.5) })}
            className="press flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[var(--text-primary)]">Tamanho do copo</p>
        <div role="radiogroup" aria-label="Tamanho do copo" className="flex gap-2">
          {GLASS_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={ml === size}
              onClick={() => void setWaterConfig({ glassMl: size })}
              className={`press flex-1 rounded-full border py-2 text-sm font-medium ${
                ml === size ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'
              }`}
            >
              {size} ml
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <label htmlFor="water-goal" className="mb-1 block text-[var(--text-primary)]">
          Meta que fecha sozinha
        </label>
        <p className="mb-2.5 text-sm text-[var(--text-tertiary)]">
          {linked ? `Quando bater os ${target} copos, “${linked.title}” é marcada como feita.` : 'Nenhuma meta de água ligada ainda.'}
        </p>
        <select
          id="water-goal"
          value={selectValue}
          onChange={(e) => {
            const value = e.target.value
            void setWaterConfig({ waterLinkedGoalId: value === 'auto' ? undefined : value === 'none' ? null : value })
          }}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--field-bg)] px-3.5 py-2.5 text-[var(--text-primary)]"
        >
          <option value="auto">Detectar pelo nome (tem “água”)</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
          <option value="none">Nenhuma</option>
        </select>
        {!linked && (
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => void createGoal()}>
            Criar a meta “{goalTitle}”
          </Button>
        )}
      </div>
    </Card>
  )
}
