/// <reference types="vite/client" />
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().default('https://api.yolup.uz/api/v1'),
  VITE_TENANT_ID: z.string().optional(),
  VITE_APP_NAME: z.string().default('YolUp CRM'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  /**
   * Backend hali tayyor bo'lmaganda UI ni ko'rish uchun.
   * `VITE_USE_MOCK_API=false` qilib qo'yilsa — haqiqiy backend ishlatiladi.
   */
  VITE_USE_MOCK_API: z.string().default('false'),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

export const API_URL =
  import.meta.env.DEV && env.VITE_API_URL === 'https://api.yolup.uz/api/v1'
    ? '/api/v1'
    : env.VITE_API_URL.replace(/\/+$/, '');

/** Mock API yoqilganmi (default: ha). */
export const USE_MOCK_API = env.VITE_USE_MOCK_API !== 'false';
