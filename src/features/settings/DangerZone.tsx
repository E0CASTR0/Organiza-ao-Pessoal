import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { resetAll } from '@/db/backup'

const CONFIRM_WORD = 'EXCLUIR'

type Step = 'idle' | 'confirming' | 'typing'

export function DangerZone() {
  const [step, setStep] = useState<Step>('idle')
  const [typedWord, setTypedWord] = useState('')
  const [done, setDone] = useState(false)

  const close = () => {
    setStep('idle')
    setTypedWord('')
  }

  const handleReset = async () => {
    if (typedWord !== CONFIRM_WORD) return
    await resetAll()
    close()
    setDone(true)
  }

  return (
    <Card className="border-[var(--danger)]/40 p-4">
      <h2 className="mb-1 font-medium text-[var(--danger)]">Zona de perigo</h2>
      <p className="mb-3.5 text-sm text-[var(--text-secondary)]">
        Isso apaga permanentemente todos os dados do app neste dispositivo — metas, agenda, investimentos, treino, dieta, tudo. Não tem como desfazer. Exporte um backup antes, se
        quiser.
      </p>
      <Button variant="danger" onClick={() => setStep('confirming')}>
        Resetar aplicativo
      </Button>
      {done && <p className="mt-2.5 text-sm text-[var(--text-secondary)]">Aplicativo resetado.</p>}

      <Modal open={step === 'confirming'} onClose={close} title="Tem certeza?">
        <p className="mb-5 text-[var(--text-secondary)]">
          Isso apaga <strong>tudo</strong> permanentemente: agenda, metas, investimentos, treino, dieta, compras, contas fixas e perfil. Recomendamos exportar um backup antes de
          continuar.
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => setStep('typing')}>
            Continuar
          </Button>
        </div>
      </Modal>

      <Modal open={step === 'typing'} onClose={close} title="Confirme digitando EXCLUIR">
        <p className="mb-3.5 text-[var(--text-secondary)]">
          Pra confirmar, digite <strong>EXCLUIR</strong> (em maiúsculas) no campo abaixo.
        </p>
        <TextField value={typedWord} onChange={(e) => setTypedWord(e.target.value)} placeholder="EXCLUIR" autoFocus className="mb-5" />
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={typedWord !== CONFIRM_WORD} onClick={() => void handleReset()}>
            Apagar tudo
          </Button>
        </div>
      </Modal>
    </Card>
  )
}
