import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyGoal,
  DailyGoalCompletion,
  EventItem,
  MonthlyPriority,
  ShoppingItem,
  WorkTask,
  InvestmentCategory,
  Investment,
  InvestmentReturn,
  Note,
  WorkoutDay,
  Exercise,
  Diet,
  DietMealItem,
  FixedBill,
  FixedBillPayment,
  Profile,
  Settings,
  TrashItem,
} from './models'

export const db = new Dexie('organizacao-pessoal') as Dexie & {
  dailyGoals: EntityTable<DailyGoal, 'id'>
  dailyGoalCompletions: EntityTable<DailyGoalCompletion, 'id'>
  events: EntityTable<EventItem, 'id'>
  monthlyPriorities: EntityTable<MonthlyPriority, 'id'>
  shoppingItems: EntityTable<ShoppingItem, 'id'>
  workTasks: EntityTable<WorkTask, 'id'>
  investmentCategories: EntityTable<InvestmentCategory, 'id'>
  investments: EntityTable<Investment, 'id'>
  investmentReturns: EntityTable<InvestmentReturn, 'id'>
  notes: EntityTable<Note, 'id'>
  workoutDays: EntityTable<WorkoutDay, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  diets: EntityTable<Diet, 'id'>
  dietMealItems: EntityTable<DietMealItem, 'id'>
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

// v2: metas do dia viram persistentes (cadastra uma vez, nunca some sozinha) — a conclusão
// de cada dia passa a ficar numa tabela separada (dailyGoalCompletions), do mesmo jeito que
// fixedBillPayments já controla pago/não-pago por mês sem duplicar a conta em si. O upgrade
// abaixo preserva toda meta já criada: se ela estava marcada como concluída na data antiga,
// grava essa conclusão na nova tabela antes de tirar os campos date/completed da meta.
db.version(2)
  .stores({
    dailyGoals: 'id, order',
    dailyGoalCompletions: 'id, goalId, date',
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
  .upgrade(async (tx) => {
    interface OldDailyGoal {
      id: string
      date?: string
      completed?: boolean
    }
    const oldGoals: OldDailyGoal[] = await tx.table('dailyGoals').toArray()
    const completions = oldGoals
      .filter((g) => g.completed && g.date)
      .map((g) => ({ id: crypto.randomUUID(), goalId: g.id, date: g.date as string, completedAt: new Date().toISOString() }))
    if (completions.length > 0) {
      await tx.table('dailyGoalCompletions').bulkAdd(completions)
    }
    await tx
      .table('dailyGoals')
      .toCollection()
      .modify((g: OldDailyGoal & Record<string, unknown>) => {
        delete g.date
        delete g.completed
      })
  })

// v3: dietas passam a ter refeições configuráveis (café da manhã, almoço, pré/pós-treino,
// janta, ceia — todas opcionais) e cada refeição pode ter pratos/alimentos com calorias
// (dietMealItems), adicionados direto na tela inicial. Dietas já existentes recebem um
// conjunto padrão (café da manhã, almoço, janta) que dá pra ajustar depois.
db.version(3)
  .stores({
    dailyGoals: 'id, order',
    dailyGoalCompletions: 'id, goalId, date',
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
    dietMealItems: 'id, dietId, meal, order',
    fixedBills: 'id, dueDay, order',
    fixedBillPayments: 'id, fixedBillId, month',
    profile: 'id',
    settings: 'id',
    trashItems: 'id, entityType, deletedAt',
  })
  .upgrade(async (tx) => {
    await tx
      .table('diets')
      .toCollection()
      .modify((d: { enabledMeals?: unknown }) => {
        if (!Array.isArray(d.enabledMeals)) {
          d.enabledMeals = ['cafeDaManha', 'almoco', 'janta']
        }
      })
  })

// v4: três mudanças —
// 1) Nova seção de Notas (tabela `notes`, simples: título + texto).
// 2) Retorno mensal dos investimentos vira um LOG que acumula (tabela `investmentReturns`,
//    substitui `investmentSnapshots`) em vez de um campo único que se sobrescreve: cada
//    "adicionar retorno" grava uma linha nova, o "retorno do mês" é a soma das linhas do
//    mês atual (reinicia sozinho todo dia 1, sem apagar nada — o mês novo só ainda não tem
//    linhas), e o "retorno total" é a soma de tudo, pra sempre.
// 3) Campo `monthlyReturnValue` sai do investimento (não faz mais sentido como valor único).
// O upgrade migra os dados antigos: cada investmentSnapshot vira um investmentReturn
// (mesmo mês, mesmo valor), e se o investimento tinha um monthlyReturnValue diferente de
// zero sem snapshot correspondente, isso também vira um lançamento no mês atual — nada se
// perde.
db.version(4)
  .stores({
    dailyGoals: 'id, order',
    dailyGoalCompletions: 'id, goalId, date',
    events: 'id, date',
    monthlyPriorities: 'id, month, order',
    shoppingItems: 'id, order',
    workTasks: 'id, order',
    notes: 'id, updatedAt',
    investmentCategories: 'id, order',
    investments: 'id, categoryId',
    investmentReturns: 'id, investmentId, month',
    workoutDays: 'id, weekday, order',
    exercises: 'id, workoutDayId, order',
    diets: 'id',
    dietMealItems: 'id, dietId, meal, order',
    fixedBills: 'id, dueDay, order',
    fixedBillPayments: 'id, fixedBillId, month',
    profile: 'id',
    settings: 'id',
    trashItems: 'id, entityType, deletedAt',
    // tabela antiga removida do schema — dexie preserva os dados que ainda existirem nela,
    // só paramos de indexar/expor via db.investmentSnapshots (a migração abaixo já copia
    // tudo relevante pra investmentReturns antes disso)
    investmentSnapshots: null,
  })
  .upgrade(async (tx) => {
    interface OldSnapshot {
      id: string
      investmentId: string
      month: string
      returnValue: number
      createdAt: string
    }
    interface OldInvestment {
      id: string
      monthlyReturnValue?: number
    }

    const now = new Date().toISOString()
    const currentMonth = now.slice(0, 7)

    const oldSnapshots: OldSnapshot[] = await tx.table('investmentSnapshots').toArray()
    const returnsFromSnapshots = oldSnapshots
      .filter((s) => s.returnValue)
      .map((s) => ({ id: crypto.randomUUID(), investmentId: s.investmentId, month: s.month, value: s.returnValue, createdAt: s.createdAt }))

    const migratedInvestmentIds = new Set(returnsFromSnapshots.map((r) => r.investmentId))
    const oldInvestments: OldInvestment[] = await tx.table('investments').toArray()
    const returnsFromInvestmentField = oldInvestments
      .filter((inv) => inv.monthlyReturnValue && !migratedInvestmentIds.has(inv.id))
      .map((inv) => ({ id: crypto.randomUUID(), investmentId: inv.id, month: currentMonth, value: inv.monthlyReturnValue as number, createdAt: now }))

    const allReturns = [...returnsFromSnapshots, ...returnsFromInvestmentField]
    if (allReturns.length > 0) {
      await tx.table('investmentReturns').bulkAdd(allReturns)
    }

    await tx
      .table('investments')
      .toCollection()
      .modify((inv: OldInvestment & Record<string, unknown>) => {
        delete inv.monthlyReturnValue
      })
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
