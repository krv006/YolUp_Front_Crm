import { describe, expect, it } from 'vitest';
import { paymentPayload } from './schemas';

describe('payment API payload', () => {
  it('uses integer tiyin and a UUID idempotency key', () => {
    const body = paymentPayload({ student_id: 'student-1', amount_som: 1250, method: 'cash' });
    expect(body.amount_tiyin).toBe(125000);
    expect(body.idempotency_key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
