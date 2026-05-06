import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from './AuthContext';

function makeWrapper(initialPath: string, children: React.ReactNode) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth/login" element={<p>Login page</p>} />
        <Route path="/protected" element={<ProtectedRoute>{children}</ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'test@example.com', role: 'USER' },
      accessToken: 'tok',
      isRefreshing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(makeWrapper('/protected', <p>Protected content</p>));
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /auth/login when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      accessToken: null,
      isRefreshing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(makeWrapper('/protected', <p>Protected content</p>));
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
