import { db } from '@/db/db'
import type { NotificationPrefs } from '@/db/models'
import { loadGoalStats } from '@/features/home/homeStats'
import { getGlasses, waterTargetGlasses } from '@/db/repositories/water.repo'
import { addDays, currentBillCycleKey, toDateKey } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'

export interface Reminder {
  /** Identificador único do aviso (inclui o dia) — garante que ele não se repita. */
  key: string
  title: string
  body: string
}

export const DEFAULT_PREFS: NotificationPrefs = { enabled: false, events: true, bills: true, goals: true, water: true }

const SENT_STORAGE_KEY = 'reminders-sent:v1'
const KEEP_MS = 3 * 24 * 3600 * 1000

function readSent(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SENT_STORAGE_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function markSent(keys: string[]): void {
  try {
    const sent = readSent()
    const now = Date.now()
    for (const key of keys) sent[key] = now
    for (const [key, time] of Object.entries(sent)) if (now - time > KEEP_MS) delete sent[key]
    localStorage.setItem(SENT_STORAGE_KEY, JSON.stringify(sent))
  } catch {
    // sem localStorage: no pior caso o aviso pode repetir, nada grave
  }
}

/** Escolhe uma frase do grupo variando de dia pra dia, pra não ser sempre a mesma mensagem. O `salt`
 * desencontra os tipos de aviso entre si (assim dois avisos do mesmo dia não usam o mesmo "número"). */
export function pick<T>(pool: T[], now: Date, salt: number): T {
  const dayNumber = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86_400_000)
  return pool[(dayNumber + salt) % pool.length]
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** "2 h 30 min", "45 min", "1 h". */
function duration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, minutes)} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** Encurta nomes compridos pra caberem no aviso. */
function clip(text: string, max = 40): string {
  const clean = text.trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

/** "A", "A e B", "A, B e mais 1" — nunca "A e B e mais 1". */
function listNames(names: string[], max = 2): string {
  const shown = names.slice(0, max).map((name) => clip(name))
  if (names.length <= max) return shown.length > 1 ? `${shown.slice(0, -1).join(', ')} e ${shown[shown.length - 1]}` : (shown[0] ?? '')
  return `${shown.join(', ')} e mais ${names.length - max}`
}

/** Junta título e texto num aviso só (o aviso dentro do app é uma linha) sem pontuação dobrada:
 * "Já bebeu água hoje? A meta…", "Dia fechado. Amanhã tem mais." */
export function reminderText({ title, body }: Pick<Reminder, 'title' | 'body'>): string {
  const head = title.trim()
  const closed = /[.!?…:]$/.test(head) ? head : `${head}.`
  return body ? `${closed} ${body}` : closed
}

function atHour(now: Date, hour: number): boolean {
  return now.getHours() >= hour
}

const daysIn = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

/** O dia do vencimento vale também em mês curto (dia 31 em abril vence dia 30). */
const dueOn = (dueDay: number, date: Date) => Math.min(dueDay, daysIn(date)) === date.getDate()

/** Frase do aviso de compromisso conforme falta pouco ou muito, pra nunca dizer "já já" com 3 h de folga. */
function eventTitle(title: string, minutes: number, now: Date): string {
  const name = clip(title)
  const left = duration(minutes)
  if (minutes <= 15) return pick([`${name} começa daqui a pouco`, `Já já: ${name}`, `Quase na hora: ${name}`], now, 1)
  if (minutes <= 60) return pick([`${name} começa em ${left}`, `Prepare-se: ${name} em ${left}`, `Daqui a ${left}: ${name}`], now, 1)
  return pick([`${name} começa em ${left}`, `Daqui a ${left}: ${name}`, `Se organize: ${name} em ${left}`], now, 1)
}

/** Calcula quais avisos estão "na hora" agora e ainda não foram enviados. Só devolve o mais recente
 * de cada tipo de janela (se o app ficou fechado o dia todo, não despeja 3 avisos de metas
 * de uma vez — o resto é marcado como visto). */
export async function collectReminders(now: Date, prefs: NotificationPrefs): Promise<{ due: Reminder[]; skipped: string[] }> {
  const sent = readSent()
  const due: Reminder[] = []
  const skipped: string[] = []
  const today = toDateKey(now)
  const tomorrow = toDateKey(addDays(now, 1))
  const fresh = (key: string) => !(key in sent)

  // ---- compromissos: de 3 h antes até a hora (nunca de madrugada); e, à noite, os de amanhã cedo ----
  if (prefs.events) {
    const events = await db.events.where('date').anyOf([today, tomorrow]).toArray()
    for (const event of events) {
      if (event.date === today && event.time) {
        const start = new Date(`${event.date}T${event.time}:00`)
        const minutes = Math.round((start.getTime() - now.getTime()) / 60_000)
        const key = `ev:${event.id}:${event.date}`
        if (minutes > 0 && minutes <= 180 && atHour(now, 6) && fresh(key)) {
          due.push({ key, title: eventTitle(event.title, minutes, now), body: `Hoje às ${event.time}.${event.notes ? ` ${event.notes}` : ''}` })
        }
      } else if (event.date === today && !event.time) {
        const key = `evd:${event.id}:${event.date}`
        if (atHour(now, 8) && fresh(key)) due.push({ key, title: clip(event.title), body: 'Compromisso de hoje, o dia inteiro.' })
      } else if (event.date === tomorrow && event.time && Number(event.time.slice(0, 2)) < 9) {
        const key = `evn:${event.id}:${event.date}`
        if (atHour(now, 20) && fresh(key)) {
          due.push({ key, title: `Amanhã cedo: ${clip(event.title)}`, body: `Às ${event.time}. Deixe tudo pronto hoje.` })
        }
      }
    }
  }

  // ---- contas: no dia e na véspera (só as que ainda não foram pagas no ciclo) ----
  if (prefs.bills) {
    const [bills, payments] = await Promise.all([db.fixedBills.toArray(), db.fixedBillPayments.toArray()])
    const tomorrowDate = addDays(now, 1)
    for (const bill of bills.filter((b) => b.active)) {
      const dueToday = dueOn(bill.dueDay, now)
      const dueTomorrow = dueOn(bill.dueDay, tomorrowDate)
      const paid = payments.some((p) => p.fixedBillId === bill.id && p.month === currentBillCycleKey(bill.dueDay, now) && p.paidAt)
      const value = formatCurrency(bill.value)
      const name = clip(bill.name)
      if (dueToday && !paid && atHour(now, 8) && fresh(`bill:${bill.id}:${today}`)) {
        due.push({
          key: `bill:${bill.id}:${today}`,
          title: pick([`Conta vence hoje: ${name}`, `Hoje é dia de pagar ${name}`, `Não esqueça: ${name} vence hoje`], now, 2),
          body: `${value}. Depois de pagar, marque como paga em Contas Fixas.`,
        })
      } else if (dueTomorrow && !dueToday && atHour(now, 18) && fresh(`bill1:${bill.id}:${today}`)) {
        due.push({ key: `bill1:${bill.id}:${today}`, title: pick([`Amanhã vence: ${name}`, `${name} vence amanhã`], now, 0), body: `Valor: ${value}.` })
      }
    }
  }

  // ---- metas: uma cutucada à tarde, uma no fim do dia, uma "última chamada" à noite ----
  if (prefs.goals) {
    const stats = await loadGoalStats(today)
    const goals = await db.dailyGoals.orderBy('order').toArray()
    const doneIds = new Set((await db.dailyGoalCompletions.where('date').equals(today).toArray()).map((c) => c.goalId))
    const missing = goals.filter((g) => !doneIds.has(g.id)).map((g) => g.title)
    const n = missing.length
    const names = listNames(missing)
    const metas = plural(n, 'meta', 'metas')
    const slots: Reminder[] = []
    if (stats.today.total > 0) {
      if (stats.today.done === 0 && atHour(now, 13) && !atHour(now, 17)) {
        slots.push({
          key: `g13:${today}`,
          title: pick(['Suas metas de hoje ainda não começaram', 'Que tal fechar uma meta agora?', 'Metas do dia esperando por você'], now, 3),
          body: n === 1 ? `Hoje é só esta: ${names}.` : `São ${n} metas hoje. Comece por: ${clip(missing[0])}.`,
        })
      }
      if (n > 0 && atHour(now, 18) && !atHour(now, 21)) {
        slots.push({
          key: `g18:${today}`,
          title: pick([`${plural(n, 'Falta', 'Faltam')} ${n} ${metas} pra bater hoje`, `Ainda dá tempo: ${n} ${metas}`, `Quase lá: ${n} ${metas} pra fechar o dia`], now, 4),
          body: `${names}.`,
        })
      }
      if (n > 0 && atHour(now, 21)) {
        slots.push({
          key: `g21:${today}`,
          title: pick(['Reta final do dia', 'Última chamada das metas', 'Antes de dormir, uma conferida'], now, 5),
          body: `${plural(n, 'Falta', 'Faltam')} ${n} ${metas}: ${names}.`,
        })
      }
      if (n === 0 && atHour(now, 20)) {
        slots.push({
          key: `gdone:${today}`,
          title: pick(['Todas as metas de hoje feitas', 'Dia fechado', 'Bom trabalho hoje'], now, 6),
          body: stats.streak > 1 ? `${stats.streak} dias seguidos. Continue assim.` : 'Amanhã tem mais.',
        })
      }
    }
    const pending = slots.filter((s) => fresh(s.key))
    if (pending.length > 0) {
      due.push(pending[pending.length - 1])
      skipped.push(...pending.slice(0, -1).map((s) => s.key))
    }
  }

  // ---- água ----
  if (prefs.water) {
    const settings = await db.settings.get('settings')
    const target = waterTargetGlasses(settings)
    const glasses = await getGlasses(today)
    const copos = (count: number) => `${count} ${plural(count, 'copo', 'copos')}`
    const left = Math.max(0, target - glasses)
    const slots: Reminder[] = []
    if (glasses === 0 && atHour(now, 11) && !atHour(now, 15)) {
      slots.push({ key: `w11:${today}`, title: pick(['Já bebeu água hoje?', 'Hora do primeiro copo d’água', 'Água: ainda zerado hoje'], now, 7), body: `A meta de hoje é de ${copos(target)}.` })
    }
    if (glasses < target * 0.4 && atHour(now, 15) && !atHour(now, 19)) {
      slots.push({
        key: `w15:${today}`,
        title: pick(['Metade do dia e pouca água', 'Beba um copo agora', 'Lembrete de água'], now, 8),
        body: glasses === 0 ? `Nenhum copo ainda. A meta é de ${copos(target)}.` : `Você bebeu ${glasses} de ${copos(target)}.`,
      })
    }
    if (glasses < target * 0.8 && atHour(now, 19)) {
      slots.push({
        key: `w19:${today}`,
        title: pick(['Falta água pra fechar o dia', 'Ainda dá tempo de bater a água', 'Água: reta final'], now, 9),
        body: `${glasses} de ${copos(target)}. ${plural(left, 'Falta', 'Faltam')} ${copos(left)}.`,
      })
    }
    const pending = slots.filter((s) => fresh(s.key))
    if (pending.length > 0) {
      due.push(pending[pending.length - 1])
      skipped.push(...pending.slice(0, -1).map((s) => s.key))
    }
  }

  return { due, skipped }
}
