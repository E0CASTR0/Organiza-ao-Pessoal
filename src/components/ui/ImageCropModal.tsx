import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { loadImageFromFile, cropToBase64 } from '@/utils/image'

const FRAME_SIZE = 280 // tamanho (em px de tela) da moldura de recorte dentro do modal
const MIN_ZOOM = 1
const MAX_ZOOM = 3.5

interface ImageCropModalProps {
  file: File | null
  shape: 'circle' | 'square'
  onCancel: () => void
  onSave: (base64: string) => void
}

/** Ajuste de foto tipo Instagram: arrasta com o dedo pra posicionar, belisca ou usa o
 * controle deslizante pra dar zoom. A moldura mostra exatamente o que vai ser salvo — pra
 * perfil, o guia é redondo (mas o arquivo salvo continua quadrado; o app já mostra a foto
 * de perfil dentro de um círculo via CSS, então não precisa exportar com transparência). */
export function ImageCropModal({ file, shape, onCancel, onSave }: ImageCropModalProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null)

  useEffect(() => {
    if (!file) {
      setImg(null)
      return
    }
    let cancelled = false
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    void loadImageFromFile(file).then((loaded) => {
      if (!cancelled) setImg(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [file])

  // escala "base" que faz a imagem cobrir a moldura inteira no zoom mínimo (equivalente a object-fit: cover)
  const baseScale = useMemo(() => {
    if (!img) return 1
    return Math.max(FRAME_SIZE / img.naturalWidth, FRAME_SIZE / img.naturalHeight)
  }, [img])

  const effectiveScale = baseScale * zoom
  const scaledW = (img?.naturalWidth ?? 0) * effectiveScale
  const scaledH = (img?.naturalHeight ?? 0) * effectiveScale

  function clamp(offsetX: number, offsetY: number, currentZoom: number) {
    const scale = baseScale * currentZoom
    const w = (img?.naturalWidth ?? 0) * scale
    const h = (img?.naturalHeight ?? 0) * scale
    const maxX = Math.max(0, (w - FRAME_SIZE) / 2)
    const maxY = Math.max(0, (h - FRAME_SIZE) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, offsetX)), y: Math.min(maxY, Math.max(-maxY, offsetY)) }
  }

  const handleZoomChange = (nextZoom: number) => {
    setZoom(nextZoom)
    setOffset((prev) => clamp(prev.x, prev.y, nextZoom))
  }

  const distance = (t1: React.Touch, t2: React.Touch) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: distance(e.touches[0], e.touches[1]), startZoom: zoom }
      dragRef.current = null
    } else if (e.touches.length === 1) {
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, originX: offset.x, originY: offset.y }
      pinchRef.current = null
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const ratio = distance(e.touches[0], e.touches[1]) / pinchRef.current.startDist
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchRef.current.startZoom * ratio))
      handleZoomChange(nextZoom)
    } else if (e.touches.length === 1 && dragRef.current) {
      const dx = e.touches[0].clientX - dragRef.current.startX
      const dy = e.touches[0].clientY - dragRef.current.startY
      setOffset(clamp(dragRef.current.originX + dx, dragRef.current.originY + dy, zoom))
    }
  }

  const onTouchEnd = () => {
    dragRef.current = null
    pinchRef.current = null
  }

  // arraste com mouse (desktop) via Pointer Events
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return // touch já é tratado acima
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffset(clamp(dragRef.current.originX + dx, dragRef.current.originY + dy, zoom))
  }
  const onPointerUp = () => {
    dragRef.current = null
  }

  const handleSave = () => {
    if (!img) return
    const sourceWidth = FRAME_SIZE / effectiveScale
    const sourceHeight = FRAME_SIZE / effectiveScale
    const cx = img.naturalWidth / 2
    const cy = img.naturalHeight / 2
    const sourceX = cx - (FRAME_SIZE / 2 + offset.x) / effectiveScale
    const sourceY = cy - (FRAME_SIZE / 2 + offset.y) / effectiveScale
    const base64 = cropToBase64(img, { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight })
    onSave(base64)
  }

  return (
    <Modal open={file != null} onClose={onCancel} title="Ajustar foto">
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative touch-none select-none overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-elevated-2)]"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2"
              style={{
                width: scaledW,
                height: scaledH,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          {shape === 'circle' && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: FRAME_SIZE, height: FRAME_SIZE, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.5)' }}
            />
          )}
        </div>

        <div className="flex w-full items-center gap-3">
          <span className="text-xs text-[var(--text-tertiary)]">−</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
          <span className="text-xs text-[var(--text-tertiary)]">+</span>
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)]">Arraste pra posicionar e belisque (ou use o controle) pra dar zoom</p>

        <div className="flex w-full justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!img}>
            Usar foto
          </Button>
        </div>
      </div>
    </Modal>
  )
}
