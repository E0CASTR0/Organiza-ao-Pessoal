import { db, ensureSeedData } from './db'

const BACKUP_MARKER = 'organizacao-pessoal'

interface BackupFile {
  app: typeof BACKUP_MARKER
  schemaVersion: number
  exportedAt: string
  data: Record<string, unknown[]>
}

/** Gera um .json com TODAS as tabelas do banco (itera db.tables dinamicamente, então
 * qualquer tabela nova criada no futuro entra automaticamente no backup) e dispara o download. */
export async function exportBackup(): Promise<void> {
  const data: Record<string, unknown[]> = {}

  await db.transaction('r', db.tables, async () => {
    for (const table of db.tables) {
      data[table.name] = await table.toArray()
    }
  })

  const backup: BackupFile = {
    app: BACKUP_MARKER,
    schemaVersion: db.verno,
    exportedAt: new Date().toISOString(),
    data,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const dateStr = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-organizacao-pessoal-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Lê um arquivo de backup exportado anteriormente e SUBSTITUI todos os dados atuais. */
export async function importBackup(file: File): Promise<void> {
  const text = await file.text()
  let parsed: BackupFile
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Arquivo inválido: não é um JSON válido.')
  }

  if (parsed.app !== BACKUP_MARKER || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('Arquivo inválido: não é um backup deste aplicativo.')
  }

  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      const rows = parsed.data[table.name]
      await table.clear()
      if (Array.isArray(rows) && rows.length > 0) {
        await table.bulkAdd(rows)
      }
    }
  })

  await ensureSeedData()
}

/** Apaga TODOS os dados do app (usado só depois da confirmação com a palavra EXCLUIR). */
export async function resetAll(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear()
    }
  })
  await ensureSeedData()
}
