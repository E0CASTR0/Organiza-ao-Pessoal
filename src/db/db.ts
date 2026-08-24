import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyGoal,
  EventItem,
  MonthlyPriority,
  ShoppingItem,
  WorkTask,
  InvestmentCategory,
  Investment,
  InvestmentSnapshot,
  WorkoutDay,
  Exercise,
  Diet,
  FixedBill,
  FixedBillPayment,
  Profile,
  Settings,
  TrashItem,
} from './models'

export const db = new Dexie('organizacao-pessoal') as Dexie & {
  dailyGoals: EntityTable<DailyGoal, 'id'>
  events: EntityTable<EventItem, 'id'>
  monthlyPriorities: EntityTable<MonthlyPriority, 'id'>
  shoppingItems: EntityTable<ShoppingItem, 'id'>
  workTasks: EntityTable<WorkTask, 'id'>
  investmentCategories: EntityTable<InvestmentCategory, 'id'>
  investments: EntityTable<Investment, 'id'>
  investmentSnapshots: EntityTable<InvestmentSnapshot, 'id'>
  workoutDays: EntityTable<WorkoutDay, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  diets: EntityTable<Diet, 'id'>
  fixedBills: EntityTable<FixedBill, 'id'>
  fixedBillPayments: EntityTable<FixedBillPayment, 'id'>
  profile: EntityTable<Profile, 'id'>
  settings: EntityTable<Settings, 'id'>
  trashItems: EntityTable<TrashItem, 'id'>
}

// Observação: campos booleanos (bought, completed, isActive...) não entram como índice
// aqui de propósito — IndexedDB não trata `boolean` como chave válida (a entrada some
// silenciosamente do índice), então esses campos são sempre filtrados em memória (.filter),
// o que é perfeitamente rápido pra volume de dados de um app pessoal.
db.version(1).stores({
  dailyGoals: 'id, date, order',
  events: 'id, date',
  monthlyPriorities: 'id, month, order',
  shoppingItems: 'id, order',
  workTasks: 'id, order',
  investmentCategories: 'id, order',
  investments: 'id, categoryId',
  investmentSnapshots: 'id, investmentId, month',
  workoutDays: 'id, weekday, order',
  exercises: 'id, workoutDayId, order',
  diets: 'id',
  fixedBills: 'id, dueDay, order',
  fixedBillPayments: 'id, fixedBillId, month',
  profile: 'id',
  settings: 'id',
  trashItems: 'id, entityType, deletedAt',
})

/** Garante as linhas singleton (profile/settings) e os dados iniciais na primeira vez que o app abre.
 * Roda tudo dentro de UMA transação: como o React.StrictMode (dev) dispara o efeito de montagem duas
 * vezes, duas chamadas concorrentes a essa função podem entrelaçar suas leituras/escritas — envolver
 * tudo numa transação faz a segunda chamada esperar a primeira terminar antes de checar o que já existe,
 * evitando categorias/dias de treino duplicados. */
export async function ensureSeedData() {
  const now = new Date().toISOString()

  await db.transaction('rw', [db.settings, db.profile, db.investmentCategories, db.workoutDays], async () => {
    const settings = await db.settings.get('settings')
    if (!settings) {
      await db.settings.put({ id: 'settings', theme: 'dark', updatedAt: now })
    }

    const profile = await db.profile.get('profile')
    if (!profile) {
      await db.profile.put({ id: 'profile', displayName: '', nickname: '', photoBase64: null, updatedAt: now })
    }

    const categoryCount = await db.investmentCategories.count()
    if (categoryCount === 0) {
      await db.investmentCategories.bulkAdd([
        { id: crypto.randomUUID(), name: 'CDI', order: 0 },
        { id: crypto.randomUUID(), name: 'Liquidez Diária', order: 1 },
        { id: crypto.randomUUID(), name: 'Bolsa de Valores', order: 2 },
      ])
    }

    const workoutDayCount = await db.workoutDays.count()
    if (workoutDayCount === 0) {
      const labels = ['Treino A', 'Treino B', 'Treino C', 'Treino D', 'Treino E', 'Descanso', 'Descanso']
      await db.workoutDays.bulkAdd(
        labels.map((label, weekday) => ({ id: crypto.randomUUID(), weekday: weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6, label, order: weekday })),
      )
    }
  })
}
