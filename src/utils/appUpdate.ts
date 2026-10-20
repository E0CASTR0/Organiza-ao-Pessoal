/** Procura uma versão nova do app e, se houver, ativa e recarrega. Devolve 'current' quando já
 * está na mais recente (nada mudou). Os dados (IndexedDB) nunca são tocados. */
export async function checkForUpdate(): Promise<'updated' | 'current'> {
  if (!('serviceWorker' in navigator)) {
    location.reload()
    return 'updated'
  }
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    location.reload()
    return 'updated'
  }
  await registration.update()
  const incoming = registration.installing ?? registration.waiting
  if (!incoming) return 'current'

  // espera a versão nova assumir (até 8 s) e recarrega
  await new Promise<void>((resolve) => {
    const finish = () => resolve()
    if (incoming.state === 'activated') return finish()
    incoming.addEventListener('statechange', () => {
      if (incoming.state === 'activated') finish()
    })
    window.setTimeout(finish, 8000)
  })
  location.reload()
  return 'updated'
}

/** Limpa o CACHE do app (arquivos baixados e service worker) e recarrega — resolve o iPhone
 * insistindo em mostrar uma versão antiga. NÃO apaga os dados: metas, notas, agenda etc. ficam
 * no IndexedDB, que não é tocado aqui. */
export async function clearCacheAndReload(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
  location.reload()
}
