import { useEffect, useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './icons'
import { EXIT_MS, prefersReducedMotion } from '@/utils/motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

type Phase = 'closed' | 'open' | 'closing'

/** Arrastou mais que isso pra baixo (ou soltou com pressa) → a folha fecha. */
const CLOSE_DISTANCE_PX = 96
const CLOSE_VELOCITY_PX_PER_MS = 0.55

/** Folha que sobe da base (no celular) ou janela centralizada (telas grandes).
 * Entra e sai com animação — por isso o componente continua montado durante a saída — e no
 * celular dá pra fechar puxando a alcinha/título pra baixo, como nas folhas do iOS. As
 * animações em si estão em motion.css (.sheet-backdrop / .sheet-panel). */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const [phase, setPhase] = useState<Phase>(open ? 'open' : 'closed')
  const [prevOpen, setPrevOpen] = useState(open)
  const panelRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startTime: number; dy: number } | null>(null)
  // o conteúdo da última vez que estava aberto: durante a animação de saída o pai já pode ter
  // mudado o estado dele (ex: zerou o item em edição), e a folha não deve "mudar de cara" no
  // meio da descida
  const [lastShown, setLastShown] = useState({ title, children })

  // ajusta estado no próprio render quando uma prop muda (padrão "estado derivado de prop")
  if (open !== prevOpen) {
    setPrevOpen(open)
    setPhase(open ? 'open' : 'closing')
  }
  if (open && (lastShown.title !== title || lastShown.children !== children)) {
    setLastShown({ title, children })
  }

  useEffect(() => {
    if (phase !== 'closing') return
    // tira o foco do campo já no começo da saída: o teclado do iOS começa a descer junto com a
    // folha, em vez de ficar parado até ela sumir (e a viewport volta ao lugar sem sobras)
    const active = document.activeElement
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) active.blur()
    // com "Reduzir movimento" a saída é só um fade curto (180 ms, ver motion.css)
    const id = window.setTimeout(() => setPhase('closed'), prefersReducedMotion() ? 200 : EXIT_MS + 40)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'open') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [phase, onClose])

  if (phase === 'closed') return null

  const shown = open ? { title, children } : lastShown
  const state = phase === 'open' ? 'open' : 'closing'

  const onDragStart = (e: ReactTouchEvent) => {
    const panel = panelRef.current
    if (!panel) return
    drag.current = { startY: e.touches[0].clientY, startTime: e.timeStamp, dy: 0 }
    panel.style.transition = 'none'
  }

  const onDragMove = (e: ReactTouchEvent) => {
    const gesture = drag.current
    const panel = panelRef.current
    if (!gesture || !panel) return
    gesture.dy = Math.max(0, e.touches[0].clientY - gesture.startY) // só pra baixo
    panel.style.transform = `translate3d(0, ${gesture.dy}px, 0)`
  }

  const onDragEnd = (e: ReactTouchEvent) => {
    const gesture = drag.current
    const panel = panelRef.current
    drag.current = null
    if (!gesture || !panel) return
    const velocity = gesture.dy / Math.max(1, e.timeStamp - gesture.startTime)
    if (gesture.dy > CLOSE_DISTANCE_PX || (velocity > CLOSE_VELOCITY_PX_PER_MS && gesture.dy > 24)) {
      // a saída parte de onde o dedo largou (ver sheet-out em motion.css)
      panel.style.setProperty('--drag-y', `${gesture.dy}px`)
      onClose()
    } else {
      // não passou do limite: volta pro lugar com mola
      panel.style.transition = 'transform 320ms var(--ease-spring)'
      panel.style.transform = ''
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div data-state={state} className="sheet-backdrop absolute inset-0" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={shown.title}
        data-state={state}
        className="surface sheet-panel relative z-10 flex max-h-[88vh] w-full max-w-md flex-col rounded-t-[var(--radius-lg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-8px_32px_var(--shadow)] sm:rounded-[var(--radius-lg)] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_var(--shadow)]"
      >
        {/* zona de arrastar: alcinha + título (fora da área que rola, e sem scroll do navegador) */}
        <div
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onTouchCancel={onDragEnd}
          style={{ touchAction: 'none' }}
          className="shrink-0 px-5 pt-2.5"
        >
          <div className="mx-auto h-1 w-9 rounded-full bg-[var(--border-default)] sm:hidden" />
          <div className="flex items-center justify-between gap-4 pb-3 pt-3">
            <h2 className="font-heading text-lg text-[var(--text-primary)]">{shown.title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="press -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-2)] hover:text-[var(--text-primary)]"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+var(--safe-bottom))] sm:pb-5">{shown.children}</div>
      </div>
    </div>,
    document.body,
  )
}
