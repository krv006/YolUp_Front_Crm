import { describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OperatorFormSheet } from './operator-form-sheet';

describe('operator forms', () => {
  it('creates a center with director fields and masked password', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const result = render(
      <OperatorFormSheet
        mode="create"
        tenant={null}
        pending={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByRole('dialog').textContent).toContain('Yangi markaz');
    expect(screen.getByLabelText(/Markaz nomi/).getAttribute('name')).toBe('name');
    expect(screen.getByLabelText(/Direktor telefoni/).getAttribute('name')).toBe('ceo_phone');
    expect(screen.getByLabelText(/Vaqtinchalik parol/).getAttribute('type')).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Bekor qilish' }));
    result.unmount();
    cleanup();
  });
  it('uses a masked field for the owner password reset', () => {
    const tenant = { id: '1', name: 'Test' } as never;
    render(
      <OperatorFormSheet
        mode="password"
        tenant={tenant}
        pending={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Yangi vaqtinchalik parol/).getAttribute('type')).toBe('password');
    cleanup();
  });
});
