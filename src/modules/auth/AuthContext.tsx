import type {
  ReactNode} from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { axiosClient, setAccessToken, registerUnauthenticatedHandler } from '@shared/api';

export interface UserPublicDTO {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: UserPublicDTO | null;
  accessToken: string | null;
  isRefreshing: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, consentGiven: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, isRefreshing: true });
  const initialRefreshDone = useRef(false);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));
    try {
      const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
        '/auth/refresh',
      );
      setAccessToken(data.accessToken);
      setState({ user: data.user, accessToken: data.accessToken, isRefreshing: false });
    } catch {
      setAccessToken(null);
      setState({ user: null, accessToken: null, isRefreshing: false });
    }
  }, []);

  useEffect(() => {
    if (initialRefreshDone.current) return;
    initialRefreshDone.current = true;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      setAccessToken(null);
      setState({ user: null, accessToken: null, isRefreshing: false });
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
      '/auth/login',
      { email, password },
    );
    setAccessToken(data.accessToken);
    setState({ user: data.user, accessToken: data.accessToken, isRefreshing: false });
  }, []);

  const register = useCallback(
    async (email: string, password: string, consentGiven: boolean) => {
      const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
        '/auth/register',
        { email, password, consentGiven },
      );
      setAccessToken(data.accessToken);
      setState({ user: data.user, accessToken: data.accessToken, isRefreshing: false });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setState({ user: null, accessToken: null, isRefreshing: false });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, refresh }),
    [state, login, register, logout, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
