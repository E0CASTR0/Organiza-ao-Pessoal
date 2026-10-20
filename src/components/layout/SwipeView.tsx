import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { prefersReducedMotion } from '@/utils/motion'
import { TAB_ORDER, currentTabIndex } from './tabs'

const SWIPE_DISTANCE_PX = 80 // arrasto mínimo pra contar como "troca de aba de propósito"
const SWIPE_VELOCITY_PX_PER_MS = 0.45 // ...ou um "gesto rápido" (flick) acima disso
const COMMIT_PX = 10 // quanto precisa mover antes de decidir se o gesto é horizontal ou vertical
const EXIT_MS = 200
const ENTER_MS = 320
const SNAP_BACK_MS = 260
const TAP_SLIDE_PX = 28 // deslize curto ao trocar de aba tocando na barra de baixo
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface Gesture {
  startX: number
  startY: number
  startTime: number
  committed: 'none' | 'horizontal' | 'vertical'
  dx: number
}

const at = (x: number) => `translate3d(${x}px, 0, 0)`

/** Desliza o conteúdo novo pra dentro. `from` é de onde ele parte (px); o estilo inline que o
 * estacionava fora da tela é limpo logo depois de a animação começar (ela cobre o 1º quadro). */
function slideIn(el: HTMLElement, from: number, ms: number, busy: { current: boolean }) {
  el.dataset.nav = 'slide'
  busy.current = true
  const animation = el.animate([{ transform: at(from) }, { transform: at(0) }], { duration: ms, easing: EASE })
  el.style.transform = ''
  el.style.willChange = ''
  const done = () => {
    // Tirar o `data-nav` faria os cartões que já estão na tela COMEÇAREM a animação de entrada
    // agora (a regra passa de `animation: none` pra `rise-in` = animação nova): eles sumiriam e
    // reapareceriam logo depois do deslize. Então antes marca os que já existem como "entrada
    // feita"; só os que chegarem depois (um item novo, outro dia na agenda) animam.
    el.querySelectorAll('.reveal > *').forEach((child) => child.setAttribute('data-no-reveal', ''))
    delete el.dataset.nav
    busy.current = false
  }
  animation.finished.then(done, done)
}

/** Arrastar a tela pro lado troca de aba principal: o conteúdo acompanha o dedo, e ao soltar ele
 * sai pro lado e o novo entra do lado oposto. Também cuida de zerar a rolagem ao trocar de tela.
 *
 * Tudo aqui mexe direto no estilo do elemento (sem estado do React durante o gesto), o que
 * deixa o arrasto leve mesmo em telas cheias. Pontos que já deram problema e estão tratados:
 *  - a rolagem vertical é compartilhada entre as telas (é a mesma <main>): sem zerar, a tela
 *    nova aparecia "já rolada" no meio;
 *  - o conteúdo fora da tela alargava a <main> e permitia puxar a página pros lados
 *    (a <main> tem overflow-x escondido);
 *  - a tela nova podia piscar vazia enquanto os cartões faziam a própria animação de entrada
 *    (durante o deslize, as animações de entrada dos cartões ficam desligadas: data-nav);
 *  - o estado "fora da tela" era resetado antes da tela nova chegar (o deslize de entrada não
 *    acontecia): agora o conteúdo fica estacionado fora da tela até a rota mudar de fato. */
