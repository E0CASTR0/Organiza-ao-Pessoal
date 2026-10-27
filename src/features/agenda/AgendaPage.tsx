import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toggle } from '@/components/ui/Toggle'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarIcon } from '@/components/ui/icons'
import { listEventsByDate, listEventsBetween } from '@/db/repositories/events.repo'
import { listRoutineBlocks } from '@/db/repositories/routine.repo'
import { todayKey, toDateKey, addDays, startOfWeek, formatDateLong, formatDateShort, WEEKDAY_LABELS, WEEKDAY_SHORT, toWeekdayIndex } from '@/utils/date'
import { RoutineBlockFormModal } from '@/features/routine/RoutineBlockFormModal'
import { CATEGORY_COLOR } from '@/features/routine/routineStats'
import { buildAgendaEntries, weekHighlights } from '@/features/routine/routineAgenda'
import { EventFormModal } from './EventFormModal'
import type { EventItem, RoutineBlock } from '@/db/models'

type ViewMode = 'day' | 'week'

const ROUTINE_PREF_KEY = 'agenda:show-routine'

function readShowRoutine(): boolean {
  try {
    return localStorage.getItem(ROUTINE_PREF_KEY) !== '0'
  } catch {
    return true
  }
}

export function AgendaPage() {
  const [view, setView] = useState<ViewMode>('day')
  const [anchor, setAnchor] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [showRoutine, setShowRoutine] = useState(readShowRoutine)
  const [routineModalOpen, setRoutineModalOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null)

  const dateKey = toDateKey(anchor)
  const dayEvents = useLiveQuery(() => listEventsByDate(dateKey), [dateKey]) ?? []
  const routineBlocks = useLiveQuery(() => listRoutineBlocks(), []) ?? []

  const weekStart = startOfWeek(anchor)
  const weekStartKey = toDateKey(weekStart)
  const weekEndKey = toDateKey(addDays(weekStart, 6))
  const weekEvents = useLiveQuery(() => listEventsBetween(weekStartKey, weekEndKey), [weekStartKey, weekEndKey]) ?? []

  const blocksOf = (weekday: number) => (showRoutine ? routineBlocks.filter((b) => b.weekday === weekday) : [])
  const dayEntries = buildAgendaEntries(dayEvents, blocksOf(toWeekdayIndex(anchor)))

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (event: EventItem) => {
    setEditing(event)
    setModalOpen(true)
  }

  const openBlock = (block: RoutineBlock) => {
    setEditingBlock(block)
    setRoutineModalOpen(true)
  }

  const toggleRoutine = () => {
    const next = !showRoutine
    setShowRoutine(next)
    try {
      localStorage.setItem(ROUTINE_PREF_KEY, next ? '1' : '0')
    } catch {
      // sem localStorage: a escolha vale só até fechar o app
    }
  }

  return (
    <div className="reveal flex flex-col gap-5">
      <PageHeader
        title="Agenda"
        icon={<CalendarIcon width={20} height={20} />}
        action={
          <Button size="sm" onClick={openNew} aria-label="Novo evento">
            <PlusIcon width={16} height={16} />
          </Button>
        }
      />

      <SegmentedControl
        segments={[
          { value: 'day', label: 'Dia' },
          { value: 'week', label: 'Semana' },
        ]}
        value={view}
        onChange={(v) => setView(v as ViewMode)}
      />

      <div className="-mt-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[var(--text-primary)]">Mostrar minha rotina</p>
          <p className="text-xs text-[var(--text-tertiary)]">Os blocos de Rotina &gt; Dia a dia entram junto dos compromissos</p>
        </div>
        <Toggle checked={showRoutine} onChange={toggleRoutine} aria-label="Mostrar minha rotina na agenda" />
      </div>

      {view === 'day' ? (
        <>
          {/* faixa da semana: toque num dia pra ir até ele; o ponto marca os dias que têm compromisso */}
          <div role="group" aria-label="Dias desta semana" className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day, i) => {
              const key = toDateKey(day)
              const selected = key === dateKey
              const isToday = key === todayKey()
              const hasEvents = weekEvents.some((e) => e.date === key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${WEEKDAY_LABELS[i]}, ${formatDateShort(key)}${hasEvents ? ', com compromissos' : ''}`}
                  onClick={() => setAnchor(day)}
                  className={`press flex flex-col items-center gap-1 rounded-[var(--radius-md)] border py-2 ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--btn-shadow)]'
                      : isToday
                        ? 'border-[var(--accent)] text-[var(--text-primary)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className={`text-[11px] font-medium ${selected ? '' : 'text-[var(--text-tertiary)]'}`}>{WEEKDAY_SHORT[i]}</span>
                  <span className="text-base font-semibold leading-none">{day.getDate()}</span>
                  <span className={`h-1 w-1 rounded-full ${hasEvents ? (selected ? 'bg-[var(--accent-contrast)]' : 'bg-[var(--accent)]') : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <IconButton label="Dia anterior" onClick={() => setAnchor((d) => addDays(d, -1))}>
              <ChevronLeftIcon width={20} height={20} />
            </IconButton>
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)]">{WEEKDAY_LABELS[toWeekdayIndex(anchor)]}</p>
              <p className="font-heading text-[1.15rem] font-semibold leading-snug text-[var(--text-primary)]">{formatDateLong(dateKey)}</p>
              {dateKey !== todayKey() && (
                <button onClick={() => setAnchor(new Date())} className="press text-xs text-[var(--accent)]">
                  Voltar para hoje
                </button>
              )}
            </div>
            <IconButton label="Próximo dia" onClick={() => setAnchor((d) => addDays(d, 1))}>
              <ChevronRightIcon width={20} height={20} />
            </IconButton>
          </div>

          {/* key={dateKey}: a cada dia a lista é remontada e os cartões entram de novo, um
              depois do outro — trocar de dia ganha movimento em vez de "trocar o texto" */}
          <div key={dateKey} className="reveal flex flex-col gap-2.5">
            {dayEntries.length === 0 ? (
              <EmptyState icon={<CalendarIcon width={22} height={22} />} title="Nenhum evento neste dia" description="Adicione um compromisso pra esse dia." actionLabel="Novo evento" onAction={openNew} />
            ) : (
              dayEntries.map((entry) =>
                entry.kind === 'event' ? (
                  <Card key={entry.event.id} className="p-3.5" onClick={() => openEdit(entry.event)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">{entry.event.title}</p>
                        {entry.event.notes && <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">{entry.event.notes}</p>}
                      </div>
                      <span className="shrink-0 text-sm text-[var(--text-secondary)]">{entry.event.time ?? 'Dia inteiro'}</span>
                    </div>
                  </Card>
                ) : (
                  // bloco da rotina: linha leve (sem cartão) com a cor da categoria, pra os compromissos continuarem em destaque
                  <button key={entry.block.id} type="button" onClick={() => openBlock(entry.block)} className="press flex items-stretch gap-3 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-left">
                    <span className="w-11 shrink-0 pt-0.5 text-xs tabular-nums text-[var(--text-tertiary)]">{entry.block.start}</span>
                    <span aria-hidden="true" className="w-[3px] shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[entry.block.category] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug text-[var(--text-secondary)]">{entry.block.title}</span>
                      {entry.block.detail && <span className="block truncate text-xs leading-snug text-[var(--text-tertiary)]">{entry.block.detail}</span>}
                    </span>
                  </button>
                ),
              )
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <IconButton label="Semana anterior" onClick={() => setAnchor((d) => addDays(d, -7))}>
              <ChevronLeftIcon width={20} height={20} />
            </IconButton>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatDateShort(weekStartKey)} – {formatDateShort(weekEndKey)}
            </p>
            <IconButton label="Próxima semana" onClick={() => setAnchor((d) => addDays(d, 7))}>
              <ChevronRightIcon width={20} height={20} />
            </IconButton>
          </div>

          <div key={weekStartKey} className="reveal flex flex-col gap-4">
            {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
              const key = toDateKey(day)
              const entries = buildAgendaEntries(
                weekEvents.filter((e) => e.date === key),
                weekHighlights(blocksOf(toWeekdayIndex(day))),
              )
              return (
                <div key={key}>
                  <p className="mb-1.5 text-sm font-medium text-[var(--text-secondary)]">
                    {WEEKDAY_SHORT[toWeekdayIndex(day)]} · {formatDateShort(key)}
                    {key === todayKey() && <span className="ml-1.5 text-[var(--accent)]">· hoje</span>}
                  </p>
                  {entries.length === 0 ? (
                    <p className="pl-0.5 text-sm text-[var(--text-tertiary)]">—</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {entries.map((entry) =>
                        entry.kind === 'event' ? (
                          <Card key={entry.event.id} className="p-2.5" onClick={() => openEdit(entry.event)}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{entry.event.title}</p>
                              <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{entry.event.time ?? 'Dia inteiro'}</span>
                            </div>
                          </Card>
                        ) : (
                          <button key={entry.block.id} type="button" onClick={() => openBlock(entry.block)} className="press flex items-center gap-2.5 px-1.5 py-0.5 text-left">
                            <span aria-hidden="true" className="h-3.5 w-[3px] shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[entry.block.category] }} />
                            <span className="w-10 shrink-0 text-xs tabular-nums text-[var(--text-tertiary)]">{entry.block.start}</span>
                            <span className="min-w-0 truncate text-sm text-[var(--text-secondary)]">{entry.block.title}</span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <EventFormModal open={modalOpen} onClose={() => setModalOpen(false)} defaultDate={dateKey} editing={editing} />
      <RoutineBlockFormModal open={routineModalOpen} onClose={() => setRoutineModalOpen(false)} defaultWeekday={toWeekdayIndex(anchor) as RoutineBlock['weekday']} editing={editingBlock} />
    </div>
  )
}
