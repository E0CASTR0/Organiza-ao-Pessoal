import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '@/components/ui/PageHeader'
import { HubGrid, type HubTile } from '@/components/layout/HubGrid'
import { WalletIcon, ReceiptIcon, UserIcon, SettingsIcon, SearchIcon, GridIcon, NoteIcon, PiggyIcon } from '@/components/ui/icons'
import { listSavingsEntries, summarize } from '@/db/repositories/savings.repo'
import { listNotes } from '@/db/repositories/notes.repo'
import { getProfile } from '@/db/repositories/profile.repo'
import { formatCurrency } from '@/utils/currency'

export function MorePage() {
  const savings = useLiveQuery(() => listSavingsEntries(), [])
  const notes = useLiveQuery(() => listNotes(), [])
  const profile = useLiveQuery(() => getProfile(), [])
  const name = profile?.nickname || profile?.displayName

  const tiles: HubTile[] = [
    { to: '/mais/guardado', label: name ? `Caixinha de ${name}` : 'Caixinha', description: savings ? `${formatCurrency(summarize(savings).balance)} guardados` : 'Dinheiro guardado', Icon: PiggyIcon },
    { to: '/mais/investimentos', label: 'Investimentos', description: 'CDI, liquidez, bolsa', Icon: WalletIcon },
    { to: '/mais/notas', label: 'Notas', description: notes ? `${notes.length} ${notes.length === 1 ? 'anotação' : 'anotações'}` : 'Suas anotações', Icon: NoteIcon },
    { to: '/mais/contas-fixas', label: 'Contas Fixas', description: 'Pagamentos do mês', Icon: ReceiptIcon },
    { to: '/mais/perfil', label: 'Perfil', description: 'Nome e foto', Icon: UserIcon },
    { to: '/mais/configuracoes', label: 'Configurações', description: 'Tema, água, avisos, backup', Icon: SettingsIcon },
  ]

  return (
    <div className="reveal flex flex-col gap-5">
      <PageHeader title="Mais" icon={<GridIcon width={20} height={20} />} />
      <Link
        to="/mais/busca"
        className="surface surface-interactive press flex items-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        <SearchIcon width={18} height={18} />
        Buscar em todo o app
      </Link>
      <HubGrid tiles={tiles} />
    </div>
  )
}
