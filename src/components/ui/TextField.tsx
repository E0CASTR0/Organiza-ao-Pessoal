import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const fieldClasses =
  'w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated-1)] px-3.5 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]'

export function TextField({ label, className = '', id, ...rest }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
      <input id={id} className={`${fieldClasses} ${className}`} {...rest} />
    </label>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, className = '', id, rows = 4, ...rest }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
      <textarea id={id} rows={rows} className={`${fieldClasses} resize-y ${className}`} {...rest} />
    </label>
  )
}
