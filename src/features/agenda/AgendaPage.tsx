import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarIcon } from '@/components/ui/icons'
import { listEventsByDate, listEventsBetween } from '@/db/repositories/events.repo'
import { todayKey, toDateKey, addDays, startOfWeek, formatDateLong, formatDateShort, WEEKDAY_LABELS, WEEKDAY_SHORT, toWeekdayIndex } from '@/utils/date'
import { EventFormModal } from './EventFormModal'
import type { EventItem } from '@/db/models'

type ViewMode = 'day' | 'week'

export function AgendaPage() {
  const [view, setView] = useState<ViewMode>('day')
  const [anchor, setAnchor] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EventItem | null>(null)

  const dateKey = toDateKey(anchor)
  const dayEvents = useLiveQuery(() => listEventsByDate(dateKey), [dateKey]) ?? []

  const weekStart = startOfWeek(anchor)
  const weekStartKey = toDateKey(weekStart)
  const weekEndKey = toDateKey(addDays(weekStart, 6))
  const weekEvents = useLiveQuery(() => listEventsBetween(weekStartKey, weekEndKey), [weekStartKey, weekEndKey]) ?? []

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (event: EventItem) => {
    setEditing(event)
    setModalOpen(true)
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
            {dayEvents.length === 0 ? (
              <EmptyState icon={<CalendarIcon width={22} height={22} />} title="Nenhum evento neste dia" description="Adicione um compromisso pra esse dia." actionLabel="Novo evento" onAction={openNew} />
            ) : (
              dayEvents.map((event) => (
                <Card key={event.id} className="p-3.5" onClick={() => openEdit(event)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)]">{event.title}</p>
                      {event.notes && <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">{event.notes}</p>}
                    </div>
                    <span className="shrink-0 text-sm text-[var(--text-secondary)]">{event.time ?? 'Dia inteiro'}</span>
                  </div>
                </Card>
              ))
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
              const events = weekEvents.filter((e) => e.date === key)
              return (
                <div key={key}>
                  <p className="mb-1.5 text-sm font-medium text-[var(--text-secondary)]">
                    {WEEKDAY_SHORT[toWeekdayIndex(day)]} · {formatDateShort(key)}
                    {key === todayKey() && <span className="ml-1.5 text-[var(--accent)]">· hoje</span>}
                  </p>
                  {events.length === 0 ? (
                    <p className="pl-0.5 text-sm text-[var(--text-tertiary)]">—</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {events.map((event) => (
                        <Card key={event.id} className="p-2.5" onClick={() => openEdit(event)}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{event.title}</p>
                            <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{event.time ?? 'Dia inteiro'}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <EventFormModal open={modalOpen} onClose={() => setModalOpen(false)} defaultDate={dateKey} editing={editing} />
    </div>
  )
}
