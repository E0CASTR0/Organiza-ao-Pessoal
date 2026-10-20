import { db } from '@/db/db'
import type { EventItem } from '@/db/models'
import { addDays, toDateKey, toWeekdayIndex, WEEKDAY_SHORT } from '@/utils/date'

export interface DayRate {
  date: string
  done: number
  total: number
}

export interface GoalStats {
  today: DayRate
  /** Os últimos 7 dias, do mais antigo (há 6 dias) até hoje. */
  week: DayRate[]
  /** Dias seguidos com TODAS as metas feitas (hoje conta se já estiver completo; se ainda não
   * está, a sequência de ontem continua valendo — o dia só "quebra" a sequência quando acaba). */
  streak: number
}

const MAX_STREAK_LOOKBACK = 365

/** Estatísticas das metas diárias, calculadas das conclusões gravadas. Em cada dia só entram as
 * metas que já existiam naquele dia (data de criação), então criar uma meta nova hoje não
 * "estraga" a sequência dos dias antigos. */
export async function loadGoalStats(todayKey: string): Promise<GoalStats> {
  const [goals, completions] = await Promise.all([db.dailyGoals.toArray(), db.dailyGoalCompletions.toArray()])

  const doneByDate = new Map<string, Set<string>>()
  for (const completion of completions) {
    const set = doneByDate.get(completion.date) ?? new Set<string>()
    set.add(completion.goalId)
    doneByDate.set(completion.date, set)
  }
  const goalsWithDay = goals.map((goal) => ({ id: goal.id, createdDay: toDateKey(new Date(goal.createdAt)) }))

  const rateFor = (date: string): DayRate => {
    const active = goalsWithDay.filter((goal) => goal.createdDay <= date)
    const doneSet = doneByDate.get(date)
    const done = doneSet ? active.filter((goal) => doneSet.has(goal.id)).length : 0
    return { date, done, total: active.length }
  }
  const isComplete = (rate: DayRate) => rate.total > 0 && rate.done >= rate.total

  const todayDate = new Date(`${todayKey}T12:00:00`)
  const week: DayRate[] = []
  for (let i = 6; i >= 0; i--) week.push(rateFor(toDateKey(addDays(todayDate, -i))))
  const today = week[week.length - 1]

  let streak = 0
  let cursor = isComplete(today) ? 0 : 1 // hoje ainda aberto: começa a contar de ontem
  for (; cursor < MAX_STREAK_LOOKBACK; cursor++) {
    if (!isComplete(rateFor(toDateKey(addDays(todayDate, -cursor))))) break
    streak++
  }

  return { today, week, streak }
}

export interface UpcomingEvent {
  event: EventItem
  /** Momento de início (eventos de dia inteiro contam como terminando às 23:59). */
  at: Date
}

/** O próximo compromisso a partir de `now` (nos próximos 30 dias), ou null. */
export async function loadUpcomingEvents(now: Date): Promise<EventItem[]> {
  const start = toDateKey(now)
  const end = toDateKey(addDays(now, 30))
  const events = await db.events.where('date').between(start, end, true, true).toArray()
  return events.sort((a, b) => (a.date + (a.time ?? '99:99')).localeCompare(b.date + (b.time ?? '99:99')))
}

export function pickNextEvent(events: EventItem[], now: Date): UpcomingEvent | null {
  for (const event of events) {
    const at = new Date(`${event.date}T${event.time ?? '23:59'}:00`)
    if (at.getTime() >= now.getTime()) return { event, at }
  }
  return null
}

/** "hoje às 15:00", "amanhã às 06:30", "sex, 23/10 às 06:30" (dia inteiro: sem a hora). */
export function describeWhen(upcoming: UpcomingEvent, now: Date): string {
  const { event, at } = upcoming
  const todayKey = toDateKey(now)
  const tomorrowKey = toDateKey(addDays(now, 1))
  const time = event.time ? ` às ${event.time}` : ''
  if (event.date === todayKey) return event.time ? `hoje${time}` : 'hoje · dia inteiro'
  if (event.date === tomorrowKey) return event.time ? `amanhã${time}` : 'amanhã · dia inteiro'
  const [, month, day] = event.date.split('-')
  return `${WEEKDAY_SHORT[toWeekdayIndex(at)].toLowerCase()}, ${day}/${month}${time}`
}

/** Minutos até o início (só pra evento com hora, no mesmo dia); senão null. */
export function minutesUntil(upcoming: UpcomingEvent, now: Date): number | null {
  if (!upcoming.event.time || upcoming.event.date !== toDateKey(now)) return null
  return Math.max(0, Math.round((upcoming.at.getTime() - now.getTime()) / 60_000))
}

export function formatCountdown(minutes: number): string {
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `em ${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `em ${hours} h` : `em ${hours} h ${rest} min`
}

export async function loadTodayWorkout(weekday: number): Promise<{ label: string; exercises: number; rest: boolean } | null> {
  const day = (await db.workoutDays.where('weekday').equals(weekday).toArray())[0]
  if (!day) return null
  const exercises = await db.exercises.where('workoutDayId').equals(day.id).count()
  return { label: day.label, exercises, rest: /descanso/i.test(day.label) && exercises === 0 }
}
