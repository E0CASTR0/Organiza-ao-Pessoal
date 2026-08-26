import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TAB_ORDER = ['/', '/agenda', '/listas', '/rotina', '/mais']
const SWIPE_THRESHOLD_PX = 90 // arrasto mínimo pra contar como "troca de aba de propósito"
const COMMIT_PX = 12 // quanto precisa mover antes de decidir se o gesto é horizontal ou vertical
const ANIM_MS = 220

function currentTabIndex(pathname: string): number {
  const sorted = [...TAB_ORDER].sort((a, b) => b.length - a.length)
  const match = sorted.find((tab) => (tab === '/' ? pathname === '/' : pathname.startsWith(tab)))
  return TAB_ORDER.indexOf(match ?? '/')
}

interface Gesture {
  startX: number
  startY: number
  committed: 'none' | 'horizontal' | 'vertical'
}

/** Arrastar a tela pro lado troca de aba principal com uma animação de verdade (o
 * conteúdo acompanha o dedo em tempo real, e solta pra completar ou volta pro lugar).
 * Arrastar pra cima/baixo nunca é interceptado — a decisão "é horizontal ou vertical?"
 * é tomada logo nos primeiros pixels do gesto e, se for vertical, o scroll nativo da
 * página segue livre pelo resto do toque (a gente nunca chama preventDefault nesse caso). */
export function SwipeView({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dragX, setDragX] = useState(0)
  const [animating, setAnimating] = useState(false)
  const gestureRef = useRef<Gesture | null>(null)
  const dragXRef = useRef(0)
  const indexRef = useRef(currentTabIndex(location.pathname))

  useEffect(() => {
    dragXRef.current = dragX
  }, [dragX])

  // se a rota mudou (por um arrasto que completou, ou por outro caminho — ex: tocou na
  // barra de baixo), mantém o índice/ref em dia e garante que não sobrou arrasto residual
  useEffect(() => {
    indexRef.current = currentTabIndex(location.pathname)
    setDragX(0)
    setAnimating(false)
  }, [location.pathname])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const onStart = (e: TouchEvent) => {
      if (animating) return
      const target = e.target as HTMLElement
      if (target.closest('[data-hscroll]')) {
        gestureRef.current = null
        return
      }
      const touch = e.touches[0]
      gestureRef.current = { startX: touch.clientX, startY: touch.clientY, committed: 'none' }
    }

    const onMove = (e: TouchEvent) => {
      const gesture = gestureRef.current
      if (!gesture) return
      const touch = e.touches[0]
      const dx = touch.clientX - gesture.startX
      const dy = touch.clientY - gesture.startY

      if (gesture.committed === 'none') {
        if (Math.abs(dx) > COMMIT_PX && Math.abs(dx) > Math.abs(dy)) {
          gesture.committed = 'horizontal'
        } else if (Math.abs(dy) > COMMIT_PX) {
          gesture.committed = 'vertical'
          return
        } else {
          return
        }
      }
      if (gesture.committed !== 'horizontal') return

      e.preventDefault() // só a partir daqui — nunca durante um gesto vertical
      const atStart = indexRef.current === 0 && dx > 0
      const atEnd = indexRef.current === TAB_ORDER.length - 1 && dx < 0
      setDragX(atStart || atEnd ? dx / 3 : dx) // resistência nas pontas
    }

    const onEnd = () => {
      const gesture = gestureRef.current
      gestureRef.current = null
      if (!gesture || gesture.committed !== 'horizontal') return

      const dx = dragXRef.current
      const width = el.clientWidth || 1
      const index = indexRef.current

      if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
        const dir = dx < 0 ? 1 : -1
        const nextIndex = index + dir
        if (nextIndex >= 0 && nextIndex < TAB_ORDER.length) {
          const exitX = dir === 1 ? -width : width
          setAnimating(true)
          setDragX(exitX)
          window.setTimeout(() => {
            navigate(TAB_ORDER[nextIndex])
            // o conteúdo novo "chega" da mesma borda pra onde o anterior saiu — teleporta
            // sem transição pro ponto de partida e, no quadro seguinte, anima até o centro
            setAnimating(false)
            setDragX(exitX)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setAnimating(true)
                setDragX(0)
              })
            })
          }, ANIM_MS)
          return
        }
      }
      setAnimating(true)
      setDragX(0)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [animating, navigate])

  return (
    <div
      ref={wrapperRef}
      style={{
        transform: `translateX(${dragX}px)`,
        transition: animating ? `transform ${ANIM_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)` : 'none',
      }}
    >
      {children}
    </div>
  )
}
