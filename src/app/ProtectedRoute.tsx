import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
