import { PageHeader } from '@/components/ui/PageHeader'
import { HubGrid, type HubTile } from '@/components/layout/HubGrid'
import { WalletIcon, ReceiptIcon, UserIcon, SettingsIcon, SearchIcon } from '@/components/ui/icons'
import { Link } from 'react-router-dom'

const tiles: HubTile[] = [
  { to: '/mais/investimentos', label: 'Investimentos', description: 'CDI, liquidez, bolsa', Icon: WalletIcon },
  { to: '/mais/contas-fixas', label: 'Contas Fixas', description: 'Pagamentos do mês', Icon: ReceiptIcon },
  { to: '/mais/perfil', label: 'Perfil', description: 'Nome e foto', Icon: UserIcon },
  { to: '/mais/configuracoes', label: 'Configurações', description: 'Tema, backup, reset', Icon: SettingsIcon },
]

export function MorePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Mais" />
      <Link
        to="/mais/busca"
        className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] px-4 py-3 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <SearchIcon width={18} height={18} />
        Buscar em todo o app
      </Link>
      <HubGrid tiles={tiles} />
    </div>
  )
}
