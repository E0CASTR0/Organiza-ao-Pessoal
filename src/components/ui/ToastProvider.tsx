import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastApi, type ToastOptions } from './ToastContext'

interface ToastState extends ToastOptions {
  id: number
  message: string
  leaving: boolean
}

const VISIBLE_MS = 5000
const LEAVE_MS = 220

/** Aviso curto que aparece acima da barra de baixo ("Meta removida · Desfazer"). Mostra um por
 * vez (o novo substitui o antigo) e some sozinho depois de 5 s. Leitores de tela são avisados
 * (role="status"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timers = useRef<number[]>([])
  const nextId = useRef(1)

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }

  const dismiss = useCallback(() => {
    setToast((current) => (current ? { ...current, leaving: true } : current))
    timers.current.push(window.setTimeout(() => setToast(null), LEAVE_MS))
  }, [])

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      clearTimers()
      setToast({ id: nextId.current++, message, leaving: false, ...options })
      timers.current.push(window.setTimeout(dismiss, VISIBLE_MS))
    },
    [dismiss],
  )

  useEffect(() => clearTimers, [])

  const api = useMemo<ToastApi>(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        // acima da barra de baixo (que tem ~66 px) e abaixo das folhas (z-50)
        <div className="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-[45] flex justify-center px-4">
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            data-leaving={toast.leaving}
            className="toast surface surface-raised pointer-events-auto flex max-w-md items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-[var(--text-primary)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]"
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  clearTimers()
                  void toast.onAction?.()
                  dismiss()
                }}
                className="press rounded-full px-3 py-1.5 font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
