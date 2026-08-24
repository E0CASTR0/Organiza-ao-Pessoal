import type { MealSlotKey } from '@/db/models'

// Ordem cronológica do dia — usada sempre que listamos os slots de refeição.
export const MEAL_SLOT_ORDER: MealSlotKey[] = ['cafeDaManha', 'preTreino', 'almoco', 'lancheDaTarde', 'posTreino', 'janta', 'ceia']

export const MEAL_SLOT_LABELS: Record<MealSlotKey, string> = {
  cafeDaManha: 'Café da manhã',
  preTreino: 'Pré-treino',
  almoco: 'Almoço',
  lancheDaTarde: 'Lanche da tarde',
  posTreino: 'Pós-treino',
  janta: 'Janta',
  ceia: 'Ceia',
}

// Seleção inicial sugerida pra uma dieta nova — o resto fica disponível pra ativar quando quiser.
export const DEFAULT_ENABLED_MEALS: MealSlotKey[] = ['cafeDaManha', 'almoco', 'janta']
