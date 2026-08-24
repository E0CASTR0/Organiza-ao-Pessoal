import { Link } from 'react-router-dom'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { useTheme } from '@/theme/useTheme'
import { BackupSection } from './BackupSection'
import { DangerZone } from './DangerZone'
import { TrashIcon, SettingsIcon } from '@/components/ui/icons'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader title="Configurações" icon={<SettingsIcon width={20} height={20} />} />

      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-[var(--text-primary)]">Tema escuro</p>
          <p className="text-sm text-[var(--text-tertiary)]">{theme === 'dark' ? 'Ativado' : 'Desativado (tema claro)'}</p>
        </div>
        <Toggle checked={theme === 'dark'} onChange={toggleTheme} aria-label="Alternar tema" />
      </Card>

      <Link to="/mais/lixeira" className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-4 hover:bg-[var(--bg-elevated-2)]">
        <div className="flex items-center gap-3">
          <TrashIcon width={18} height={18} className="text-[var(--text-secondary)]" />
          <p className="font-medium text-[var(--text-primary)]">Lixeira</p>
        </div>
        <span className="text-[var(--text-tertiary)]">›</span>
      </Link>

      <BackupSection />
      <DangerZone />
    </div>
  )
}
