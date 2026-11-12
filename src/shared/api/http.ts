import type { AxiosRequestConfig } from 'axios';

import { api } from './axios';
import type { Paginated } from './types';

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then((response) => response.data),

  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, body, config).then((response) => response.data),

  put: <T>(url: string, body?: unknown) => api.put<T>(url, body).then((response) => response.data),

  patch: <T>(url: string, body?: unknown) =>
    api.patch<T>(url, body).then((response) => response.data),

  delete: (url: string) => api.delete<void>(url).then(() => undefined),

  list: async <T>(url: string, params?: Record<string, unknown>) => {
    const requested = Number(params?.page_size ?? 0);
    if (requested <= 100 || Number(params?.page ?? 1) !== 1) {
      return (await api.get<Paginated<T>>(url, { params })).data;
    }
    const first = (
      await api.get<Paginated<T>>(url, { params: { ...params, page: 1, page_size: 100 } })
    ).data;
    const results = [...first.results];
    let next = first.next;
    let page = 2;
    while (next && results.length < requested) {
      const batch = (
        await api.get<Paginated<T>>(url, { params: { ...params, page, page_size: 100 } })
      ).data;
      if (!batch.results.length) break;
      results.push(...batch.results);
      next = batch.next;
      page += 1;
    }
    return { ...first, next, results };
  },

  blob: (url: string) =>
    api.get<Blob>(url, { responseType: 'blob' }).then((response) => response.data),

  upload: <T>(url: string, form: FormData) =>
    api
      .post<T>(url, form, { headers: { 'Content-Type': undefined } })
      .then((response) => response.data),

  uploadPatch: <T>(url: string, form: FormData) =>
    api
      .patch<T>(url, form, { headers: { 'Content-Type': undefined } })
      .then((response) => response.data),
};

export function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all'
    )
  );
}
