import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { API_URL, USE_MOCK_API, env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/token-storage';
import { mockAdapter } from './mock/mock-adapter';
import type { ApiError, DrfErrorPayload } from './types';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Backend tayyor bo'lmaguncha so'rovlar mock adapter orqali bajariladi.
if (USE_MOCK_API) {
  api.defaults.adapter = mockAdapter;
  console.info(
    "%c[mock-api] Demo rejim *yoqilgan*. O'chirish: VITE_USE_MOCK_API=false",
    'color:#ea580c;font-weight:bold'
  );
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = tokenStorage.getTenantId() || env.VITE_TENANT_ID;
  if (tenantId) config.headers['X-Tenant-Id'] = tenantId;
  return config;
});

const STATUS_MESSAGES: Record<number, string> = {
  400: "Ma'lumotlar noto'g'ri to'ldirilgan",
  401: 'Sessiya tugagan — qaytadan kiring',
  403: "Sizda bu amal uchun ruxsat yo'q",
  404: 'Topilmadi',
  429: "Urinishlar ko'payib ketdi — bir daqiqadan keyin qayta urining",
  500: 'Serverda xatolik yuz berdi',
};

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export function normalizeError(error: AxiosError<DrfErrorPayload>): ApiError {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data;

  if (!payload || typeof payload !== 'object') {
    return {
      status,
      message: STATUS_MESSAGES[status] ?? error.message ?? 'Tarmoq xatosi',
    };
  }

  const detail = firstString((payload as { detail?: unknown }).detail);

  const fieldErrors: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === 'detail') continue;
    const text = firstString(value);
    if (text) fieldErrors[key] = text;
  }

  const nonField = fieldErrors.non_field_errors;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return {
    status,
    payload,
    message:
      detail ??
      nonField ??
      (hasFieldErrors ? STATUS_MESSAGES[400] : undefined) ??
      STATUS_MESSAGES[status] ??
      error.message,
    ...(hasFieldErrors && { fieldErrors }),
  };
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string> | null = null;

export const AUTH_EXPIRED_EVENT = 'yolup:auth-expired';

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("refresh token yo'q");

  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${API_URL}/auth/refresh/`,
    { refresh },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(tokenStorage.getTenantId() || env.VITE_TENANT_ID
          ? { 'X-Tenant-Id': tokenStorage.getTenantId() || env.VITE_TENANT_ID }
          : {}),
      },
    }
  );

  tokenStorage.set(data.access, data.refresh ?? '');
  return data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<DrfErrorPayload>) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall =
      config?.url?.includes('/auth/login/') || config?.url?.includes('/auth/refresh/');

    if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
      return Promise.reject(normalizeError(error));
    }

    config._retried = true;

    try {
      const refreshOnce = async () => {
        const previousAccess = config.headers.Authorization;
        const run = () => {
          const current = tokenStorage.getAccess();
          if (current && previousAccess !== `Bearer ${current}`) return Promise.resolve(current);
          return refreshAccessToken();
        };
        return navigator.locks ? navigator.locks.request('yolup-token-refresh', run) : run();
      };
      refreshPromise ??= refreshOnce().finally(() => {
        refreshPromise = null;
      });
      const access = await refreshPromise;
      config.headers.Authorization = `Bearer ${access}`;
      return await api.request(config);
    } catch {
      tokenStorage.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      return Promise.reject(normalizeError(error));
    }
  }
);
