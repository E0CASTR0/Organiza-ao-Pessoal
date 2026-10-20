import { Fragment, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastContext'
import { CopyIcon, PencilIcon, TrashIcon } from '@/components/ui/icons'
import { getNote, removeNote } from '@/db/repositories/notes.repo'
import { restoreLatestFromTrash } from '@/db/repositories/trash.repo'
import { NoteFormModal } from './NoteFormModal'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const URL_PATTERN = /(https?:\/\/[^\s<]+)/g

/** Deixa os endereços (https://…) clicáveis, sem mexer no resto do texto. */
function linkify(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-[var(--accent)] underline underline-offset-2">
        {part}
      </a>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

/** Tela de LEITURA de uma nota (como o app Notas do iPhone): mostra o título e o texto salvos,
 * sem nenhum campo aberto pra edição — pra mexer, toca em "Editar". */
export function NoteViewPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const base = pathname.startsWith('/mais') ? '/mais/notas' : '/listas/notas'

  // `loaded` diferencia "ainda carregando" de "essa nota não existe (mais)"
  const result = useLiveQuery(async () => ({ note: id ? await getNote(id) : undefined }), [id])
  const note = result?.note

  const handleCopy = async () => {
    if (!note) return
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`.trim())
      toast.show('Texto copiado')
    } catch {
      toast.show('Não foi possível copiar')
    }
  }

  const handleDelete = async () => {
    if (!note) return
    const noteId = note.id
    await removeNote(noteId)
    toast.show('Nota excluída', { actionLabel: 'Desfazer', onAction: () => restoreLatestFromTrash('notes', noteId) })
    navigate(base, { replace: true })
  }

  if (!result) {
    return (
      <div className="flex flex-col gap-4">
        <BackHeader title="Notas" to={base} />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="reveal flex flex-col gap-4">
        <BackHeader title="Notas" to={base} />
        <EmptyState title="Essa nota não existe mais" description="Ela pode ter sido excluída. Veja na Lixeira se quiser recuperar." actionLabel="Voltar pras notas" onAction={() => navigate(base, { replace: true })} />
      </div>
    )
  }

  return (
    <div className="reveal flex flex-col gap-5">
      <BackHeader title="Notas" to={base} />

      <article className="flex flex-col gap-1">
        <h1 className="font-heading break-words text-[1.7rem] font-semibold leading-tight text-[var(--text-primary)]">{note.title || 'Nota sem título'}</h1>
        <p className="text-sm text-[var(--text-tertiary)]">Editada em {dateFormatter.format(new Date(note.updatedAt))}</p>
        {note.content.trim() ? (
          <div className="mt-4 select-text whitespace-pre-wrap break-words text-[1.04rem] leading-[1.65] text-[var(--text-primary)]">{linkify(note.content)}</div>
        ) : (
          <p className="mt-4 text-[var(--text-tertiary)]">Esta nota não tem texto. Toque em Editar pra escrever.</p>
        )}
      </article>

      <div className="flex flex-wrap gap-2.5">
        <Button onClick={() => setEditing(true)}>
          <PencilIcon width={16} height={16} />
          Editar
        </Button>
        <Button variant="secondary" onClick={() => void handleCopy()}>
          <CopyIcon width={16} height={16} />
          Copiar
        </Button>
        <Button variant="ghost" onClick={() => void handleDelete()}>
          <TrashIcon width={16} height={16} />
          Excluir
        </Button>
      </div>

      <NoteFormModal open={editing} onClose={() => setEditing(false)} editing={note} />
    </div>
  )
}
