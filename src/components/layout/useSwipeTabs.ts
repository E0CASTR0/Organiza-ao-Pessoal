import { useNavigate, useLocation } from 'react-router-dom'
import { useRef } from 'react'

const TAB_ORDER = ['/', '/agenda', '/listas', '/rotina', '/mais']

const SWIPE_THRESHOLD_PX = 70 // distância mínima pra contar como "arrastei de propósito"
const DIRECTION_RATIO = 1.3 // precisa ser bem mais horizontal que vertical pra não brigar com o scroll

function currentTabIndex(pathname: string): number {
  // ordena do path mais específico pro menos específico, pra "/" não bater com tudo
  const sorted = [...TAB_ORDER].sort((a, b) => b.length - a.length)
  const match = sorted.find((tab) => (tab === '/' ? pathname === '/' : pathname.startsWith(tab)))
  return TAB_ORDER.indexOf(match ?? '/')
}

/** Arrastar a tela pro lado troca de aba principal (Início ↔ Agenda ↔ Listas ↔ Rotina ↔
 * Mais), travando nas pontas — não dá pra passar de "Mais" pra frente nem de "Início" pra
 * trás. Ignora o gesto se ele começar dentro de algo que já rola na horizontal (pílulas de
 * segmento, dias da semana do treino — marcados com data-hscroll) ou se for mais vertical
 * que horizontal (scroll normal da página). */
export function useSwipeTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const start = useRef<{ x: number; y: number; skip: boolean } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const target = e.target as HTMLElement
    const skip = target.closest('[data-hscroll]') != null
    start.current = { x: touch.clientX, y: touch.clientY, skip }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!start.current || start.current.skip) {
      start.current = null
      return
    }
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - start.current.x
    const deltaY = touch.clientY - start.current.y
    start.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(deltaX) < Math.abs(deltaY) * DIRECTION_RATIO) return

    const index = currentTabIndex(location.pathname)
    if (deltaX < 0 && index < TAB_ORDER.length - 1) {
      navigate(TAB_ORDER[index + 1])
    } else if (deltaX > 0 && index > 0) {
      navigate(TAB_ORDER[index - 1])
    }
  }

  return { onTouchStart, onTouchEnd }
}
