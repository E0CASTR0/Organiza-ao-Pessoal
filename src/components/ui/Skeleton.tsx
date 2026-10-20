/** Bloco de carregamento (esqueleto) — mesmo tamanho do conteúdo que vai ocupar o lugar. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-[var(--radius-md)] ${className}`} />
}
