import { useRef, useState } from 'react'
import { ImageCropModal } from './ImageCropModal'

interface ImagePickerProps {
  value: string | null
  onChange: (base64: string | null) => void
  shape?: 'square' | 'circle'
  size?: number
}

export function ImagePicker({ value, onChange, shape = 'square', size = 88 }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

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
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">＋</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setPendingFile(file)
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

      <ImageCropModal
        file={pendingFile}
        shape={shape === 'circle' ? 'circle' : 'square'}
        onCancel={() => setPendingFile(null)}
        onSave={(base64) => {
          onChange(base64)
          setPendingFile(null)
        }}
      />
    </div>
  )
}
