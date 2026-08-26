export const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const
export const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const
export const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Formata uma Date local pra 'AAAA-MM-DD', sem passar por UTC (evita o clássico bug de "dia errado"). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function currentMonthKey(): string {
  return toMonthKey(new Date())
}

/** 0 = segunda ... 6 = domingo (diferente do Date.getDay(), que começa no domingo). */
export function toWeekdayIndex(date: Date): number {
  const jsDay = date.getDay() // 0 = domingo
  return (jsDay + 6) % 7
}

export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -toWeekdayIndex(date))
}

export function formatDateLong(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return `${day} de ${MONTH_LABELS[month - 1]} de ${year}`
}

export function formatDateShort(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number)
  return `${pad(day)}/${pad(month)}`
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_LABELS[month - 1]} de ${year}`
}

/** Chave do "ciclo" atual de uma conta com vencimento em `dueDay` — fica igual ao mês
 * corrente enquanto o dia de hoje ainda não chegou no vencimento (então o pagamento feito
 * no vencimento anterior continua valendo), e só passa pro mês seguinte quando o dia de
 * hoje alcança/ultrapassa `dueDay`. Ex: vence dia 25, hoje é dia 28 de agosto → ciclo
 * "2026-08" (já venceu esse mês). Hoje é dia 3 de setembro → ciclo ainda é "2026-08"
 * (o vencimento de setembro só chega no dia 25). Isso faz o "pago" marcado no dia 25
 * continuar valendo até o próximo vencimento, em vez de resetar todo dia 1. */
export function currentBillCycleKey(dueDay: number, today: Date = new Date()): string {
  if (today.getDate() >= dueDay) return toMonthKey(today)
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  return toMonthKey(prevMonth)
}
