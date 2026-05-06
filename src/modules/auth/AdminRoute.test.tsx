import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from './AuthContext';

function makeWrapper(initialPath: string, children: React.ReactNode) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/admin" element={<AdminRoute>{children}</AdminRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  it('renders children when user has ADMIN role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'admin@example.com', role: 'ADMIN' },
      accessToken: 'tok',
      isRefreshing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(makeWrapper('/admin', <p>Admin content</p>));
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects to / when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      accessToken: null,
      isRefreshing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(makeWrapper('/admin', <p>Admin content</p>));
    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('redirects to / when user has USER role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'user@example.com', role: 'USER' },
      accessToken: 'tok',
      isRefreshing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(makeWrapper('/admin', <p>Admin content</p>));
    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });
});
