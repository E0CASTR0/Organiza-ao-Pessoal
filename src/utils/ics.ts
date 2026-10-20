import { db } from '@/db/db'
import { addDays, currentBillCycleKey, toDateKey } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { pick } from '@/utils/reminders'

/** Arquivo .ics (agenda do iPhone) com os compromissos, as contas e, se quiser, um lembrete diário
 * das metas — cada um com um alarme. É o jeito de o iPhone avisar com o app FECHADO sem precisar
 * de servidor: o Calendário dispara os alarmes sozinho.
 *
 * Os identificadores (UID) são fixos por item: importar de novo ATUALIZA o que já está no
 * Calendário em vez de duplicar. (Itens apagados do app continuam no Calendário até você apagar.) */

const CRLF = '\r\n'

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Linhas do .ics não passam de 75 bytes: as maiores são "dobradas" com um espaço no começo da seguinte. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const char of line) {
    const charSize = new TextEncoder().encode(char).length
    if (size + charSize > (parts.length === 0 ? 75 : 74)) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += char
    size += charSize
  }
  parts.push(current)
  return parts.join(`${CRLF} `)
}

const compactDate = (key: string) => key.replace(/-/g, '')
const compactTime = (time: string) => `${time.replace(':', '')}00`

function stamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

interface Alarm {
  trigger: string
  text: string
}

function vevent(lines: { uid: string; start: string; end: string; allDay?: boolean; summary: string; description?: string; alarms: Alarm[]; transparent?: boolean }, now: Date): string[] {
  const out = ['BEGIN:VEVENT', `UID:${lines.uid}@organizacao-pessoal`, `DTSTAMP:${stamp(now)}`]
  out.push(lines.allDay ? `DTSTART;VALUE=DATE:${lines.start}` : `DTSTART:${lines.start}`)
  out.push(lines.allDay ? `DTEND;VALUE=DATE:${lines.end}` : `DTEND:${lines.end}`)
  out.push(`SUMMARY:${escapeText(lines.summary)}`)
  if (lines.description) out.push(`DESCRIPTION:${escapeText(lines.description)}`)
  if (lines.transparent) out.push('TRANSP:TRANSPARENT')
  for (const alarm of lines.alarms) {
    out.push('BEGIN:VALARM', `TRIGGER:${alarm.trigger}`, 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(alarm.text)}`, 'END:VALARM')
  }
  out.push('END:VEVENT')
  return out
}

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const total = Math.min(23 * 60 + 59, h * 60 + m + 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export interface CalendarOptions {
  includeDailyReminder: boolean
}

/** Monta o texto do .ics com tudo que vem pela frente (compromissos: 30 dias; contas: 60 dias). */
export async function buildCalendar(options: CalendarOptions, now = new Date()): Promise<{ text: string; counts: { events: number; bills: number; daily: number } }> {
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Organizacao Pessoal//PT-BR//', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  const counts = { events: 0, bills: 0, daily: 0 }
  const todayKey = toDateKey(now)

  // compromissos: alarme 2 h antes (e 15 min antes). Dia inteiro: alarme às 8h do próprio dia.
  const events = await db.events.where('date').between(todayKey, toDateKey(addDays(now, 30)), true, true).toArray()
  for (const event of events) {
    const next = toDateKey(addDays(new Date(`${event.date}T12:00:00`), 1))
    if (event.time) {
      lines.push(
        ...vevent(
          {
            uid: `evt-${event.id}`,
            start: `${compactDate(event.date)}T${compactTime(event.time)}`,
            end: `${compactDate(event.date)}T${compactTime(addHour(event.time))}`,
            summary: event.title,
            description: event.notes,
            alarms: [
              { trigger: '-PT2H', text: `${event.title} começa em 2 horas (${event.time})` },
              { trigger: '-PT15M', text: `${event.title} começa em 15 minutos` },
            ],
          },
          now,
        ),
      )
    } else {
      lines.push(
        ...vevent(
          { uid: `evt-${event.id}`, start: compactDate(event.date), end: compactDate(next), allDay: true, summary: event.title, description: event.notes, alarms: [{ trigger: 'PT8H', text: `Hoje: ${event.title}` }] },
          now,
        ),
      )
    }
    counts.events++
  }

  // contas: um evento às 9h de cada vencimento dos próximos 60 dias, avisando na véspera e na hora
  const [bills, payments] = await Promise.all([db.fixedBills.toArray(), db.fixedBillPayments.toArray()])
  for (const bill of bills.filter((b) => b.active)) {
    for (let offset = 0; offset < 3; offset++) {
      const month = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      const day = Math.min(bill.dueDay, new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate())
      const due = new Date(month.getFullYear(), month.getMonth(), day)
      const dueKey = toDateKey(due)
      if (dueKey < todayKey || dueKey > toDateKey(addDays(now, 60))) continue
      // vence hoje e já está paga neste ciclo: não avisa de novo
      const paidNow = payments.some((p) => p.fixedBillId === bill.id && p.month === currentBillCycleKey(bill.dueDay, now) && p.paidAt)
      if (dueKey === todayKey && paidNow) continue
      lines.push(
        ...vevent(
          {
            uid: `conta-${bill.id}-${dueKey}`,
            start: `${compactDate(dueKey)}T090000`,
            end: `${compactDate(dueKey)}T093000`,
            summary: `Pagar ${bill.name} (${formatCurrency(bill.value)})`,
            description: `Conta fixa com vencimento no dia ${bill.dueDay}.`,
            alarms: [
              { trigger: '-P1D', text: `Amanhã vence: ${bill.name} (${formatCurrency(bill.value)})` },
              { trigger: 'PT0S', text: `Hoje vence: ${bill.name} (${formatCurrency(bill.value)})` },
            ],
          },
          now,
        ),
      )
      counts.bills++
    }
  }

  // lembrete diário (opcional): um por noite, 20h30, com frase diferente a cada dia
  if (options.includeDailyReminder) {
    const nightly = [
      ['Metas do dia: falta fechar alguma?', 'Abra o app e confira as metas e a água de hoje.'],
      ['Última conferida do dia', 'Metas feitas? Água em dia? Dá tempo de ajustar.'],
      ['Reta final: metas e água', 'Veja o que falta pra bater o dia.'],
      ['Fechando o dia', 'Confira as metas antes de dormir.'],
    ]
    for (let i = 0; i < 14; i++) {
      const day = addDays(now, i)
      const key = toDateKey(day)
      const [summary, text] = pick(nightly, day, 0)
      lines.push(
        ...vevent(
          { uid: `diario-${key}`, start: `${compactDate(key)}T203000`, end: `${compactDate(key)}T204000`, summary, description: text, transparent: true, alarms: [{ trigger: 'PT0S', text }] },
          now,
        ),
      )
      counts.daily++
    }
  }

  lines.push('END:VCALENDAR')
  return { text: lines.map(fold).join(CRLF) + CRLF, counts }
}

/** Entrega o .ics pro iPhone: pela folha de compartilhar (onde aparece "Calendário"); se não der,
 * baixa o arquivo. Devolve como foi. */
export async function shareCalendar(text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([text], 'lembretes-organizacao-pessoal.ics', { type: 'text/calendar' })
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Lembretes do app' })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'downloaded'
}
