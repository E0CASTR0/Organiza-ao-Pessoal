import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { AgendaPage } from '@/features/agenda/AgendaPage'
import { ListsLayout } from '@/features/lists/ListsLayout'
import { PrioritiesPage } from '@/features/lists/PrioritiesPage'
import { ShoppingPage } from '@/features/lists/ShoppingPage'
import { WorkPage } from '@/features/lists/WorkPage'
import { NotesPage } from '@/features/lists/NotesPage'
import { RoutineLayout } from '@/features/routine/RoutineLayout'
import { WorkoutPage } from '@/features/routine/WorkoutPage'
import { DietPage } from '@/features/routine/DietPage'
import { MorePage } from '@/features/more/MorePage'
import { InvestmentsPage } from '@/features/investments/InvestmentsPage'
import { FixedBillsPage } from '@/features/bills/FixedBillsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TrashPage } from '@/features/trash/TrashPage'
import { SearchPage } from '@/features/search/SearchPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/agenda" element={<AgendaPage />} />

      <Route path="/listas" element={<ListsLayout />}>
        <Route index element={<Navigate to="prioridades" replace />} />
        <Route path="prioridades" element={<PrioritiesPage />} />
        <Route path="compras" element={<ShoppingPage />} />
        <Route path="trabalho" element={<WorkPage />} />
        <Route path="notas" element={<NotesPage />} />
      </Route>

      <Route path="/rotina" element={<RoutineLayout />}>
        <Route index element={<Navigate to="treino" replace />} />
        <Route path="treino" element={<WorkoutPage />} />
        <Route path="dieta" element={<DietPage />} />
      </Route>

      <Route path="/mais" element={<MorePage />} />
      <Route path="/mais/investimentos" element={<InvestmentsPage />} />
      <Route path="/mais/contas-fixas" element={<FixedBillsPage />} />
      <Route path="/mais/perfil" element={<ProfilePage />} />
      <Route path="/mais/configuracoes" element={<SettingsPage />} />
      <Route path="/mais/lixeira" element={<TrashPage />} />
      <Route path="/mais/busca" element={<SearchPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
