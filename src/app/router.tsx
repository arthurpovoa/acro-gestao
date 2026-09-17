import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/app/layout/AppLayout';
import { ProtectedRoute } from '@/app/ProtectedRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage'));
const ClientDetailPage = lazy(() => import('@/features/clients/pages/ClientDetailPage'));
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage'));
const ContractsPage = lazy(() => import('@/features/contracts/pages/ContractsPage'));
const ChargesPage = lazy(() => import('@/features/charges/pages/ChargesPage'));
const TransactionsPage = lazy(() => import('@/features/transactions/pages/TransactionsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

function PageFallback() {
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Carregando...
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/painel" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/clientes/:id" element={<ClientDetailPage />} />
          <Route path="/projetos" element={<ProjectsPage />} />
          <Route path="/mensalidades" element={<ContractsPage />} />
          <Route path="/cobrancas" element={<ChargesPage />} />
          <Route path="/financeiro" element={<TransactionsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/painel" replace />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Routes>
    </Suspense>
  );
}
