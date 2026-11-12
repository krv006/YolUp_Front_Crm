import { type FormEvent } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import type { Tenant } from '@/modules/tenants';

export type OperatorFormMode = 'create' | 'edit' | 'subscription' | 'owner' | 'password';
type Props = {
  mode: OperatorFormMode | null;
  tenant: Tenant | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
const titles: Record<OperatorFormMode, string> = {
  create: 'Yangi markaz',
  edit: 'Markazni tahrirlash',
  subscription: 'Obunani boshqarish',
  owner: 'Direktor qo‘shish',
  password: 'Parolni tiklash',
};
function Field({
  label,
  name,
  value,
  type = 'text',
  required = true,
  min,
  maxLength,
}: {
  label: string;
  name: string;
  value?: string;
  type?: string;
  required?: boolean;
  min?: number;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink-secondary">
      {label}
      {required && <span className="sr-only">majburiy</span>}
      <Input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        min={min}
        maxLength={maxLength}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
    </label>
  );
}
export function OperatorFormSheet({ mode, tenant, pending, onClose, onSubmit }: Props) {
  const title = mode ? titles[mode] : '';
  return (
    <Sheet
      open={!!mode}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <SheetContent>
        <SheetHeader>
          <div>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              {tenant ? tenant.name : 'Markaz va birinchi direktor ma’lumotlarini kiriting.'}
            </SheetDescription>
          </div>
        </SheetHeader>
        <SheetBody>
          {mode && (
            <form
              id="operator-form"
              key={`${mode}-${tenant?.id ?? 'new'}`}
              className="grid gap-4"
              onSubmit={onSubmit}
            >
              {(mode === 'create' || mode === 'edit') && (
                <>
                  <Field label="Markaz nomi" name="name" value={tenant?.name} />
                  {mode === 'create' && (
                    <Field label="Subdomen (slug)" name="slug" maxLength={40} />
                  )}
                  <Field
                    label="Telefon"
                    name="phone"
                    value={tenant?.phone ?? ''}
                    type="tel"
                    required={false}
                  />
                  <Field
                    label="Email"
                    name="email"
                    value={tenant?.email ?? ''}
                    type="email"
                    required={false}
                  />
                  <Field
                    label="Manzil"
                    name="address"
                    value={tenant?.address ?? ''}
                    required={false}
                  />
                </>
              )}
              {mode === 'create' && (
                <>
                  <Field
                    label="O‘quvchilar limiti"
                    name="max_students"
                    value="100"
                    type="number"
                    min={1}
                  />
                  <div className="border-t border-divider pt-4">
                    <h3 className="font-semibold text-ink">Birinchi direktor</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Markaz bilan birga direktor hisobi yaratiladi.
                    </p>
                  </div>
                  <Field label="Ism" name="first_name" />
                  <Field label="Familiya" name="last_name" />
                  <Field label="Direktor telefoni" name="ceo_phone" type="tel" />
                  <Field label="Vaqtinchalik parol" name="password" type="password" />
                </>
              )}
              {mode === 'subscription' && (
                <>
                  <label className="grid gap-1.5 text-sm font-semibold text-ink-secondary">
                    Tarif
                    <Select name="subscription_tier" defaultValue={tenant?.subscription_tier}>
                      {['basic', 'standard', 'professional', 'enterprise'].map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <Field
                    label="O‘quvchilar limiti"
                    name="max_students"
                    value={String(tenant?.max_students ?? 100)}
                    type="number"
                    min={1}
                  />
                  <Field label="Tugash sanasi va vaqti" name="expires_at" type="datetime-local" />
                </>
              )}
              {mode === 'owner' && (
                <>
                  <Field label="Ism" name="first_name" />
                  <Field label="Familiya" name="last_name" />
                  <Field label="Telefon" name="phone" type="tel" />
                  <Field label="Vaqtinchalik parol" name="password" type="password" />
                </>
              )}
              {mode === 'password' && (
                <>
                  <p className="text-sm leading-6 text-ink-secondary">
                    Direktorning barcha faol sessiyalari yakunlanadi. Yangi parolni xavfsiz usulda
                    yetkazing.
                  </p>
                  <Field label="Yangi vaqtinchalik parol" name="new_password" type="password" />
                </>
              )}
            </form>
          )}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" form="operator-form" loading={pending}>
            Saqlash
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
