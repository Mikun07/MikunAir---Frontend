import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

let capturedUnauthHandler: (() => void) | null = null;

vi.mock('@shared/api', () => ({
  axiosClient: {
    post: vi.fn(),
  },
  setAccessToken: vi.fn(),
  registerUnauthenticatedHandler: vi.fn((handler: () => void) => {
    capturedUnauthHandler = handler;
  }),
}));

import { axiosClient, setAccessToken } from '@shared/api';

function TestConsumer() {
  const { user, accessToken, isRefreshing, login, logout, register } = useAuth();
  return (
    <div>
      <p data-testid="email">{user?.email ?? 'none'}</p>
      <p data-testid="token">{accessToken ?? 'none'}</p>
      <p data-testid="refreshing">{String(isRefreshing)}</p>
      <button onClick={() => void login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => void logout()}>Logout</button>
      <button onClick={() => void register('new@example.com', 'password123', true)}>Register</button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(axiosClient.post).mockResolvedValue({
    data: { accessToken: null, user: null },
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  it('starts with null user and token', async () => {
    render(<TestConsumer />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('email').textContent).toBe('none');
      expect(screen.getByTestId('token').textContent).toBe('none');
    });
  });

  it('login() stores user and access token', async () => {
    vi.mocked(axiosClient.post).mockResolvedValue({
      data: {
        accessToken: 'tok-abc',
        user: { id: 'u1', email: 'test@example.com', role: 'USER' },
      },
    });

    render(<TestConsumer />, { wrapper: Wrapper });

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('email').textContent).toBe('test@example.com');
    expect(screen.getByTestId('token').textContent).toBe('tok-abc');
    expect(setAccessToken).toHaveBeenCalledWith('tok-abc');
  });

  it('logout() clears user and token', async () => {
    vi.mocked(axiosClient.post)
      .mockResolvedValueOnce({ data: { accessToken: null, user: null } }) // refresh on mount
      .mockResolvedValueOnce({
        data: { accessToken: 'tok-abc', user: { id: 'u1', email: 'test@example.com', role: 'USER' } },
      }) // login
      .mockResolvedValueOnce({}); // logout

    render(<TestConsumer />, { wrapper: Wrapper });

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('email').textContent).toBe('test@example.com');

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('email').textContent).toBe('none');
    expect(screen.getByTestId('token').textContent).toBe('none');
    expect(setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it('register() stores user and access token', async () => {
    vi.mocked(axiosClient.post)
      .mockResolvedValueOnce({ data: { accessToken: null, user: null } }) // refresh on mount
      .mockResolvedValueOnce({
        data: { accessToken: 'tok-new', user: { id: 'u2', email: 'new@example.com', role: 'USER' } },
      }); // register

    render(<TestConsumer />, { wrapper: Wrapper });

    await act(async () => {
      await userEvent.click(screen.getByText('Register'));
    });

    expect(screen.getByTestId('email').textContent).toBe('new@example.com');
    expect(screen.getByTestId('token').textContent).toBe('tok-new');
    expect(setAccessToken).toHaveBeenCalledWith('tok-new');
  });

  it('clears auth state when refresh on mount fails', async () => {
    vi.mocked(axiosClient.post).mockRejectedValueOnce(new Error('Network error'));

    render(<TestConsumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(setAccessToken).toHaveBeenCalledWith(null);
    });
    expect(screen.getByTestId('email').textContent).toBe('none');
  });

  it('clears auth state when unauthenticated handler fires', async () => {
    vi.mocked(axiosClient.post)
      .mockResolvedValueOnce({ data: { accessToken: null, user: null } }) // refresh on mount
      .mockResolvedValueOnce({
        data: { accessToken: 'tok-abc', user: { id: 'u1', email: 'test@example.com', role: 'USER' } },
      }); // login

    render(<TestConsumer />, { wrapper: Wrapper });

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });
    expect(screen.getByTestId('email').textContent).toBe('test@example.com');

    act(() => {
      capturedUnauthHandler?.();
    });

    expect(screen.getByTestId('email').textContent).toBe('none');
  });
});
