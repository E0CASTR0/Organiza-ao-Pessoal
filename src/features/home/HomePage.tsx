import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { TrashIcon, CalendarIcon, ReceiptIcon, PlusIcon, MinusIcon, GripIcon, DropIcon, FlameIcon, DumbbellIcon, ChevronRightIcon, ClockIcon } from '@/components/ui/icons'
import { IconButton } from '@/components/ui/IconButton'
import { ReorderableList } from '@/components/ui/ReorderableList'
import { useRemoveWithUndo } from '@/components/ui/useRemoveWithUndo'
import { listGoals, listCompletionsByDate, addGoal, toggleGoalForDate, removeGoal, reorderGoals } from '@/db/repositories/dailyGoals.repo'
import { listEventsByDate } from '@/db/repositories/events.repo'
import { listFixedBills } from '@/db/repositories/fixedBills.repo'
import { getActiveDiet } from '@/db/repositories/diets.repo'
import { listRoutineBlocks } from '@/db/repositories/routine.repo'
import { findNow } from '@/features/routine/routineStats'
import { getGlasses, addGlasses, waterTargetGlasses, formatLiters, waterLiters } from '@/db/repositories/water.repo'
import { getSettings } from '@/db/repositories/settings.repo'
import { todayKey, formatDateHeader, capitalizeFirst, toWeekdayIndex, WEEKDAY_INITIAL } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { useNow } from '@/utils/useNow'
import { getProfile } from '@/db/repositories/profile.repo'
import { MealSlotRow } from './MealSlotRow'
import { QuickAddSheet } from './QuickAddSheet'
import { MEAL_SLOT_ORDER } from '@/utils/mealSlots'
import { loadGoalStats, loadUpcomingEvents, loadTodayWorkout, pickNextEvent, describeWhen, minutesUntil, formatCountdown } from './homeStats'

function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 5) return 'Boa madrugada'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Título de seção: frase curta, sem caixa-alta. */
function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-2.5 text-sm font-medium text-[var(--text-secondary)]">{children}</h2>
}

