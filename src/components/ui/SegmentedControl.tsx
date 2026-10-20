import { useLayoutEffect, useRef } from 'react'

interface Segment {
  value: string
  label: string
}

interface SegmentedControlProps {
  segments: Segment[]
  value: string
  onChange: (value: string) => void
}

/** Sub-navegação em pílulas usada dentro dos hubs (ex: Listas -> Prioridades | Compras | Trabalho).
 * A pílula clara que marca a opção ativa é um elemento só que DESLIZA de uma opção pra outra
 * (em vez de acender/apagar cada botão). A posição é escrita direto no estilo do elemento —
 * sem passar pelo React — e acompanha mudanças de largura (ResizeObserver). */
export function SegmentedControl({ segments, value, onChange }: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useLayoutEffect(() => {
    const container = containerRef.current
    const thumb = thumbRef.current
    if (!container || !thumb) return

    const place = (scrollIntoView: boolean) => {
      const active = buttonRefs.current[value]
      if (!active) return
      thumb.style.width = `${active.offsetWidth}px`
      thumb.style.transform = `translate3d(${active.offsetLeft}px, 0, 0)`

      // se a opção ativa ficou cortada (o seletor rola na horizontal), traz ela pra vista
      if (scrollIntoView) {
        const left = active.offsetLeft - 8
        const right = active.offsetLeft + active.offsetWidth + 8
        if (left < container.scrollLeft) container.scrollTo({ left, behavior: 'smooth' })
        else if (right > container.scrollLeft + container.clientWidth) container.scrollTo({ left: right - container.clientWidth, behavior: 'smooth' })
      }
    }

    place(thumb.dataset.ready !== undefined)
    // a primeira posição não anima (a pílula não "voa" do canto ao abrir a tela)
    const frame = requestAnimationFrame(() => {
      thumb.dataset.ready = ''
    })

    const observer = new ResizeObserver(() => place(false))
    observer.observe(container)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [value, segments])

  return (
    // data-hscroll: sinaliza pro gesto de arrastar-entre-abas (AppShell) ignorar arrastos
    // que começam aqui dentro, já que esse elemento tem sua própria rolagem horizontal
    <div
      ref={containerRef}
      data-hscroll
      className="relative flex gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated-1)] p-1"
    >
      <span
        ref={thumbRef}
        aria-hidden="true"
        className="seg-thumb pointer-events-none absolute bottom-1 left-0 top-1 rounded-[10px] bg-[var(--accent)]"
      />
      {segments.map((segment) => (
        <button
          key={segment.value}
          ref={(el) => {
            buttonRefs.current[segment.value] = el
          }}
          type="button"
          onClick={() => onChange(segment.value)}
          className={`press relative z-10 flex-1 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-medium ${
            value === segment.value ? 'text-[var(--accent-contrast)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
