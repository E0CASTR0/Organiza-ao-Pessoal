import { useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { exportBackup, importBackup } from '@/db/backup'

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleExport = async () => {
    await exportBackup()
    setStatus('Backup exportado.')
    setTimeout(() => setStatus(null), 2500)
  }

  const handleImportConfirmed = async () => {
    if (!pendingFile) return
    try {
      await importBackup(pendingFile)
      setStatus('Backup importado com sucesso.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Não foi possível importar o backup.')
    } finally {
      setPendingFile(null)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-1 font-medium text-[var(--text-primary)]">Backup</h2>
      <p className="mb-3.5 text-sm text-[var(--text-secondary)]">
        Exporte um arquivo com todos os seus dados (inclusive fotos) pra guardar no iCloud ou Google Drive, e importe de volta se trocar de aparelho.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" onClick={() => void handleExport()}>
          Exportar backup
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Importar backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setPendingFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {status && <p className="mt-3 text-sm text-[var(--text-secondary)]">{status}</p>}

      <ConfirmDialog
        open={pendingFile != null}
        title="Importar backup"
        description="Isto substituirá todos os dados atuais pelos dados do arquivo de backup. Essa ação não pode ser desfeita."
        confirmLabel="Importar e substituir"
        danger
        onConfirm={() => void handleImportConfirmed()}
        onCancel={() => setPendingFile(null)}
      />
    </Card>
  )
}
