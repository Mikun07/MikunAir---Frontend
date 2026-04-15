import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apolloClient } from '@shared/api';
import { AuthProvider } from '@modules/auth/AuthContext';
import { ProtectedRoute } from '@modules/auth/ProtectedRoute';
import { AdminRoute } from '@modules/auth/AdminRoute';
import { Spinner } from '@shared/ui';

const HomePage = lazy(() => import('@modules/search').then((m) => ({ default: m.HomePage })));
const SearchResultsPage = lazy(() =>
  import('@modules/search').then((m) => ({ default: m.SearchResultsPage })),
);
const BookingFlow = lazy(() =>
  import('@modules/booking').then((m) => ({ default: m.BookingFlow })),
);
const ConfirmationPage = lazy(() =>
  import('@modules/booking').then((m) => ({ default: m.ConfirmationPage })),
);
const LoginPage = lazy(() =>
  import('@modules/auth').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@modules/auth').then((m) => ({ default: m.RegisterPage })),
);
const ProfilePage = lazy(() =>
  import('@modules/profile').then((m) => ({ default: m.ProfilePage })),
);
const BookingDetailPage = lazy(() =>
  import('@modules/profile').then((m) => ({ default: m.BookingDetailPage })),
);
const AdminPage = lazy(() =>
  import('@modules/admin').then((m) => ({ default: m.AdminPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" label="Loading page…" />
    </div>
  );
}

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/booking" element={<BookingFlow />} />
                <Route path="/booking/confirmation/:ref" element={<ConfirmationPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/bookings/:ref"
                  element={
                    <ProtectedRoute>
                      <BookingDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