export function SwipeView({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const initialIndex = currentTabIndex(pathname)
  const indexRef = useRef(initialIndex)
  const prevIndexRef = useRef(initialIndex)
  const pendingEnterDir = useRef<1 | -1 | null>(null) // direção do arrasto que está esperando a rota mudar
  const busyRef = useRef(false)
  const gestureRef = useRef<Gesture | null>(null)

  // Rota mudou (arrasto que completou, toque na barra de baixo, link...): zera a rolagem e,
  // conforme a origem, desliza o conteúdo novo pra dentro. Layout effect pra rodar antes do
  // primeiro quadro pintado (senão a tela nova piscaria no lugar antes de começar a deslizar).
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    if (el.parentElement) el.parentElement.scrollTop = 0

    const nextIndex = currentTabIndex(pathname)
    const prevIndex = prevIndexRef.current
    prevIndexRef.current = nextIndex
    indexRef.current = nextIndex

    const swipeDir = pendingEnterDir.current
    pendingEnterDir.current = null

    if (swipeDir) {
      slideIn(el, swipeDir * el.clientWidth, ENTER_MS, busyRef)
    } else if (nextIndex !== prevIndex && !prefersReducedMotion()) {
      slideIn(el, (nextIndex > prevIndex ? 1 : -1) * TAP_SLIDE_PX, ENTER_MS, busyRef)
    }
  }, [pathname])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const settle = (from: number) => {
      // não passou do limite: volta pro lugar com mola
      busyRef.current = true
      const back = el.animate([{ transform: at(from) }, { transform: at(0) }], { duration: SNAP_BACK_MS, easing: EASE })
      el.style.transform = ''
      el.style.willChange = ''
      const done = () => {
        busyRef.current = false
      }
      back.finished.then(done, done)
    }

    const commitSwipe = (dx: number, dir: 1 | -1) => {
      const width = el.clientWidth || 1
      const nextIndex = indexRef.current + dir
      busyRef.current = true
      const exit = el.animate([{ transform: at(dx) }, { transform: at(-dir * width) }], { duration: EXIT_MS, easing: EASE, fill: 'forwards' })
      exit.finished.then(
        () => {
          // estaciona o conteúdo antigo fora da tela, do lado de onde a tela nova vai entrar, e
          // só então troca a rota — a entrada acontece no layout effect acima
          el.style.transform = at(dir * width)
          exit.cancel()
          pendingEnterDir.current = dir
          navigate(TAB_ORDER[nextIndex])
          // rede de segurança: se por algum motivo a rota não mudou, não deixa a tela vazia
          window.setTimeout(() => {
            if (pendingEnterDir.current !== null) {
              pendingEnterDir.current = null
              el.style.transform = ''
              busyRef.current = false
            }
          }, 800)
        },
        () => {
          el.style.transform = ''
          busyRef.current = false
        },
      )
    }

    const onStart = (e: TouchEvent) => {
      if (busyRef.current || e.touches.length !== 1) {
        gestureRef.current = null
        return
      }
      const target = e.target as HTMLElement
      // áreas com rolagem horizontal própria (seletor de abas, dias da semana) ficam de fora
      if (target.closest('[data-hscroll]')) {
        gestureRef.current = null
        return
      }
      const touch = e.touches[0]
      gestureRef.current = { startX: touch.clientX, startY: touch.clientY, startTime: e.timeStamp, committed: 'none', dx: 0 }
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
          el.style.willChange = 'transform'
        } else if (Math.abs(dy) > COMMIT_PX) {
          gesture.committed = 'vertical'
          return
        } else {
          return
        }
      }
      if (gesture.committed !== 'horizontal') return

      e.preventDefault() // só a partir daqui — nunca durante um gesto vertical
      const index = indexRef.current
      const atStart = index === 0 && dx > 0
      const atEnd = index === TAB_ORDER.length - 1 && dx < 0
      gesture.dx = atStart || atEnd ? dx / 3 : dx // resistência nas pontas
      el.style.transform = at(gesture.dx)
    }

    const onEnd = () => {
      const gesture = gestureRef.current
      gestureRef.current = null
      if (!gesture || gesture.committed !== 'horizontal') return

      const dx = gesture.dx
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - gesture.startTime)
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      const nextIndex = indexRef.current + dir
      const farEnough = Math.abs(dx) > SWIPE_DISTANCE_PX || (velocity > SWIPE_VELOCITY_PX_PER_MS && Math.abs(dx) > 30)

      if (farEnough && nextIndex >= 0 && nextIndex < TAB_ORDER.length) {
        if (prefersReducedMotion()) {
          el.style.transform = ''
          el.style.willChange = ''
          navigate(TAB_ORDER[nextIndex])
        } else {
          commitSwipe(dx, dir)
        }
      } else {
        settle(dx)
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    // o fim do toque vai no document (não no elemento): se a tela se redesenhar no meio do gesto
    // e o elemento tocado sair do DOM, o evento de "soltou" não chegaria aqui e a página
    // ficaria presa no meio do caminho
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [navigate])

  return <div ref={wrapperRef}>{children}</div>
}
