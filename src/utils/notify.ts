/** Estado da permissão de notificações do aparelho. */
export type NotifyState = 'unsupported' | 'default' | 'granted' | 'denied'

export function notificationState(): NotifyState {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as NotifyState
}

/** Pede permissão (precisa ser chamada de um toque do usuário; no iPhone só funciona com o app
 * instalado na tela inicial). */
export async function requestNotificationPermission(): Promise<NotifyState> {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    await Notification.requestPermission()
  } catch {
    // alguns navegadores só aceitam o formato com callback — o estado abaixo mostra o resultado
  }
  return notificationState()
}

/** Mostra uma notificação do sistema (pelo service worker, que é o único jeito que o iOS aceita).
 * Devolve false se não tem permissão ou se algo falhou. */
export async function showSystemNotification(title: string, body: string, tag: string): Promise<boolean> {
  if (notificationState() !== 'granted') return false
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`
    if (registration) {
      await registration.showNotification(title, { body, tag, icon })
      return true
    }
    new Notification(title, { body, tag, icon })
    return true
  } catch {
    return false
  }
}
