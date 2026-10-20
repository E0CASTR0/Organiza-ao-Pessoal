import { createContext, useContext } from 'react'

export interface ToastOptions {
  /** Texto do botão de ação do aviso (ex: "Desfazer"). */
  actionLabel?: string
  onAction?: () => void | Promise<void>
}

export interface ToastApi {
  show: (message: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastApi>({ show: () => {} })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}
