declare const process:
  | {
      env?: {
        EXPO_PUBLIC_API_BASE_URL?: string;
      };
    }
  | undefined;

const fallbackApiBaseUrl = 'http://10.236.43.53/baquiz-api/public/api';

export const API_BASE_URL =
  process?.env?.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? fallbackApiBaseUrl;

export const API_ENDPOINTS = {
  stats: {
    quizzes: '/clashs',
    members: '/users/histories/period?period=monthly',
    challenges: '/users/medals',
  },
  auth: {
    login: '/users/login',
    register: '/users',
  },
  passwordReset: {
    findUser: '/password-resets/find-user',
    checkToken: '/password-resets/check-token',
    update: (id: string | number) => `/password-resets/${id}`,
  },
} as const;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.message ?? data?.error ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data as T;
}
