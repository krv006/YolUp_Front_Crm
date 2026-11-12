import { useState, type FormEvent } from 'react';
import { http } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toastError, toastSuccess } from '@/shared/lib';

export default function PasswordChange({
  onDone,
  onLogout,
}: {
  onDone: () => void;
  onLogout: () => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await http.post('/auth/password/change/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toastSuccess('Parol yangilandi');
      onDone();
    } catch (error) {
      toastError(error && typeof error === 'object' ? error : "Parolni almashtirib bo'lmadi");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-4 p-6">
      <h1 className="text-xl font-bold">Parolni almashtiring</h1>
      <form onSubmit={submit} className="grid gap-4">
        <label>
          Joriy parol
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </label>
        <label>
          Yangi parol
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <Button loading={pending} type="submit">
          Saqlash
        </Button>
      </form>
      <Button variant="ghost" onClick={onLogout}>
        Chiqish
      </Button>
    </main>
  );
}
