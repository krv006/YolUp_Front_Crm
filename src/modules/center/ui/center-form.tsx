import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { centerSchema, type CenterFormValues } from "../model/schemas";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  type CenterSettings,
} from "../model/types";
import { toastError } from "@/shared/lib/toast";

interface CenterFormProps {
  defaultValues?: CenterSettings;
  isPending?: boolean;
  onSubmit: (values: CenterFormValues, onError: (error: unknown) => void) => void;
}

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm";

function toDefaults(center?: CenterSettings): CenterFormValues {
  return {
    name: center?.name ?? "",
    legal_name: center?.legal_name ?? "",
    phone: center?.phone ?? "",
    email: center?.email ?? "",
    address: center?.address ?? "",
    work_hours_from: center?.work_hours_from ?? "",
    work_hours_to: center?.work_hours_to ?? "",
    language: center?.language ?? "uz",
    currency: center?.currency ?? "UZS",
  };
}

export function CenterForm({ defaultValues, isPending, onSubmit }: CenterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CenterFormValues>({
    resolver: zodResolver(centerSchema),
    defaultValues: toDefaults(defaultValues),
  });

  const handleError = (error: unknown) =>
    toastError(error as { message?: string; fieldErrors?: Record<string, string> });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, handleError))}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="name" label="Markaz nomi" required error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </FormField>

        <FormField id="legal_name" label="Yuridik nom">
          <Input id="legal_name" {...register("legal_name")} />
        </FormField>

        <FormField id="phone" label="Telefon" error={errors.phone?.message}>
          <Input id="phone" type="tel" {...register("phone")} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
      </div>

      <FormField id="address" label="Manzil">
        <Input id="address" {...register("address")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="work_hours_from"
          label="Ish vaqti (dan)"
          error={errors.work_hours_from?.message}
        >
          <Input id="work_hours_from" type="time" {...register("work_hours_from")} />
        </FormField>

        <FormField
          id="work_hours_to"
          label="Ish vaqti (gacha)"
          error={errors.work_hours_to?.message}
        >
          <Input id="work_hours_to" type="time" {...register("work_hours_to")} />
        </FormField>

        <FormField id="language" label="Til" required error={errors.language?.message}>
          <select id="language" {...register("language")} className={SELECT_CLASS}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="currency" label="Valyuta" required error={errors.currency?.message}>
          <select id="currency" {...register("currency")} className={SELECT_CLASS}>
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
