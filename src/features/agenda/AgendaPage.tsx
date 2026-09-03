import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
    <div className="flex flex-col gap-5">
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
          <div className="flex items-center justify-between">
            <button onClick={() => setAnchor((d) => addDays(d, -1))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Dia anterior">
              <ChevronLeftIcon width={20} height={20} />
            </button>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{WEEKDAY_LABELS[toWeekdayIndex(anchor)]}</p>
              <p className="font-medium text-[var(--text-primary)]">{formatDateLong(dateKey)}</p>
              {dateKey !== todayKey() && (
                <button onClick={() => setAnchor(new Date())} className="text-xs text-[var(--accent)]">
                  Voltar para hoje
                </button>
              )}
            </div>
            <button onClick={() => setAnchor((d) => addDays(d, 1))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Próximo dia">
              <ChevronRightIcon width={20} height={20} />
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <EmptyState title="Nenhum evento neste dia" description="Toque no + para adicionar um compromisso." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {dayEvents.map((event) => (
                <Card key={event.id} className="cursor-pointer p-3.5" onClick={() => openEdit(event)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)]">{event.title}</p>
                      {event.notes && <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">{event.notes}</p>}
                    </div>
                    <span className="shrink-0 text-sm text-[var(--text-secondary)]">{event.time ?? 'Dia inteiro'}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setAnchor((d) => addDays(d, -7))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Semana anterior">
              <ChevronLeftIcon width={20} height={20} />
            </button>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatDateShort(weekStartKey)} – {formatDateShort(weekEndKey)}
            </p>
            <button onClick={() => setAnchor((d) => addDays(d, 7))} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Próxima semana">
              <ChevronRightIcon width={20} height={20} />
            </button>
          </div>

          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
            const key = toDateKey(day)
            const events = weekEvents.filter((e) => e.date === key)
            return (
              <div key={key}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  {WEEKDAY_SHORT[toWeekdayIndex(day)]} · {formatDateShort(key)}
                  {key === todayKey() && <span className="ml-1.5 text-[var(--accent)]">· hoje</span>}
                </p>
                {events.length === 0 ? (
                  <p className="pl-0.5 text-sm text-[var(--text-tertiary)]">—</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {events.map((event) => (
                      <Card key={event.id} className="cursor-pointer p-2.5" onClick={() => openEdit(event)}>
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
      )}

      <EventFormModal open={modalOpen} onClose={() => setModalOpen(false)} defaultDate={dateKey} editing={editing} />
    </div>
  )
}
