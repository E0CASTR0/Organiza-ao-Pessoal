import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/utils/motion'

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
  className?: string
  /** Duração da contagem em ms (padrão 600). */
  duration?: number
}

/** Número que "conta" até o novo valor em vez de trocar de uma vez (ex: o total da lista de
 * compras diminuindo quando um item é marcado como comprado). Na primeira exibição já mostra o
 * valor certo; com "Reduzir movimento" troca direto. */
export function AnimatedNumber({ value, format, className, duration = 600 }: AnimatedNumberProps) {
  const [shown, setShown] = useState(value)
  const shownRef = useRef(value)

  useEffect(() => {
    const from = shownRef.current
    if (from === value) return
    if (prefersReducedMotion()) {
      shownRef.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // desacelera no fim
      const next = t === 1 ? value : from + (value - from) * eased
      shownRef.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span className={className}>{format(shown)}</span>
}
