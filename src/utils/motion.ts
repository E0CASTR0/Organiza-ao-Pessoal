/** Tempo das saídas animadas (fechar folha, remover item) — igual ao das animações em motion.css. */
export const EXIT_MS = 240

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Remove um item de uma lista com animação: a linha some (esmaece + escorrega pro lado) e
 * fecha o vão, e só então roda `action` (o apagar de verdade). Assim os itens de baixo sobem
 * deslizando em vez de dar um pulo quando a linha some de repente.
 *
 * `trigger` é qualquer elemento de dentro da linha (o botão de lixeira); a linha é o
 * ancestral marcado com `data-row`. Se não achar a linha, ou se o usuário pediu pra reduzir
 * movimento, apaga direto, sem animação. */
export async function removeAnimated(trigger: HTMLElement, action: () => Promise<void> | void): Promise<void> {
  const row = trigger.closest<HTMLElement>('[data-row]')
  if (!row || prefersReducedMotion()) {
    await action()
    return
  }

  // o espaçamento entre as linhas (gap do contêiner) também precisa fechar, senão sobra um vão
  const gap = row.parentElement ? parseFloat(getComputedStyle(row.parentElement).rowGap) || 0 : 0
  const height = row.getBoundingClientRect().height
  row.style.overflow = 'hidden'

  const animation = row.animate(
    [
      { height: `${height}px`, opacity: 1, marginBottom: '0px', transform: 'translate3d(0, 0, 0)' },
      { height: '0px', opacity: 0, marginBottom: `${-gap}px`, transform: 'translate3d(-14px, 0, 0)' },
    ],
    { duration: EXIT_MS, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' },
  )

  try {
    await animation.finished
    await action()
    // sucesso: a linha some da tela sozinha (o banco avisa a lista) — fica fechada até lá
  } catch (error) {
    // algo falhou: devolve a linha ao normal em vez de deixá-la invisível
    animation.cancel()
    row.style.overflow = ''
    throw error
  }
}
