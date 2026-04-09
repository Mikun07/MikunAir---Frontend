import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, consentGiven: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null });
  const initialRefreshDone = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
        '/auth/refresh',
      );
      setAccessToken(data.accessToken);
      setState({ user: data.user, accessToken: data.accessToken });
    } catch {
      setAccessToken(null);
      setState({ user: null, accessToken: null });
    }
  }, []);

  useEffect(() => {
    if (initialRefreshDone.current) return;
    initialRefreshDone.current = true;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      setState({ user: null, accessToken: null });
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
      '/auth/login',
      { email, password },
    );
    setAccessToken(data.accessToken);
    setState({ user: data.user, accessToken: data.accessToken });
  }, []);

  const register = useCallback(
    async (email: string, password: string, consentGiven: boolean) => {
      const { data } = await axiosClient.post<{ accessToken: string; user: UserPublicDTO }>(
        '/auth/register',
        { email, password, consentGiven },
      );
      setAccessToken(data.accessToken);
      setState({ user: data.user, accessToken: data.accessToken });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setState({ user: null, accessToken: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
