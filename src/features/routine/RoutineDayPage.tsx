import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlusIcon } from '@/components/ui/icons'
import { listRoutineBlocks } from '@/db/repositories/routine.repo'
import { WEEKDAY_LABELS, WEEKDAY_SHORT, toWeekdayIndex } from '@/utils/date'
import { useNow } from '@/utils/useNow'
import type { RoutineBlock } from '@/db/models'
import { RoutineBlockFormModal } from './RoutineBlockFormModal'
import { CATEGORY_COLOR, findNow, formatDuration, hoursBySkill, summarizeDay, toMinutes, weekTotals } from './routineStats'

function Tile({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <Card className="p-3.5">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-1 truncate font-semibold tracking-tight text-[var(--text-primary)] ${small ? 'text-base leading-7' : 'text-[1.5rem] leading-tight'}`}>{value}</p>
    </Card>
  )
}

/** "Minha rotina": a agenda fixa da semana (acordar, orações, estudo, treino, tempo livre…), um dia
 * por vez, com o bloco de agora em destaque, o resumo do dia e quantas horas da semana vão pra cada
 * habilidade. Os blocos são editáveis; o que for removido vai pra Lixeira. */
export function RoutineDayPage() {
  const now = useNow()
  const todayIndex = toWeekdayIndex(now)
  const [weekday, setWeekday] = useState(todayIndex)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RoutineBlock | null>(null)

  const blocks = useLiveQuery(() => listRoutineBlocks(), [])
  const dayBlocks = useMemo(() => (blocks ?? []).filter((b) => b.weekday === weekday), [blocks, weekday])
  const summary = useMemo(() => summarizeDay(dayBlocks), [dayBlocks])
  const totals = useMemo(() => weekTotals(blocks ?? []), [blocks])
  const skills = useMemo(() => hoursBySkill(blocks ?? []), [blocks])
  const maxMinutes = skills[0]?.minutes ?? 1

  const isToday = weekday === todayIndex
  const live = useMemo(() => {
    if (!blocks || !isToday) return { current: null, next: null }
    const yesterday = (todayIndex + 6) % 7
    return findNow(dayBlocks, blocks.filter((b) => b.weekday === yesterday), now)
  }, [blocks, dayBlocks, isToday, now, todayIndex])
  const minuteNow = now.getHours() * 60 + now.getMinutes()

  const wake = dayBlocks[0]?.start
  const sleep = dayBlocks.find((b) => b.category === 'Sono')?.start
  const categoriesInDay = [...new Set(dayBlocks.map((b) => b.category))]

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (block: RoutineBlock) => {
    setEditing(block)
    setModalOpen(true)
  }

  return (
    <div className="reveal flex flex-col gap-4">
      {blocks === undefined ? (
        <>
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
          <Skeleton className="h-72" />
        </>
      ) : blocks.length === 0 ? (
        <EmptyState title="Nenhum bloco na rotina" description="Adicione os blocos do seu dia: acordar, estudo, treino, tempo livre…" actionLabel="Adicionar bloco" onAction={openNew} />
      ) : (
        <>
          <p className="text-sm text-[var(--text-secondary)]">
            Na semana: <b className="font-semibold text-[var(--text-primary)]">{formatDuration(totals.study)}</b> de estudo, <b className="font-semibold text-[var(--text-primary)]">{formatDuration(totals.workout)}</b> de
            treino e <b className="font-semibold text-[var(--text-primary)]">{formatDuration(totals.faith)}</b> de oração.
            {wake && sleep && ` Acordar ${wake}, dormir ${sleep}.`}
          </p>

          <div data-hscroll className="flex gap-1.5 overflow-x-auto pb-1">
            {WEEKDAY_SHORT.map((label, index) => (
              <button
                key={label}
                onClick={() => setWeekday(index)}
                aria-pressed={weekday === index}
                className={`press shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                  weekday === index ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                }`}
              >
                {index === todayIndex ? `${label} · hoje` : label}
              </button>
            ))}
          </div>

          {/* "Agora": só aparece no dia de hoje */}
          {isToday && (live.current || live.next) && (
            <Card elevated className="flex items-start gap-3 p-4">
              <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span className="halo absolute inset-0 rounded-full bg-[var(--accent)]" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-secondary)]">Agora</p>
                <p className="truncate font-medium text-[var(--text-primary)]">{live.current ? live.current.title : 'Entre um bloco e outro'}</p>
                {live.current?.detail && <p className="text-sm text-[var(--text-secondary)]">{live.current.detail}</p>}
                {live.next && (
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                    Depois, às {live.next.start}: {live.next.title}
                  </p>
                )}
              </div>
            </Card>
          )}

          <div key={`tiles-${weekday}`} className="reveal grid grid-cols-2 gap-3">
            <Tile label="Estudo no dia" value={formatDuration(summary.study)} />
            <Tile label="Treino no dia" value={formatDuration(summary.workout)} />
            <Tile label="Tempo livre" value={formatDuration(summary.free)} />
            <Tile label="Habilidade do dia" value={summary.focus ? summary.focus.skill : 'Descanso'} small />
          </div>

          <Card className="p-4">
            <h2 className="font-heading text-lg text-[var(--text-primary)]">Agenda de {WEEKDAY_LABELS[weekday].toLowerCase()}</h2>
            <div className="mb-3 mt-2 flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-[var(--text-secondary)]">
              {categoriesInDay.map((category) => (
                <span key={category} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[category] }} />
                  {category}
                </span>
              ))}
            </div>

            {dayBlocks.length === 0 ? (
              <p className="py-3 text-sm text-[var(--text-tertiary)]">Nenhum bloco neste dia.</p>
            ) : (
              <ul key={`day-${weekday}`} className="reveal flex flex-col">
                {dayBlocks.map((block) => {
                  const isCurrent = live.current?.id === block.id
                  const finished = isToday && !isCurrent && block.end !== '' && toMinutes(block.end) > toMinutes(block.start) && toMinutes(block.end) <= minuteNow
                  return (
                    <li key={block.id} className="border-t border-[var(--border-subtle)] first:border-t-0">
                      <button
                        type="button"
                        onClick={() => openEdit(block)}
                        aria-current={isCurrent ? 'true' : undefined}
                        className={`press flex w-full items-stretch gap-3 rounded-[var(--radius-sm)] py-2.5 text-left ${finished ? 'opacity-55' : ''} ${isCurrent ? 'bg-[var(--bg-elevated-2)] px-2 -mx-2' : ''}`}
                      >
                        <span className="w-11 shrink-0 text-xs tabular-nums leading-snug text-[var(--text-secondary)]">
                          {block.start}
                          <br />
                          <span className="text-[var(--text-tertiary)]">{block.end || '—'}</span>
                        </span>
                        <span aria-hidden="true" className="w-[3px] shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[block.category] }} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium leading-snug text-[var(--text-primary)]">{block.title}</span>
                          {block.detail && <span className="block text-sm leading-snug text-[var(--text-secondary)]">{block.detail}</span>}
                        </span>
                        {isCurrent && <span className="self-center rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-contrast)]">agora</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Button variant="secondary" onClick={openNew} className="self-start">
            <PlusIcon width={16} height={16} />
            Adicionar bloco
          </Button>

          <Card className="p-4">
            <h2 className="font-heading text-lg text-[var(--text-primary)]">Horas por semana em cada habilidade</h2>
            <p className="mb-3.5 mt-1 text-xs text-[var(--text-tertiary)]">Soma de todos os blocos da semana, incluindo o tempo livre (sem sono, trabalho e tarefas de rotina).</p>
            <ul className="flex flex-col gap-2.5">
              {skills.map((item) => (
                <li key={item.skill} className="grid grid-cols-[minmax(0,7.5rem)_1fr_3.2rem] items-center gap-2.5 text-sm">
                  <span className="truncate text-[var(--text-primary)]">{item.skill}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
                    <span className="bar-x block h-full w-full rounded-full" style={{ transform: `scaleX(${Math.max(0.02, item.minutes / maxMinutes)})`, background: CATEGORY_COLOR[item.category] }} />
                  </span>
                  <span className="text-right text-xs tabular-nums text-[var(--text-secondary)]">{formatDuration(item.minutes)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <RoutineBlockFormModal open={modalOpen} onClose={() => setModalOpen(false)} defaultWeekday={weekday as RoutineBlock['weekday']} editing={editing} />
    </div>
  )
}
