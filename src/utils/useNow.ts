import { useEffect, useState } from 'react'

/** Devolve a hora atual e atualiza sozinho a cada `everyMs` (padrão: 1 minuto) — pra textos
 * como "em 40 min" não ficarem velhos com a tela aberta. */
export function useNow(everyMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), everyMs)
    return () => window.clearInterval(id)
  }, [everyMs])
  return now
}
