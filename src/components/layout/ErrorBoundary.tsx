import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Rede de segurança: se algum erro escapar durante a renderização de uma tela, mostra
 * uma mensagem com botão de recarregar em vez de deixar a tela toda preta/em branco. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Erro capturado pelo ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-base)] p-6 text-center">
          <p className="font-[var(--font-heading)] text-xl text-[var(--text-primary)]">Algo deu errado</p>
          <p className="max-w-xs text-sm text-[var(--text-secondary)]">
            Nenhum dado foi perdido. Tenta recarregar — se continuar acontecendo, me avisa o que você estava fazendo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2.5 font-medium text-[var(--accent-contrast)]"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
