import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { checkForUpdate, clearCacheAndReload } from '@/utils/appUpdate'

const buildFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function readInsets(): { top: number; bottom: number } {
  // lê o env(safe-area-inset-*) de verdade, medindo um elemento temporário
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'
  document.body.appendChild(probe)
  const style = getComputedStyle(probe)
  const result = { top: parseFloat(style.paddingTop) || 0, bottom: parseFloat(style.paddingBottom) || 0 }
  probe.remove()
  return result
}

function collectInfo(): [string, string][] {
  const nav = document.querySelector('nav')?.getBoundingClientRect()
  const insets = readInsets()
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches
  const vv = window.visualViewport
  return [
    ['Modo', standalone ? 'app instalado (tela inicial)' : 'navegador (Safari)'],
    ['Janela (innerWidth × innerHeight)', `${window.innerWidth} × ${window.innerHeight}`],
    ['Tela (screen)', `${screen.width} × ${screen.height}`],
    ['Área visível (visualViewport)', vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)}` : 'indisponível'],
    ['Margem de segurança (topo / base)', `${Math.round(insets.top)} / ${Math.round(insets.bottom)} px`],
    ['Barra de baixo (topo → base)', nav ? `${Math.round(nav.top)} → ${Math.round(nav.bottom)}` : '—'],
    ['Densidade de pixels', String(window.devicePixelRatio)],
    ['Service worker', navigator.serviceWorker?.controller ? 'ativo' : 'inativo'],
  ]
}

/** Versão do app, botões de atualização e, escondido, os números da tela (pra eu conseguir
 * entender o que o iPhone está medindo se algo parecer fora do lugar). */
export function AboutSection() {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState<[string, string][] | null>(null)

  const handleUpdate = async () => {
    setBusy(true)
    try {
      const result = await checkForUpdate()
      if (result === 'current') toast.show('Você já está na versão mais recente')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div>
        <h2 className="font-medium text-[var(--text-primary)]">Sobre o app</h2>
        <p className="text-sm text-[var(--text-tertiary)]">Versão gerada em {buildFormatter.format(new Date(__BUILD_TIME__))}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => void handleUpdate()}>
          {busy ? 'Procurando…' : 'Buscar atualização'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void clearCacheAndReload()}>
          Limpar cache e recarregar
        </Button>
      </div>
      <p className="text-xs text-[var(--text-tertiary)]">Limpar o cache não apaga nada seu — metas, notas e agenda ficam guardadas no aparelho.</p>

      <details
        className="text-sm"
        onToggle={(e) => {
          if ((e.currentTarget as HTMLDetailsElement).open) setInfo(collectInfo())
        }}
      >
        <summary className="cursor-pointer text-[var(--text-tertiary)]">Informações da tela</summary>
        {info && (
          <dl className="mt-2 flex flex-col gap-1.5">
            {info.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-t border-[var(--border-subtle)] pt-1.5">
                <dt className="text-[var(--text-tertiary)]">{label}</dt>
                <dd className="text-right tabular-nums text-[var(--text-primary)]">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </details>
    </Card>
  )
}
