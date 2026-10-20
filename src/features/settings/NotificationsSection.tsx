import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/components/ui/ToastContext'
import { getSettings, setNotificationPrefs } from '@/db/repositories/settings.repo'
import { DEFAULT_PREFS } from '@/utils/reminders'
import { notificationState, requestNotificationPermission, showSystemNotification, type NotifyState } from '@/utils/notify'
import { buildCalendar, shareCalendar } from '@/utils/ics'
import type { NotificationPrefs } from '@/db/models'

const STATE_LABEL: Record<NotifyState, string> = {
  granted: 'Notificações do iPhone: permitidas',
  denied: 'Notificações do iPhone: bloqueadas (libere em Ajustes do iPhone > Notificações)',
  default: 'Notificações do iPhone: ainda não permitidas',
  unsupported: 'Notificações do iPhone: indisponíveis aqui (instale o app na tela inicial)',
}

const CATEGORIES: { key: 'events' | 'bills' | 'goals' | 'water'; label: string; hint: string }[] = [
  { key: 'events', label: 'Compromissos', hint: 'De 3 h antes até a hora, e à noite os de amanhã cedo' },
  { key: 'bills', label: 'Contas', hint: 'No dia do vencimento e na véspera' },
  { key: 'goals', label: 'Metas', hint: 'Quando faltar meta pra bater — textos variados, em horários diferentes' },
  { key: 'water', label: 'Água', hint: 'Se o dia estiver passando e o copo vazio' },
]

/** Avisos: o que o app avisa sozinho enquanto está aberto e como receber avisos com o app FECHADO
 * (lembretes no Calendário do iPhone). */
export function NotificationsSection() {
  const toast = useToast()
  const settings = useLiveQuery(() => getSettings(), [])
  const prefs: NotificationPrefs = { ...DEFAULT_PREFS, ...settings?.notifications }
  const [permission, setPermission] = useState<NotifyState>(notificationState)
  const [daily, setDaily] = useState(true)
  const [exporting, setExporting] = useState(false)

  const update = (patch: Partial<NotificationPrefs>) => void setNotificationPrefs({ ...prefs, ...patch })

  const toggleMaster = async () => {
    if (prefs.enabled) {
      update({ enabled: false })
      return
    }
    update({ enabled: true })
    if (notificationState() === 'default') setPermission(await requestNotificationPermission())
  }

  const sendTest = async () => {
    if (notificationState() === 'default') setPermission(await requestNotificationPermission())
    const ok = await showSystemNotification('Teste de lembrete', 'Se você está vendo isto, as notificações do iPhone estão funcionando.', 'teste')
    toast.show(ok ? 'Notificação enviada. Se o app estiver aberto, o iPhone pode não mostrar o banner.' : 'Sem permissão do iPhone: o app mostra os avisos aqui dentro.')
  }

  const exportCalendar = async () => {
    setExporting(true)
    try {
      const { text, counts } = await buildCalendar({ includeDailyReminder: daily })
      const result = await shareCalendar(text)
      if (result !== 'cancelled') toast.show(`${counts.events} compromissos, ${counts.bills} contas${daily ? ` e ${counts.daily} lembretes diários` : ''} prontos. Escolha “Calendário” e toque em Adicionar tudo.`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="font-medium text-[var(--text-primary)]">Avisos e lembretes</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          O app avisa você enquanto está aberto. Pra ser avisado com o app fechado, use os lembretes no Calendário (mais abaixo) — o iPhone dispara eles sozinho.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[var(--text-primary)]">Lembretes do app</p>
          <p className="text-xs text-[var(--text-tertiary)]">{STATE_LABEL[permission]}</p>
        </div>
        <Toggle checked={prefs.enabled} onChange={() => void toggleMaster()} aria-label="Ligar lembretes do app" />
      </div>

      {prefs.enabled && (
        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-3">
          {CATEGORIES.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[var(--text-primary)]">{label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={() => update({ [key]: !prefs[key] })} aria-label={`Avisos de ${label.toLowerCase()}`} />
            </div>
          ))}
          <Button variant="secondary" size="sm" className="self-start" onClick={() => void sendTest()}>
            Enviar um teste
          </Button>
        </div>
      )}

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <h3 className="text-[var(--text-primary)]">Avisos com o app fechado</h3>
        <p className="mb-3 mt-1 text-sm text-[var(--text-secondary)]">
          Gera um arquivo pro Calendário do iPhone com os próximos 30 dias de compromissos (alarme 2 h e 15 min antes) e as contas dos próximos 60 dias (alarme na véspera e no dia). Exportar de novo
          atualiza o que já está lá, sem duplicar.
        </p>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-primary)]">Incluir um lembrete diário das metas (20h30)</p>
          <Toggle checked={daily} onChange={() => setDaily((value) => !value)} aria-label="Incluir lembrete diário das metas" />
        </div>
        <Button size="sm" disabled={exporting} onClick={() => void exportCalendar()}>
          {exporting ? 'Gerando…' : 'Adicionar ao Calendário'}
        </Button>
      </div>
    </Card>
  )
}
