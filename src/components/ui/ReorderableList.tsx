import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ReorderableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (orderedIds: string[]) => void
  /** Recebe o item e a função pra "grudar" no elemento que serve de alça de arrastar
   * (normalmente um ícone) via onTouchStart. */
  renderItem: (item: T, dragHandleProps: { onTouchStart: (e: React.TouchEvent) => void }, dragging: boolean) => ReactNode
  /** Altura aproximada de uma linha (px) — só é usada se não for possível medir no DOM. */
  rowHeight: number
  /** Espaçamento entre as linhas, como classe `gap-*` do Tailwind (padrão: gap-3). */
  gapClass?: string
}

interface DragState {
  id: string
  startIndex: number
  /** Distância real de uma linha pra seguinte (altura + espaçamento), medida no DOM. */
  pitch: number
}

function moveItem(list: string[], from: number, to: number): string[] {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Lista com arrastar-pra-reordenar via uma alça dedicada (não a linha toda) — assim não
 * conflita com scroll normal nem com o gesto de trocar de aba: só começa a arrastar quem
 * tocar exatamente na alcinha.
 *
 * Durante o arrasto a ORDEM DO DOM não muda: a linha arrastada acompanha o dedo e as que ela
 * vai "empurrando" deslizam um passo pra cima/baixo (só `transform`, com transição). Só ao
 * soltar a nova ordem é gravada e o DOM é reorganizado — nesse instante cada linha já está
 * exatamente onde vai ficar, então não há pulo. (Mover nós do DOM no meio do arrasto
 * reiniciaria animações CSS e faria a linha escapar do dedo.)
 *
 * Cada linha é marcada com `data-row` (usado pela animação de remover) e, quando um item
 * NOVO entra na lista, ele aparece com `item-in`. */
export function ReorderableList<T extends { id: string }>({ items, onReorder, renderItem, rowHeight, gapClass = 'gap-3' }: ReorderableListProps<T>) {
  const [order, setOrder] = useState<string[]>(() => items.map((i) => i.id))
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const startY = useRef(0)
  const offsetRef = useRef(0)
  const draggingRef = useRef(false)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  // ids que já foram exibidos — começa com os da primeira renderização (esses entram junto
  // com a tela, não precisam da animação individual)
  const seenIds = useRef(new Set(items.map((i) => i.id)))

  // ressincroniza com o banco quando os itens mudarem de fora (nova meta, exclusão, ordem
  // gravada) — nunca no meio de um arrasto, senão a lista pula embaixo do dedo. Depende só de
  // `items` (não do estado de arrasto): ao soltar, a ordem local já é a nova, e ressincronizar
  // com o `items` ainda antigo faria a lista dar um pulo pra trás até o banco responder.
  useEffect(() => {
    if (!draggingRef.current) setOrder(items.map((i) => i.id))
  }, [items])

  useEffect(() => {
    for (const item of items) seenIds.current.add(item.id)
  })

  const dragId = drag?.id
  useEffect(() => {
    if (!drag) return
    const { startIndex, pitch } = drag
    const minOffset = -startIndex * pitch
    const maxOffset = (order.length - 1 - startIndex) * pitch

    const onMove = (e: TouchEvent) => {
      e.preventDefault()
      const raw = e.touches[0].clientY - startY.current
      const clamped = Math.min(maxOffset, Math.max(minOffset, raw)) // a linha não sai pra fora da lista
      offsetRef.current = clamped
      setDragOffset(clamped)
    }

    const onEnd = () => {
      draggingRef.current = false
      const target = Math.min(order.length - 1, Math.max(0, startIndex + Math.round(offsetRef.current / pitch)))
      setDrag(null)
      setDragOffset(0)
      if (target !== startIndex) {
        const next = moveItem(order, startIndex, target)
        setOrder(next)
        onReorder(next)
      }
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só precisa reagir ao início/fim de um arrasto
  }, [dragId])

  /** Distância real (px) de uma linha pra seguinte, medida no DOM — inclui o espaçamento.
   * Um valor fixo errado faria a linha arrastada "escapar" do dedo em listas longas. */
  const measurePitch = (id: string): number => {
    const row = rowRefs.current.get(id)
    if (!row) return rowHeight
    const neighbor = row.nextElementSibling ?? row.previousElementSibling
    if (neighbor instanceof HTMLElement) return Math.abs(neighbor.offsetTop - row.offsetTop) || row.offsetHeight || rowHeight
    return row.offsetHeight || rowHeight
  }

  const byId = new Map(items.map((i) => [i.id, i]))
  const target = drag ? Math.min(order.length - 1, Math.max(0, drag.startIndex + Math.round(dragOffset / drag.pitch))) : -1

  return (
    <div className={`flex flex-col ${gapClass}`}>
      {order.map((id, index) => {
        const item = byId.get(id)
        if (!item) return null
        const isDragging = drag?.id === id
        const isNew = !seenIds.current.has(id)

        // quanto cada linha está deslocada agora: a arrastada segue o dedo, as que ela já
        // ultrapassou abrem espaço (sobem ou descem um passo)
        let shift = 0
        if (drag && !isDragging) {
          if (drag.startIndex < target && index > drag.startIndex && index <= target) shift = -drag.pitch
          else if (target < drag.startIndex && index >= target && index < drag.startIndex) shift = drag.pitch
        }
        const translate = isDragging ? dragOffset : shift

        return (
          <div
            key={id}
            data-row
            ref={(el) => {
              if (el) rowRefs.current.set(id, el)
              else rowRefs.current.delete(id)
            }}
            className={isNew ? 'item-in' : undefined}
            style={{
              transform: isDragging ? `translate3d(0, ${translate}px, 0) scale(1.02)` : shift ? `translate3d(0, ${translate}px, 0)` : undefined,
              // a arrastada acompanha o dedo sem atraso; as vizinhas deslizam suave; ao soltar
              // tudo volta sem transição (o DOM já foi reorganizado, não há o que animar)
              transition: !drag || isDragging ? 'none' : 'transform 200ms var(--ease-spring)',
              position: isDragging ? 'relative' : undefined,
              zIndex: isDragging ? 10 : undefined,
            }}
          >
            {renderItem(
              item,
              {
                onTouchStart: (e) => {
                  startY.current = e.touches[0].clientY
                  offsetRef.current = 0
                  draggingRef.current = true
                  setDragOffset(0)
                  setDrag({ id, startIndex: index, pitch: measurePitch(id) })
                },
              },
              isDragging,
            )}
          </div>
        )
      })}
    </div>
  )
}
