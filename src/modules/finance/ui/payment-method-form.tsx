import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import {
  PAYMENT_METHOD_KIND_OPTIONS,
  paymentMethodSchema,
  type PaymentMethodValues,
} from "../model/schemas";

interface PaymentMethodFormProps {
  formId: string;
  defaultValues: PaymentMethodValues;
  isPending: boolean;
  onSubmit: (values: PaymentMethodValues) => void;
}

/**
 * To'lov turi formasi. `code` — to'lovlarga yoziladigan barqaror kalit
 * (masalan `click`), shuning uchun u yaratilgandan keyin o'zgartirilmasligi
 * tavsiya etiladi.
 */
export function PaymentMethodForm({
  formId,
  defaultValues,
  isPending,
  onSubmit,
}: PaymentMethodFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id={`${formId}-name`}
        label="Nomi"
        required
        error={errors.name?.message}
        hint="Kassada ko'rinadigan nom"
      >
        <Input id={`${formId}-name`} maxLength={40} {...register("name")} />
      </FormField>

      <FormField
        id={`${formId}-code`}
        label="Kod"
        required
        error={errors.code?.message}
        hint="Kichik lotin harflari, raqam va pastki chiziq (masalan bank_transfer)"
      >
        <Input id={`${formId}-code`} maxLength={32} {...register("code")} />
      </FormField>

      <FormField
        id={`${formId}-kind`}
        label="Buxgalteriya guruhi"
        required
        error={errors.kind?.message}
        hint="Kassa hisobotida turlar shu guruh bo'yicha yig'iladi"
      >
        <Select id={`${formId}-kind`} {...register("kind")}>
          {PAYMENT_METHOD_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          {...register("is_active")}
          className="h-4 w-4 rounded border-input bg-background"
        />
        Faol
      </label>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