export function HomePage() {
  const today = todayKey()
  const now = useNow()
  const navigate = useNavigate()
  const removeRow = useRemoveWithUndo()
  const [newGoal, setNewGoal] = useState('')
  const [quickOpen, setQuickOpen] = useState(false)

  const profile = useLiveQuery(() => getProfile(), [])
  const settings = useLiveQuery(() => getSettings(), [])
  const goals = useLiveQuery(() => listGoals(), []) ?? []
  const completions = useLiveQuery(() => listCompletionsByDate(today), [today]) ?? []
  const stats = useLiveQuery(() => loadGoalStats(today), [today])
  const glasses = useLiveQuery(() => getGlasses(today), [today])
  const upcomingEvents = useLiveQuery(() => loadUpcomingEvents(new Date()), [today])
  const workout = useLiveQuery(() => loadTodayWorkout(toWeekdayIndex(new Date())), [today])
  const todayEvents = useLiveQuery(() => listEventsByDate(today), [today]) ?? []
  const bills = useLiveQuery(() => listFixedBills(), []) ?? []
  const activeDiet = useLiveQuery(() => getActiveDiet(), [])
  const routineBlocks = useLiveQuery(() => listRoutineBlocks(), [])

  // o que a rotina diz que é pra fazer agora (e o que vem depois)
  const routineNow = useMemo(() => {
    if (!routineBlocks || routineBlocks.length === 0) return null
    const index = toWeekdayIndex(now)
    return findNow(
      routineBlocks.filter((b) => b.weekday === index),
      routineBlocks.filter((b) => b.weekday === (index + 6) % 7),
      now,
    )
  }, [routineBlocks, now])

  const ready = stats !== undefined && glasses !== undefined && upcomingEvents !== undefined
  const waterGoal = waterTargetGlasses(settings)
  const nextEvent = upcomingEvents ? pickNextEvent(upcomingEvents, now) : null
  const eta = nextEvent ? minutesUntil(nextEvent, now) : null
  const isNear = eta !== null && eta <= 120

  const upcomingBills = bills.filter((bill) => {
    if (!bill.active) return false
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    const dueThisMonth = new Date(day.getFullYear(), day.getMonth(), bill.dueDay)
    // se o dia já passou nesse mês, a próxima ocorrência é no mês seguinte
    const nextOccurrence = dueThisMonth >= day ? dueThisMonth : new Date(day.getFullYear(), day.getMonth() + 1, bill.dueDay)
    const diffDays = Math.ceil((nextOccurrence.getTime() - day.getTime()) / 86_400_000)
    return diffDays >= 0 && diffDays <= 3
  })

  const handleAddGoal = async () => {
    const title = newGoal.trim()
    if (!title) return
    await addGoal(title)
    setNewGoal('')
  }

  const isGoalDone = (goalId: string) => completions.some((c) => c.goalId === goalId)
  const greetingName = profile?.nickname || profile?.displayName
  const waterRatio = Math.min(1, (glasses ?? 0) / waterGoal)

  return (
    <div className="reveal flex flex-col gap-6">
      {/* cabeçalho alinhado à esquerda: data discreta e a saudação como título */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-0.5">
          <p className="text-sm text-[var(--text-secondary)]">{capitalizeFirst(formatDateHeader(now))}</p>
          <h1 className="font-heading mt-1 text-[1.65rem] font-semibold leading-tight text-[var(--text-primary)]">
            {greetingFor(now)}
            {greetingName ? `, ${greetingName}` : ''}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            aria-label="Adicionar algo novo"
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--btn-shadow)]"
          >
            <PlusIcon width={20} height={20} />
          </button>
          <Link to="/mais/perfil" aria-label="Abrir perfil" className="press">
            <Avatar photoBase64={profile?.photoBase64} size={40} />
          </Link>
        </div>
      </header>

      {/* Resumo do dia — assimétrico: o anel das metas é a peça principal (coluna larga, 2 linhas) e
          água + próximo compromisso empilham ao lado. Esqueletos enquanto o banco responde. */}
      <section aria-label="Resumo do dia" className="grid grid-cols-[1.2fr_1fr] gap-3">
        {!ready || !stats ? (
          <>
            <Skeleton className="row-span-2 h-[15.5rem]" />
            <Skeleton className="h-[7.3rem]" />
            <Skeleton className="h-[7.3rem]" />
          </>
        ) : (
          <>
            <Card className="row-span-2 flex flex-col p-4">
              <p className="text-sm text-[var(--text-secondary)]">Metas de hoje</p>
              <div className="my-3 flex justify-center">
                <ProgressRing value={stats.today.done} total={stats.today.total}>
                  <span className="text-[2rem] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{stats.today.done}</span>
                  <span className="mt-1 text-xs text-[var(--text-tertiary)]">{stats.today.total > 0 ? `de ${stats.today.total}` : 'sem metas'}</span>
                </ProgressRing>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <FlameIcon width={16} height={16} className={stats.streak > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'} />
                {stats.streak > 0 ? `${stats.streak} ${stats.streak === 1 ? 'dia seguido' : 'dias seguidos'}` : 'Comece hoje'}
              </p>
              {/* últimos 7 dias: altura da barra = % das metas feitas naquele dia */}
              <div className="mt-3.5 flex items-end justify-between gap-1.5" role="img" aria-label={`Metas dos últimos 7 dias: ${stats.week.map((d) => `${d.done} de ${d.total}`).join(', ')}`}>
                {stats.week.map((day, index) => {
                  const ratio = day.total > 0 ? day.done / day.total : 0
                  const isToday = index === stats.week.length - 1
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-8 w-full items-end justify-center">
                        <div className="relative h-full w-[0.45rem] overflow-hidden rounded-full bg-[var(--border-default)]">
                          <div
                            className="bar-y absolute inset-x-0 bottom-0 h-full rounded-full bg-[var(--accent)]"
                            style={{ transform: `scaleY(${ratio})`, opacity: isToday ? 1 : 0.55, animationDelay: `${index * 50}ms` }}
                          />
                        </div>
                      </div>
                      <span className={`text-[10px] ${isToday ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                        {WEEKDAY_INITIAL[toWeekdayIndex(new Date(`${day.date}T12:00:00`))]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="flex flex-col p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">Água</p>
                <DropIcon width={16} height={16} className="text-[var(--accent)]" />
              </div>
              <p className="mt-1.5 leading-none">
                <span className="text-[1.7rem] font-semibold tracking-tight text-[var(--text-primary)]">{glasses}</span>
                <span className="ml-1 text-xs text-[var(--text-tertiary)]">de {waterGoal} copos</span>
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {formatLiters(glasses ?? 0, settings)} de {waterLiters(settings).toLocaleString('pt-BR')} L
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--border-default)]">
                <div className="bar-x h-full w-full rounded-full bg-[var(--accent)]" style={{ transform: `scaleX(${waterRatio})` }} />
              </div>
              <div className="mt-auto flex gap-2 pt-2.5">
                <button
                  type="button"
                  aria-label="Tirar um copo"
                  disabled={(glasses ?? 0) <= 0}
                  onClick={() => void addGlasses(today, -1)}
                  className="press flex h-9 flex-1 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] disabled:opacity-35"
                >
                  <MinusIcon width={16} height={16} />
                </button>
                <button
                  type="button"
                  aria-label="Beber um copo"
                  onClick={() => void addGlasses(today, 1)}
                  className="press flex h-9 flex-1 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)]"
                >
                  <PlusIcon width={16} height={16} />
                </button>
              </div>
            </Card>

            <Card className="flex flex-col p-3.5" onClick={() => navigate('/agenda')}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">Próximo</p>
                {isNear ? (
                  // halo que respira só quando o compromisso está a menos de 2 h
                  <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="halo absolute inset-0 rounded-full bg-[var(--accent)]" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  </span>
                ) : (
                  <CalendarIcon width={16} height={16} className="text-[var(--text-tertiary)]" />
                )}
              </div>
              {nextEvent ? (
                <>
                  <p className="mt-1.5 line-clamp-2 text-[0.95rem] font-medium leading-snug text-[var(--text-primary)]">{nextEvent.event.title}</p>
                  <p className="mt-auto pt-1.5 text-xs text-[var(--text-secondary)]">
                    {describeWhen(nextEvent, now)}
                    {eta !== null && <span className="text-[var(--accent)]"> · {formatCountdown(eta)}</span>}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1.5 text-[0.95rem] font-medium leading-snug text-[var(--text-primary)]">Nada marcado</p>
                  <p className="mt-auto pt-1.5 text-xs text-[var(--text-secondary)]">Toque pra abrir a agenda</p>
                </>
              )}
            </Card>
          </>
        )}
      </section>

      {routineNow && (routineNow.current || routineNow.next) && (
        <Link to="/rotina/dia-a-dia" className="surface surface-interactive press flex items-center gap-3 rounded-[var(--radius-md)] p-3.5">
          <span className="surface surface-raised flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent)]">
            <ClockIcon width={20} height={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-[var(--text-secondary)]">{routineNow.current ? 'Agora na sua rotina' : 'Próximo na sua rotina'}</span>
            <span className="block truncate font-medium text-[var(--text-primary)]">
              {routineNow.current ? routineNow.current.title : routineNow.next?.title}
              {!routineNow.current && routineNow.next && <span className="font-normal text-[var(--text-secondary)]"> · às {routineNow.next.start}</span>}
            </span>
            {routineNow.current && routineNow.next && (
              <span className="block truncate text-xs text-[var(--text-tertiary)]">
                Depois, às {routineNow.next.start}: {routineNow.next.title}
              </span>
            )}
          </span>
          <ChevronRightIcon width={18} height={18} className="shrink-0 text-[var(--text-tertiary)]" />
        </Link>
      )}

      {workout && (
        <Link to="/rotina/treino" className="surface surface-interactive press flex items-center gap-3 rounded-[var(--radius-md)] p-3.5">
          <span className="surface surface-raised flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent)]">
            <DumbbellIcon width={20} height={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-[var(--text-secondary)]">Treino de hoje</span>
            <span className="block truncate font-medium text-[var(--text-primary)]">
              {workout.rest ? 'Dia de descanso' : workout.label}
              {!workout.rest && workout.exercises > 0 && (
                <span className="font-normal text-[var(--text-secondary)]">
                  {' '}
                  · {workout.exercises} {workout.exercises === 1 ? 'exercício' : 'exercícios'}
                </span>
              )}
            </span>
          </span>
          <ChevronRightIcon width={18} height={18} className="shrink-0 text-[var(--text-tertiary)]" />
        </Link>
      )}

      <section>
        <SectionTitle>Metas de hoje</SectionTitle>
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            {goals.length === 0 && <p className="empty-fade text-sm text-[var(--text-tertiary)]">Nenhuma meta ainda. Escreva a primeira abaixo.</p>}
            {goals.length > 0 && (
              <ReorderableList
                items={goals}
                rowHeight={46}
                gapClass="gap-0.5"
                onReorder={(ids) => void reorderGoals(ids)}
                renderItem={(goal, dragHandle, dragging) => (
                  // linha de 44 px (o mínimo confortável pro dedo): o Checkbox ocupa a altura toda
                  // e a lixeira/alça têm área de toque ampliada (IconButton). O vão de 24 px entre
                  // os dois ícones evita que as áreas de toque se sobreponham.
                  <div className={`flex min-h-11 items-center justify-between gap-2 rounded-[var(--radius-sm)] ${dragging ? 'bg-[var(--bg-elevated-2)] shadow-[0_6px_18px_var(--shadow)]' : ''}`}>
                    <Checkbox className="min-w-0 self-stretch" checked={isGoalDone(goal.id)} onChange={() => void toggleGoalForDate(goal.id, today)} label={goal.title} />
                    <div className="flex shrink-0 items-center gap-6">
                      <IconButton
                        label="Remover meta"
                        tone="danger"
                        onClick={(e) => void removeRow(e.currentTarget, { message: 'Meta removida', entityType: 'dailyGoals', entityId: goal.id, remove: () => removeGoal(goal.id) })}
                      >
                        <TrashIcon width={16} height={16} />
                      </IconButton>
                      <span {...dragHandle} aria-label="Reordenar meta (arraste ou use as setas)" className="-m-3 touch-none p-3 text-[var(--text-tertiary)]">
                        <GripIcon width={18} height={18} />
                      </span>
                    </div>
                  </div>
                )}
              />
            )}
            <form
              className="mt-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void handleAddGoal()
              }}
            >
              <TextField value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Nova meta (repete todo dia)" aria-label="Nova meta" className="flex-1" />
              <Button type="submit" size="md" aria-label="Adicionar meta">
                <PlusIcon width={18} height={18} />
              </Button>
            </form>
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle>Alimentação</SectionTitle>
        {!activeDiet ? (
          <EmptyState
            icon={<DumbbellIcon width={22} height={22} />}
            title="Nenhuma dieta ativa"
            description="Crie e ative uma dieta pra acompanhar suas refeições aqui."
            actionLabel="Ir pra Dieta"
            onAction={() => navigate('/rotina/dieta')}
          />
        ) : activeDiet.enabledMeals.length === 0 ? (
          <EmptyState title="Nenhuma refeição configurada" description={`Edite "${activeDiet.title}" em Rotina > Dieta e escolha quais refeições aparecem aqui.`} />
        ) : (
          <Card className="flex flex-col gap-4 p-4">
            {activeDiet.enabledMeals
              .slice()
              .sort((a, b) => MEAL_SLOT_ORDER.indexOf(a) - MEAL_SLOT_ORDER.indexOf(b))
              .map((meal) => (
                <MealSlotRow key={meal} dietId={activeDiet.id} meal={meal} />
              ))}
          </Card>
        )}
      </section>

      <section>
        <SectionTitle>Hoje na agenda</SectionTitle>
        {todayEvents.length === 0 && upcomingBills.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon width={22} height={22} />}
            title="Nada agendado por aqui"
            description="Eventos da agenda e contas perto do vencimento aparecem aqui."
            actionLabel="Novo evento"
            onAction={() => setQuickOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayEvents.map((event) => (
              <Card key={event.id} className="item-in flex items-center gap-3 p-3.5">
                <span className="surface surface-raised flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent)]">
                  <CalendarIcon width={18} height={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{event.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{event.time ?? 'Dia inteiro'}</p>
                </div>
              </Card>
            ))}
            {upcomingBills.map((bill) => (
              <Card key={bill.id} className="item-in flex items-center gap-3 p-3.5">
                <span className="surface surface-raised flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] text-[var(--accent)]">
                  {bill.imageBase64 ? <img src={bill.imageBase64} alt="" width={36} height={36} decoding="async" className="h-full w-full object-cover" /> : <ReceiptIcon width={18} height={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-primary)]">{bill.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Vence dia {bill.dueDay}</p>
                </div>
                <p className="shrink-0 text-sm text-[var(--text-secondary)]">{formatCurrency(bill.value)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <QuickAddSheet open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  )
}
