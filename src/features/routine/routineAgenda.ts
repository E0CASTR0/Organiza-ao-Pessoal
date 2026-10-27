import type { EventItem, RoutineBlock } from '@/db/models'

export type AgendaEntry = { kind: 'event'; sortTime: string; event: EventItem } | { kind: 'routine'; sortTime: string; block: RoutineBlock }

const normalize = (text: string) => text.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '')

/** O compromisso já "é" o bloco da rotina quando começa na mesma hora e o nome de um contém o do
 * outro (ex: o evento "Treino de Futevôlei" às 06:30 e o bloco "Futevôlei" às 06:30). Nesse caso
 * só o compromisso aparece, pra não repetir a mesma coisa duas vezes. */
function sameThing(event: EventItem, block: RoutineBlock): boolean {
  if (event.time !== block.start) return false
  const eventName = normalize(event.title)
  return [block.title, block.skill].some((name) => {
    const blockName = normalize(name)
    return blockName.length > 2 && (eventName.includes(blockName) || blockName.includes(eventName))
  })
}

/** Junta os compromissos de um dia com os blocos da rotina do mesmo dia da semana, na ordem do
 * relógio (dia inteiro primeiro; na mesma hora, o compromisso vem antes do bloco). */
export function buildAgendaEntries(events: EventItem[], blocks: RoutineBlock[]): AgendaEntry[] {
  const entries: AgendaEntry[] = [
    ...events.map((event): AgendaEntry => ({ kind: 'event', sortTime: event.time ?? '', event })),
    ...blocks.filter((block) => !events.some((event) => sameThing(event, block))).map((block): AgendaEntry => ({ kind: 'routine', sortTime: block.start, block })),
  ]
  return entries.sort((a, b) => a.sortTime.localeCompare(b.sortTime) || (a.kind === b.kind ? 0 : a.kind === 'event' ? -1 : 1))
}

/** Na visão da semana a rotina entra resumida: sem sono, tempo livre e tarefas de rotina (acordar, banho…). */
export function weekHighlights(blocks: RoutineBlock[]): RoutineBlock[] {
  return blocks.filter((block) => block.category !== 'Sono' && block.category !== 'Livre' && block.category !== 'Rotina')
}
