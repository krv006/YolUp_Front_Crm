import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { userSchema, type UserValues } from "../model/schemas";
import { toastError } from "@/shared/lib/toast";

interface UserFormProps {
  roles: { value: string; label: string }[];
  branches: { id: string; name: string }[];
  defaultValues?: Partial<UserValues>;
  /** Yangi xodim yaratishda parol majburiy; tahrirlashda bo'sh qoldirish mumkin. */
  passwordRequired?: boolean;
  isPending?: boolean;
  onSubmit: (values: UserValues, onError: (error: unknown) => void) => void;
}

export function UserForm({
  roles,
  branches,
  defaultValues,
  passwordRequired = false,
  isPending,
  onSubmit,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      branch_id: "",
      role: "",
      first_name: "",
      last_name: "",
      middle_name: "",
      phone: "",
      email: "",
      password: "",
      ...defaultValues,
    },
  });

  const handleError = (error: unknown) =>
    toastError(error as { message?: string; fieldErrors?: Record<string, string> });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, handleError))}
      className="space-y-4"
    >
      <FormField id="role" label="Rol" required error={errors.role?.message}>
        <select id="role" {...register("role")} className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="branch_id" label="Filial" error={errors.branch_id?.message}>
        <select id="branch_id" {...register("branch_id")} className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
          <option value="">Filial tanlanmagan</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="first_name" label="Ism" required error={errors.first_name?.message}>
        <Input id="first_name" {...register("first_name")} />
      </FormField>

      <FormField id="last_name" label="Familiya" required error={errors.last_name?.message}>
        <Input id="last_name" {...register("last_name")} />
      </FormField>

      <FormField id="middle_name" label="Ism sharifi" error={errors.middle_name?.message}>
        <Input id="middle_name" {...register("middle_name")} />
      </FormField>

      <FormField id="phone" label="Telefon" required error={errors.phone?.message}>
        <Input id="phone" type="tel" {...register("phone")} />
      </FormField>

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input id="email" type="email" {...register("email")} />
      </FormField>

      <FormField
        id="password"
        label="Parol"
        required={passwordRequired}
        hint={passwordRequired ? undefined : "Bo'sh qoldirilsa parol o'zgartirilmaydi."}
        error={errors.password?.message}
      >
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
      </FormField>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
