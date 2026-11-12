import { describe, expect, it } from 'vitest';
import { leadPayload, leadSchema } from './schemas';

describe('lead API contract', () => {
  it('requires a surname for new leads', () => {
    expect(
      leadSchema.safeParse({ first_name: 'Ali', last_name: '', phone: '+998901234567' }).success
    ).toBe(false);
  });
  it('does not send the read-only workflow status back during edits', () => {
    const body = leadPayload({
      first_name: 'Ali',
      last_name: 'Valiyev',
      phone: '+998901234567',
      status: 'enrolled',
    });
    expect(body).not.toHaveProperty('status');
  });
});
