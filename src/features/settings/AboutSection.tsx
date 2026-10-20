import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastContext'
import { checkForUpdate, clearCacheAndReload } from '@/utils/appUpdate'

const buildFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Mede em pixels uma medida CSS (env(...), 100vh, 100lvh...) colocando um elemento de teste na tela. */
function measure(property: 'height' | 'padding-top' | 'padding-bottom' | 'padding-left' | 'padding-right', value: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;box-sizing:content-box;${property}:${value}`
  document.body.appendChild(probe)
  const style = getComputedStyle(probe)
  const result = property === 'height' ? probe.getBoundingClientRect().height : parseFloat(style.getPropertyValue(property)) || 0
  probe.remove()
  return Math.round(result * 10) / 10
}

const rectText = (el: Element | null) => {
  if (!el) return '—'
  const r = el.getBoundingClientRect()
  return `${Math.round(r.top)} → ${Math.round(r.bottom)}`
}

function collectInfo(): [string, string][] {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches
  const vv = window.visualViewport
  const shell = document.querySelector('.app-ambient')
  const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.getAttribute('content')
  return [
    ['Modo', standalone ? 'app instalado (tela inicial)' : 'navegador (Safari)'],
    ['Barra de status (meta)', statusMeta ?? '—'],
    ['Tela (screen)', `${screen.width} × ${screen.height} (útil ${screen.availWidth} × ${screen.availHeight})`],
    ['Janela (innerHeight)', `${window.innerWidth} × ${window.innerHeight}`],
    ['Janela externa (outerHeight)', `${window.outerWidth} × ${window.outerHeight}`],
    ['Documento (clientHeight)', String(document.documentElement.clientHeight)],
    ['Área visível (visualViewport)', vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)} (topo ${Math.round(vv.offsetTop)}, zoom ${vv.scale})` : 'indisponível'],
    ['100vh / 100svh / 100lvh / 100dvh', [`100vh`, `100svh`, `100lvh`, `100dvh`].map((unit) => measure('height', unit)).join(' / ')],
    ['Margem de segurança (topo / base)', `${measure('padding-top', 'env(safe-area-inset-top,0px)')} / ${measure('padding-bottom', 'env(safe-area-inset-bottom,0px)')}`],
    ['Margem de segurança (esq. / dir.)', `${measure('padding-left', 'env(safe-area-inset-left,0px)')} / ${measure('padding-right', 'env(safe-area-inset-right,0px)')}`],
    ['Fundo do app (topo → base)', rectText(shell)],
    ['Corpo da página (topo → base)', rectText(document.body)],
    ['Barra de baixo (topo → base)', rectText(document.querySelector('nav'))],
    ['Densidade de pixels', String(window.devicePixelRatio)],
    ['Sistema', navigator.userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? navigator.userAgent.slice(0, 40)],
    ['Service worker', navigator.serviceWorker?.controller ? 'ativo' : 'inativo'],
    ['Versão', new Date(__BUILD_TIME__).toISOString()],
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
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={() => {
              const text = info.map(([label, value]) => `${label}: ${value}`).join('\n')
              void navigator.clipboard.writeText(text).then(
                () => toast.show('Medidas copiadas'),
                () => toast.show('Não foi possível copiar — tire um print'),
              )
            }}
          >
            Copiar medidas
          </Button>
        )}
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
