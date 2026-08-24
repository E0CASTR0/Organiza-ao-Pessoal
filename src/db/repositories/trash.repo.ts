import { db } from '../db'
import type { TrashItem } from '../models'

/** Move um registro pra lixeira antes de removê-lo da tabela original — chamado pelos
 * outros repositórios em vez de um delete direto, garantindo que nada some de vez sem passar
 * pela Lixeira (Configurações > Lixeira), onde dá pra restaurar ou excluir definitivamente. */
export async function moveToTrash(entityType: string, entityId: string, label: string, payload: unknown): Promise<void> {
  const item: TrashItem = {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    label,
    payload,
    deletedAt: new Date().toISOString(),
  }
  await db.trashItems.add(item)
}

export function listTrash() {
  return db.trashItems.orderBy('deletedAt').reverse().toArray()
}

export async function restoreTrashItem(trashId: string): Promise<void> {
  const item = await db.trashItems.get(trashId)
  if (!item) return
  const table = db.table(item.entityType)
  await table.add(item.payload)
  await db.trashItems.delete(trashId)
}

export async function purgeTrashItem(trashId: string): Promise<void> {
  await db.trashItems.delete(trashId)
}

export async function purgeAllTrash(): Promise<void> {
  await db.trashItems.clear()
}
