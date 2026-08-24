import { UserIcon } from './icons'

interface AvatarProps {
  photoBase64: string | null | undefined
  size?: number
}

export function Avatar({ photoBase64, size = 48 }: AvatarProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated-3)] text-[var(--text-tertiary)]"
    >
      {photoBase64 ? (
        <img src={photoBase64} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserIcon width={size * 0.5} height={size * 0.5} />
      )}
    </span>
  )
}
