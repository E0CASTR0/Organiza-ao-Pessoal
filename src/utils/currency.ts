const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return formatter.format(value)
}

/** Converte texto de input (aceita vírgula ou ponto) num número, ou null se vazio/inválido. */
export function parseCurrencyInput(text: string): number | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const normalized = trimmed.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isNaN(value) ? null : value
}
