import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { NoteIcon } from '@/components/ui/icons'
import { NotesList } from './NotesList'

/** Notas como página própria (Mais > Notas), separada da aba de Listas. */
export function NotesStandalonePage() {
  return (
    <div className="reveal flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader title="Notas" subtitle="Suas anotações, do jeito do iPhone" icon={<NoteIcon width={20} height={20} />} />
      <div data-no-reveal>
        <NotesList base="/mais/notas" />
      </div>
    </div>
  )
}
