import { NotesList } from './NotesList'

/** Notas dentro de Listas (a aba "Notas"). A mesma lista também existe em Mais > Notas. */
export function NotesPage() {
  return <NotesList base="/listas/notas" />
}
