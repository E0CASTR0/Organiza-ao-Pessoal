import type { RoutineBlock, RoutineCategory } from './models'

/** A rotina semanal que o Rômulo montou ("Minha rotina"): acordar 05:30, dormir 21:45.
 * Entra no banco UMA vez (flag `routineSeeded` em Configurações); depois disso os blocos são dele
 * pra editar, e o que ele apagar vai pra Lixeira. Cada linha:
 * [início, fim, atividade, habilidade, categoria, detalhe, foco-do-dia?] */
type Row = [start: string, end: string, title: string, skill: string, category: RoutineCategory, detail: string, focus?: true]

const MORNING: Row[] = [
  ['05:30', '05:35', 'Acordar + água', 'Rotina', 'Rotina', ''],
  ['05:35', '05:45', 'Oração da manhã', 'Oração', 'Fé', ''],
  ['05:45', '06:15', 'Inglês', 'Inglês', 'Estudo', 'Duolingo'],
]

const NIGHT: Row[] = [
  ['19:00', '20:00', 'Jantar cozinhando', 'Cozinhar', 'Vida prática', 'Repetir o prato da semana'],
  ['20:00', '21:15', 'Tempo livre', 'Tempo livre', 'Livre', 'Descanso'],
  ['21:15', '21:25', 'Oração da noite', 'Oração', 'Fé', ''],
  ['21:30', '21:45', 'Celular longe, luz baixa', 'Rotina', 'Rotina', ''],
  ['21:45', '05:30', 'Dormir', 'Sono', 'Sono', '7h45 de sono'],
]

const FREE_TIME = (start: string, end: string): Row => [start, end, 'Tempo livre', 'Tempo livre', 'Livre', 'Nada marcado']

/** Segunda, quarta e sexta: futevôlei de manhã, treino em casa e estudo até o meio-dia. */
const futevoleiDay = (lastBlock: Row): Row[] => [
  ...MORNING,
  ['06:30', '09:00', 'Futevôlei', 'Futevôlei', 'Corpo', 'Pode acabar mais cedo'],
  ['09:00', '09:30', 'Volta para casa', 'Rotina', 'Rotina', 'Chegar até 9h30'],
  ['09:30', '10:30', 'Treino em casa', 'Treino', 'Corpo', 'Superiores e core'],
  ['10:30', '10:45', 'Banho', 'Rotina', 'Rotina', ''],
  ['10:45', '12:15', 'Programação', 'Programação', 'Estudo', ''],
  ['12:15', '12:45', 'Escrita', 'Escrita', 'Estudo', 'Diário ou texto curto'],
  lastBlock,
  FREE_TIME('13:15', '19:00'),
  ...NIGHT,
]

/** Terça e quinta: treino de pernas cedo e estudo de manhã. */
const legsDay = (communication: Row, afternoon: Row[]): Row[] => [
  ...MORNING,
  ['06:30', '07:30', 'Treino', 'Treino', 'Corpo', 'Em casa · pernas'],
  FREE_TIME('07:30', '08:00'),
  ['08:00', '09:30', 'Programação', 'Programação', 'Estudo', ''],
  ['09:30', '10:00', 'Escrita', 'Escrita', 'Estudo', 'Diário ou texto curto'],
  communication,
  ...afternoon,
  ...NIGHT,
]

// índice 0 = segunda ... 6 = domingo
const WEEK: Row[][] = [
  futevoleiDay(['12:45', '13:15', 'Oratória', 'Oratória', 'Comunicação', 'Estudo + praticar em voz alta', true]),
  legsDay(['10:00', '10:30', 'Ler pessoas', 'Ler pessoas', 'Comunicação', 'Observar clientes na barbearia', true], [
    FREE_TIME('10:30', '15:00'),
    ['15:00', '', 'Trabalho', 'Trabalho', 'Trabalho', 'Ao chegar em casa, noite livre'],
  ]),
  futevoleiDay(['12:45', '13:15', 'Palácio mental', 'Palácio mental', 'Estudo', 'Montar e revisar o palácio (técnica de memória)', true]),
  legsDay(['10:00', '10:30', 'Valorizar os outros', 'Valorizar os outros', 'Comunicação', 'Fazer os outros parecerem interessantes: perguntas sobre a vida deles', true], [
    FREE_TIME('10:30', '19:00'),
  ]),
  futevoleiDay(['12:45', '13:15', 'Oratória', 'Oratória', 'Comunicação', 'Gravar vídeo de 2 min', true]),
  [
    ...MORNING,
    ['06:30', '07:30', 'Treino', 'Treino', 'Corpo', 'Em casa · corpo todo'],
    FREE_TIME('07:30', '10:30'),
    ['10:30', '12:00', 'Programação', 'Programação', 'Estudo', ''],
    ['12:00', '12:30', 'Escrita', 'Escrita', 'Estudo', 'Diário ou texto curto'],
    ['12:30', '13:00', 'Comunicação na prática', 'Comunicação na prática', 'Comunicação', 'Aplicar o que estudou na semana', true],
    FREE_TIME('13:00', '15:00'),
    ['15:00', '17:00', 'Receita nova', 'Cozinhar', 'Vida prática', 'Prato da semana'],
    FREE_TIME('17:00', '19:00'),
    ...NIGHT,
  ],
  [
    ...MORNING,
    FREE_TIME('06:15', '07:00'),
    ['07:00', '08:00', 'Treino leve', 'Treino', 'Corpo', 'Caminhada, mobilidade, alongamento'],
    ['08:15', '08:45', 'Escrita', 'Escrita', 'Estudo', 'Diário ou texto curto'],
    ['08:45', '09:00', 'Revisar e planejar a semana', 'Planejamento', 'Rotina', ''],
    FREE_TIME('09:00', '19:00'),
    ...NIGHT,
  ],
]

export function buildRoutineSeed(now: string): RoutineBlock[] {
  return WEEK.flatMap((rows, weekday) =>
    rows.map(([start, end, title, skill, category, detail, focus]) => ({
      id: crypto.randomUUID(),
      weekday: weekday as RoutineBlock['weekday'],
      start,
      end,
      title,
      skill,
      category,
      detail,
      ...(focus ? { focus: true } : {}),
      createdAt: now,
      updatedAt: now,
    })),
  )
}
