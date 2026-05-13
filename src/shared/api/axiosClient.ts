import axios from 'axios';

const BASE_URL = `${(import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'}/api/v1`;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let _accessToken: string | null = null;
let _onUnauthenticated: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function registerUnauthenticatedHandler(handler: () => void) {
  _onUnauthenticated = handler;
}

axiosClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retried?: boolean };

    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error as Error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        pendingRequests.push(resolve);
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = data.accessToken;
      setAccessToken(newToken);
      pendingRequests.forEach((resolve) => resolve(newToken));
      pendingRequests = [];
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    } catch {
      pendingRequests = [];
      setAccessToken(null);
      _onUnauthenticated?.();
      return Promise.reject(error as Error);
    } finally {
      isRefreshing = false;
    }
  },
);
