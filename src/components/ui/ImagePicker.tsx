import { useRef, useState } from 'react'
import { fileToResizedBase64 } from '@/utils/image'

interface ImagePickerProps {
  value: string | null
  onChange: (base64: string | null) => void
  shape?: 'square' | 'circle'
  size?: number
}

export function ImagePicker({ value, onChange, shape = 'square', size = 88 }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setLoading(true)
    try {
      const base64 = await fileToResizedBase64(file)
      onChange(base64)
    } catch {
      // silenciosamente ignora — o usuário pode tentar de novo
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ width: size, height: size }}
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated-2)] text-[var(--text-tertiary)] ${
          shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius-md)]'
        }`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">＋</span>
        )}
        {loading && <span className="absolute inset-0 flex items-center justify-center bg-[var(--overlay)] text-xs text-[var(--text-primary)]">...</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <div className="flex flex-col gap-1">
        <button type="button" onClick={() => inputRef.current?.click()} className="text-left text-sm text-[var(--accent)] hover:text-[var(--accent-strong)]">
          {value ? 'Trocar imagem' : 'Adicionar imagem'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-left text-sm text-[var(--text-tertiary)] hover:text-[var(--danger)]">
            Remover
          </button>
        )}
      </div>
    </div>
  )
}
