import { useCallback } from 'react'
import { removeAnimated } from '@/utils/motion'
import { restoreLatestFromTrash } from '@/db/repositories/trash.repo'
import { useToast } from './ToastContext'

interface RemoveOptions {
  /** Texto do aviso, ex: "Meta removida". */
  message: string
  /** Nome da tabela e id do registro — usados pelo "Desfazer" pra achar o item na Lixeira. */
  entityType: string
  entityId: string
  remove: () => Promise<void>
}

/** Remove uma linha de lista com a animação de fechar o vão e, logo depois, mostra o aviso
 * "Desfazer". Nada some de vez: o item vai pra Lixeira e o "Desfazer" o traz de volta. */
export function useRemoveWithUndo() {
  const toast = useToast()
  return useCallback(
    async (trigger: HTMLElement, { message, entityType, entityId, remove }: RemoveOptions) => {
      await removeAnimated(trigger, remove)
      toast.show(message, { actionLabel: 'Desfazer', onAction: () => restoreLatestFromTrash(entityType, entityId) })
    },
    [toast],
  )
}
