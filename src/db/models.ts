// Interfaces de todas as entidades salvas localmente (IndexedDB via Dexie).
// Toda tabela nova precisa ser adicionada aqui + em db.ts (schema) — o backup.ts
// não precisa de alterações, ele itera db.tables dinamicamente.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = segunda ... 6 = domingo

export interface DailyGoal {
  id: string
  date: string // 'AAAA-MM-DD'
  title: string
  completed: boolean
  order: number
  createdAt: string
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
  monthlyReturnValue: number
  currentQuote: number | null
  quoteUpdatedAt: string | null
  priceSource: PriceSource
  notes: string
  createdAt: string
}

export interface InvestmentSnapshot {
  id: string
  investmentId: string
  month: string // 'AAAA-MM'
  amountInvested: number
  returnValue: number
  quote: number | null
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

export interface Diet {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FixedBill {
  id: string
  name: string
  dueDay: number // 1-31
  value: number
  notes: string
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
