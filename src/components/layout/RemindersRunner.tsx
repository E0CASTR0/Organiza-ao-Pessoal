import { useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useToast } from '@/components/ui/ToastContext'
import { getSettings } from '@/db/repositories/settings.repo'
import { collectReminders, markSent, reminderText, DEFAULT_PREFS } from '@/utils/reminders'
import { showSystemNotification } from '@/utils/notify'

const CHECK_EVERY_MS = 60_000

/** Roda em segundo plano DENTRO do app: a cada minuto (e ao voltar pro app) vê se tem algum aviso
 * "na hora" — compromisso chegando, conta vencendo, meta ou água faltando — e mostra um aviso
 * dentro do app e, se o iPhone permitiu, uma notificação do sistema. Não renderiza nada.
 *
 * Importante: o iOS congela o app quando ele sai da tela, então isto só dispara com o app aberto
 * (ou logo depois de abrir, recuperando o que ficou na hora). Pra ser avisado com o app fechado,
 * use os lembretes no Calendário (Configurações > Avisos). */
export function RemindersRunner() {
  const toast = useToast()
  const settings = useLiveQuery(() => getSettings(), [])
  const prefs = settings?.notifications ? { ...DEFAULT_PREFS, ...settings.notifications } : undefined
  const prefsKey = prefs ? JSON.stringify(prefs) : ''
  const running = useRef(false)

  useEffect(() => {
    if (!prefs?.enabled) return
    let cancelled = false

    const run = async () => {
      if (running.current) return
      running.current = true
      try {
        const { due, skipped } = await collectReminders(new Date(), prefs)
        if (cancelled) return
        markSent([...skipped, ...due.map((reminder) => reminder.key)])
        for (const [index, reminder] of due.entries()) {
          void showSystemNotification(reminder.title, reminder.body, reminder.key)
          // aviso dentro do app: um por vez, espaçados, pra um não cobrir o outro
          window.setTimeout(() => {
            if (!cancelled && document.visibilityState === 'visible') toast.show(reminderText(reminder))
          }, index * 6000)
        }
      } finally {
        running.current = false
      }
    }

    void run()
    const interval = window.setInterval(() => void run(), CHECK_EVERY_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void run()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // `prefsKey` troca só quando as preferências mudam de verdade
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsKey, toast])

  return null
}
