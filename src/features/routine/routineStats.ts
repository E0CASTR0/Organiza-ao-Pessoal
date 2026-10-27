import type { RoutineBlock, RoutineCategory } from '@/db/models'

/** Cor de cada categoria da rotina (bolinhas, barras e gráfico). Tons médios, que leem bem no
 * tema escuro e no claro. Sono, Rotina e Trabalho ficam neutros: não são "habilidades". */
export const CATEGORY_COLOR: Record<RoutineCategory, string> = {
  Estudo: '#6f9bf0',
  Corpo: '#e0a458',
  Comunicação: '#b392f0',
  'Vida prática': '#7fc99a',
  Fé: '#e58fa3',
  Livre: '#5fc3c8',
  Trabalho: '#8a8f98',
  Rotina: '#8a8f98',
  Sono: '#8a8f98',
}

/** Quantos minutos o bloco dura (passando da meia-noite, como o sono, conta o dia seguinte).
 * Bloco sem hora de fim (trabalho) não entra na conta. */
export function blockMinutes(block: Pick<RoutineBlock, 'start' | 'end'>): number {
  if (!block.end) return 0
  const diff = toMinutes(block.end) - toMinutes(block.start)
  return diff > 0 ? diff : diff + 24 * 60
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/** "2h30", "45min", "1h". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}min`
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, '0')}`
}

const sumMinutes = (blocks: RoutineBlock[], category: RoutineCategory) => blocks.filter((b) => b.category === category).reduce((total, b) => total + blockMinutes(b), 0)

export interface DaySummary {
  study: number
  workout: number
  free: number
  focus: RoutineBlock | null
}

export function summarizeDay(blocks: RoutineBlock[]): DaySummary {
  return { study: sumMinutes(blocks, 'Estudo'), workout: sumMinutes(blocks, 'Corpo'), free: sumMinutes(blocks, 'Livre'), focus: blocks.find((b) => b.focus) ?? null }
}

export interface WeekTotals {
  study: number
  workout: number
  faith: number
}

export function weekTotals(blocks: RoutineBlock[]): WeekTotals {
  return { study: sumMinutes(blocks, 'Estudo'), workout: sumMinutes(blocks, 'Corpo'), faith: sumMinutes(blocks, 'Fé') }
}

export interface SkillHours {
  skill: string
  category: RoutineCategory
  minutes: number
}

/** Horas da semana em cada habilidade (sem sono, trabalho e as tarefas de rotina), da maior pra menor. */
export function hoursBySkill(blocks: RoutineBlock[]): SkillHours[] {
  const bySkill = new Map<string, SkillHours>()
  for (const block of blocks) {
    if (block.category === 'Sono' || block.category === 'Trabalho' || block.category === 'Rotina') continue
    const minutes = blockMinutes(block)
    if (minutes === 0) continue
    const entry = bySkill.get(block.skill) ?? { skill: block.skill, category: block.category, minutes: 0 }
    entry.minutes += minutes
    bySkill.set(block.skill, entry)
  }
  return [...bySkill.values()].sort((a, b) => b.minutes - a.minutes)
}

export interface RoutineNow {
  current: RoutineBlock | null
  next: RoutineBlock | null
}

/** O bloco que está acontecendo agora e o próximo, olhando só os blocos de HOJE (`todayBlocks`
 * já ordenados por horário). O sono atravessa a meia-noite: de madrugada, ainda vale o "dormir" de
 * ontem — por isso quem chama passa também os blocos de ontem em `yesterdayBlocks`. */
export function findNow(todayBlocks: RoutineBlock[], yesterdayBlocks: RoutineBlock[], now: Date): RoutineNow {
  const minute = now.getHours() * 60 + now.getMinutes()

  // madrugada: o bloco de ontem que passou da meia-noite (o sono) ainda está valendo
  const overnight = yesterdayBlocks.find((b) => b.end && toMinutes(b.end) < toMinutes(b.start) && minute < toMinutes(b.end))
  if (overnight) {
    const next = todayBlocks.find((b) => toMinutes(b.start) >= minute) ?? null
    return { current: overnight, next }
  }

  let current: RoutineBlock | null = null
  for (const block of todayBlocks) {
    const start = toMinutes(block.start)
    if (start > minute) break
    // sem hora de fim (trabalho): vale até o próximo bloco começar
    const end = block.end ? (toMinutes(block.end) > start ? toMinutes(block.end) : 24 * 60) : toMinutes(nextStart(todayBlocks, block) ?? '24:00')
    if (minute < end) current = block
  }
  const next = todayBlocks.find((b) => toMinutes(b.start) > minute && b !== current) ?? null
  return { current, next }
}

function nextStart(blocks: RoutineBlock[], block: RoutineBlock): string | null {
  const index = blocks.indexOf(block)
  return blocks[index + 1]?.start ?? null
}
