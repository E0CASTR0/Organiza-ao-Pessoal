/** Ordem das 5 abas principais — usada pelo arrastar-entre-abas (SwipeView) e pelo
 * indicador da barra de baixo, pra os dois sempre concordarem sobre "qual aba é qual". */
export const TAB_ORDER = ['/', '/agenda', '/listas', '/rotina', '/mais']

/** Índice da aba a que um caminho pertence (rotas internas, tipo /mais/perfil, contam como
 * a aba "Mais"). */
export function currentTabIndex(pathname: string): number {
  const sorted = [...TAB_ORDER].sort((a, b) => b.length - a.length)
  const match = sorted.find((tab) => (tab === '/' ? pathname === '/' : pathname.startsWith(tab)))
  return TAB_ORDER.indexOf(match ?? '/')
}
