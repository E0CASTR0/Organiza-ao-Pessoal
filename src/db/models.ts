// Interfaces de todas as entidades salvas localmente (IndexedDB via Dexie).
// Toda tabela nova precisa ser adicionada aqui + em db.ts (schema) — o backup.ts
// não precisa de alterações, ele itera db.tables dinamicamente.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = segunda ... 6 = domingo

// Meta persistente — cadastrada uma vez, some só se for apagada (vai pra Lixeira).
// A conclusão de cada dia fica separada em DailyGoalCompletion, então o check reinicia
// sozinho à meia-noite (é só o dia mudar que a consulta de "hoje" não encontra mais
// uma conclusão pra essa data) sem precisar de nenhum agendador/cron.
export interface DailyGoal {
  id: string
  title: string
  order: number
  createdAt: string
}

export interface DailyGoalCompletion {
  id: string
  goalId: string
  date: string // 'AAAA-MM-DD'
  completedAt: string
}

export interface EventItem {
  id: string
  title: string
  date: string // 'AAAA-MM-DD'
  time: string | null // 'HH:mm' ou null pra evento de dia inteiro
  notes: string
  createdAt: string
  updatedAt: string
}

export interface MonthlyPriority {
  id: string
  month: string // 'AAAA-MM'
  title: string
  completed: boolean
  order: number
  createdAt: string
}

export interface ShoppingItem {
  id: string
  name: string
  imageBase64: string | null
  price: number | null
  bought: boolean
  order: number
  createdAt: string
}

export interface WorkTask {
  id: string
  title: string
  notes: string
  completed: boolean
  dueDate: string | null // 'AAAA-MM-DD'
  order: number
  createdAt: string
}

/** Anotação livre — tipo o app Notas do iPhone: só título + texto, sem mais nada. */
export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type PriceSource = 'manual' | 'api'

export interface InvestmentCategory {
  id: string
  name: string
  order: number
}

export interface Investment {
  id: string
  categoryId: string
  name: string
  ticker: string | null
  amountInvested: number
  currentQuote: number | null
  quoteUpdatedAt: string | null
  priceSource: PriceSource
  notes: string
  createdAt: string
}

/** Um lançamento de retorno — cada "adicionar" cria uma linha nova (não sobrescreve),
 * então dá pra lançar quantas vezes quiser ao longo do mês e elas se somam. O retorno "do
 * mês" é a soma dos lançamentos com month = mês atual (reinicia sozinho todo dia 1, sem
 * precisar apagar nada — o mês novo simplesmente ainda não tem lançamentos). O retorno
 * "total" é a soma de todos os lançamentos, de todos os meses, pra sempre. */
export interface InvestmentReturn {
  id: string
  investmentId: string
  month: string // 'AAAA-MM'
  value: number
  createdAt: string
}

export interface WorkoutDay {
  id: string
  weekday: Weekday
  label: string // ex: "Treino A", "Descanso"
  order: number
}

export interface Exercise {
  id: string
  workoutDayId: string
  name: string
  sets: number
  reps: string // texto livre: "8-12", "até a falha", etc
  weight: string | null
  notes: string
  order: number
}

export type MealSlotKey = 'cafeDaManha' | 'preTreino' | 'almoco' | 'lancheDaTarde' | 'posTreino' | 'janta' | 'ceia'

export interface Diet {
  id: string
  title: string
  content: string
  isActive: boolean
  enabledMeals: MealSlotKey[] // quais refeições essa dieta usa — todas opcionais
  createdAt: string
  updatedAt: string
}

/** Prato/alimento dentro de uma refeição de uma dieta — plano de alimentação, não um
 * diário: não é escopado por data, fica sempre visível enquanto a dieta existir. */
export interface DietMealItem {
  id: string
  dietId: string
  meal: MealSlotKey
  name: string
  calories: number | null
  order: number
}

export interface FixedBill {
  id: string
  name: string
  dueDay: number // 1-31
  value: number
  notes: string
  imageBase64: string | null
  active: boolean
  order: number
  createdAt: string
}

export interface FixedBillPayment {
  id: string
  fixedBillId: string
  month: string // 'AAAA-MM'
  paidAt: string | null
}

export interface Profile {
  id: 'profile'
  displayName: string
  nickname: string
  photoBase64: string | null
  updatedAt: string
}

export type ThemeMode = 'dark' | 'light'

export interface Settings {
  id: 'settings'
  theme: ThemeMode
  recurringEventsSeeded?: boolean // marca que os compromissos fixos (treino/curso) já foram adicionados uma vez
  updatedAt: string
}

export interface TrashItem {
  id: string
  entityType: string // nome da tabela original
  entityId: string
  label: string // texto curto pra exibir na lixeira sem precisar reabrir o payload
  payload: unknown // snapshot completo da linha apagada
  deletedAt: string
}
