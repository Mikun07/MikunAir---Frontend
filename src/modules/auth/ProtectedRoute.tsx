import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '@shared/ui';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isRefreshing } = useAuth();
  const location = useLocation();

  if (isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ returnTo: location.pathname }} replace />;
  }

  return <>{children}</>;
}
