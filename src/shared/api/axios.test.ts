import { describe, expect, it } from 'vitest';
import type { AxiosError } from 'axios';
import { normalizeError } from './axios';
import type { DrfErrorPayload } from './types';

function error(status: number, data: DrfErrorPayload): AxiosError<DrfErrorPayload> {
  return { message: 'Request failed', response: { status, data } } as AxiosError<DrfErrorPayload>;
}

describe('backend error handling', () => {
  it('preserves nested form errors returned by tenant creation', () => {
    const result = normalizeError(error(400, { ceo: { phone: ['Telefon band'] } }));
    expect(result.fieldErrors).toEqual({ 'ceo.phone': 'Telefon band' });
  });
  it('does not treat machine-readable codes as user field errors', () => {
    const result = normalizeError(
      error(403, { detail: 'Markaz bloklangan', code: 'tenant_blocked' })
    );
    expect(result.message).toBe('Markaz bloklangan');
    expect(result.fieldErrors).toBeUndefined();
  });
});
