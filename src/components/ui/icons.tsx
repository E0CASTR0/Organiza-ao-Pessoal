import type { SVGProps } from 'react'

// Ícones de linha simples (24x24, stroke=currentColor) — combinam com o visual "old money" sóbrio.
// Cada ícone recebe as props padrão de <svg> (className, style etc), então herda a cor do texto ao redor.

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  // ícones são decorativos: o nome acessível vem do botão/texto ao redor
  'aria-hidden': true as const,
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8.5 6h12M8.5 12h12M8.5 18h12" />
      <circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10v4M2.5 9v6M20 10v4M21.5 9v6M7 12h10" />
      <rect x="5.5" y="8.5" width="3" height="7" rx="1" />
      <rect x="15.5" y="8.5" width="3" height="7" rx="1" />
    </svg>
  )
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9.5 7V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m20 20-4.6-4.6" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.4-2-3.4-2.2.8a7.6 7.6 0 0 0-2.6-1.5L14.1 2.5h-4l-.4 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.2-.8-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3L2.7 15l2 3.4 2.2-.8a7.6 7.6 0 0 0 2.6 1.5l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2.2.8 2-3.4Z" />
    </svg>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ReceiptIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h12v17l-2.2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20.5Z" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 8.2c-1.6-.1-2.4.9-3.5.9-1.1 0-2.1-.9-3.4-.9-2 0-4.1 1.7-4.1 5 0 3.9 2.9 8.6 4.6 8.6.9 0 1.4-.6 2.9-.6s1.9.6 2.9.6c1.4 0 3.4-3.3 4.1-5.4-2.6-1.1-2.9-4.9.6-6.2-.9-1.4-2.3-2-4.1-2Z" />
      <path d="M13.2 5.3c.5-.7.9-1.6.8-2.6-.9.1-1.9.6-2.5 1.4-.5.6-1 1.6-.8 2.5 1 .1 1.9-.5 2.5-1.3Z" />
    </svg>
  )
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8.5 7.5V5.8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V7.5M3 12.5h18" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5 9 17.5 20 6" />
    </svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  )
}

/** Alça de arrastar (6 pontinhos) — usada pra reordenar listas. */
export function GripIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  )
}

/** Gota (água). */
export function DropIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c3.4 4 6 7 6 10.2a6 6 0 0 1-12 0C6 10.5 8.6 7.5 12 3.5Z" />
    </svg>
  )
}

/** Chama (sequência de dias). */
export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12.2 3c.6 3.2-2.8 4.6-2.8 8a2.6 2.6 0 0 0 5.2 0c0-.9-.3-1.5-.8-2.1 2.4.9 4.2 3 4.2 5.7a6 6 0 0 1-12 0c0-4.6 4.4-6.2 6.2-11.6Z" />
    </svg>
  )
}

/** Relógio. */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 19.5 5.3 15 15.8 4.5a1.8 1.8 0 0 1 2.5 0l1.2 1.2a1.8 1.8 0 0 1 0 2.5L9 18.7l-4.5.8Z" />
      <path d="m14 6.5 3.5 3.5" />
    </svg>
  )
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

/** Notas (folha com linhas). */
export function NoteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h9.5L19 7v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M15 3.5V7h4M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  )
}

/** Cofrinho (Caixinha). */
export function PiggyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5c0-3.3 3-5.5 7-5.5 1.3 0 2.5.2 3.5.7L18.5 6v3.2c.9.9 1.5 2 1.5 3.3 0 .8-.2 1.5-.6 2.1V17a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.6c-.8.2-1.6.3-2.4.3s-1.6-.1-2.4-.3V17a1 1 0 0 1-1 1H8.5a1 1 0 0 1-1-1v-1.8C6 14.5 5 13.6 5 12.5Z" />
      <circle cx="15.5" cy="11" r=".7" fill="currentColor" stroke="none" />
      <path d="M10.5 5.2c.5-.4 1.2-.6 2-.6" />
    </svg>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}
