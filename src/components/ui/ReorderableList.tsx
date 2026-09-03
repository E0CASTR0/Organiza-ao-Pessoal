import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ReorderableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (orderedIds: string[]) => void
  /** Recebe o item e a função pra "grudar" no elemento que serve de alça de arrastar
   * (normalmente um ícone) via onTouchStart. */
  renderItem: (item: T, dragHandleProps: { onTouchStart: (e: React.TouchEvent) => void }, dragging: boolean) => ReactNode
  rowHeight: number
}

/** Lista com arrastar-pra-reordenar via uma alça dedicada (não a linha toda) — assim não
 * conflita com scroll normal nem com o gesto de trocar de aba: só começa a arrastar quem
 * tocar exatamente na alcinha. Enquanto arrasta, os outros itens vão pulando de lugar em
 * tempo real; ao soltar, grava a ordem final. */
export function ReorderableList<T extends { id: string }>({ items, onReorder, renderItem, rowHeight }: ReorderableListProps<T>) {
  const [order, setOrder] = useState<string[]>(() => items.map((i) => i.id))
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const dragInfo = useRef<{ id: string; startY: number; startIndex: number } | null>(null)

  // ressincroniza com o banco sempre que os itens mudarem de fora (nova meta, exclusão
  // etc) — mas nunca no meio de um arrasto, senão a lista pula embaixo do dedo
  useEffect(() => {
    if (!draggingId) setOrder(items.map((i) => i.id))
  }, [items, draggingId])

  useEffect(() => {
    if (!draggingId) return

    const onMove = (e: TouchEvent) => {
      if (!dragInfo.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const deltaY = touch.clientY - dragInfo.current.startY
      setDragOffset(deltaY)

      const deltaIndex = Math.round(deltaY / rowHeight)
      const targetIndex = Math.min(order.length - 1, Math.max(0, dragInfo.current.startIndex + deltaIndex))
      setOrder((prev) => {
        const currentIndex = prev.indexOf(dragInfo.current!.id)
        if (currentIndex === targetIndex) return prev
        const next = [...prev]
        next.splice(currentIndex, 1)
        next.splice(targetIndex, 0, dragInfo.current!.id)
        return next
      })
    }

    const onEnd = () => {
      dragInfo.current = null
      setDraggingId(null)
      setDragOffset(0)
      setOrder((current) => {
        onReorder(current)
        return current
      })
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só precisa reagir a draggingId mudar
  }, [draggingId])

  const byId = new Map(items.map((i) => [i.id, i]))

  return (
    <div className="flex flex-col gap-3">
      {order.map((id) => {
        const item = byId.get(id)
        if (!item) return null
        const isDragging = draggingId === id
        return (
          <div
            key={id}
            style={{
              transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
              transition: isDragging ? 'none' : 'transform 150ms ease',
              position: isDragging ? 'relative' : undefined,
              zIndex: isDragging ? 10 : undefined,
              opacity: isDragging ? 0.9 : 1,
            }}
          >
            {renderItem(
              item,
              {
                onTouchStart: (e) => {
                  const touch = e.touches[0]
                  dragInfo.current = { id, startY: touch.clientY, startIndex: order.indexOf(id) }
                  setDraggingId(id)
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
