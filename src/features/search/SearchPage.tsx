import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchIcon } from '@/components/ui/icons'
import { db } from '@/db/db'

interface SearchResult {
  id: string
  title: string
  section: string
  to: string
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = useLiveQuery(async (): Promise<SearchResult[]> => {
    const term = query.trim().toLowerCase()
    if (!term) return []

    const [priorities, shopping, tasks, bills, diets] = await Promise.all([
      db.monthlyPriorities.toArray(),
      db.shoppingItems.toArray(),
      db.workTasks.toArray(),
      db.fixedBills.toArray(),
      db.diets.toArray(),
    ])

    const found: SearchResult[] = []
    for (const p of priorities) if (p.title.toLowerCase().includes(term)) found.push({ id: p.id, title: p.title, section: 'Prioridade do mês', to: '/listas/prioridades' })
    for (const s of shopping) if (s.name.toLowerCase().includes(term)) found.push({ id: s.id, title: s.name, section: 'Lista de compras', to: '/listas/compras' })
    for (const t of tasks) if (t.title.toLowerCase().includes(term)) found.push({ id: t.id, title: t.title, section: 'Trabalho', to: '/listas/trabalho' })
    for (const b of bills) if (b.name.toLowerCase().includes(term)) found.push({ id: b.id, title: b.name, section: 'Contas Fixas', to: '/mais/contas-fixas' })
    for (const d of diets) if (d.title.toLowerCase().includes(term)) found.push({ id: d.id, title: d.title, section: 'Dieta', to: '/rotina/dieta' })
    return found
  }, [query]) ?? []

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader title="Buscar" icon={<SearchIcon width={20} height={20} />} />
      <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar em compras, prioridades, tarefas, contas, dietas..." autoFocus />

      {query.trim() && results.length === 0 && <EmptyState title="Nada encontrado" description="Tente outro termo de busca." />}

      <div className="flex flex-col gap-2">
        {results.map((result) => (
          <Card key={`${result.section}-${result.id}`} className="cursor-pointer p-3.5" onClick={() => navigate(result.to)}>
            <p className="font-medium text-[var(--text-primary)]">{result.title}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{result.section}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
