import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { chargeSchema, type ChargeFormValues } from "../model/schemas";

interface ChargeFormProps {
  formId: string;
  defaultValues: ChargeFormValues;
  isPending: boolean;
  onSubmit: (values: ChargeFormValues) => void;
}

/**
 * Bitta hisob-fakturani tahrirlash (summa, chegirma, muddat).
 * To'lov qilingan yozuv bu formaga umuman ochilmaydi.
 */
export function ChargeForm({ formId, defaultValues, isPending, onSubmit }: ChargeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id={`${formId}-amount`}
        label="Summa (so'm)"
        required
        error={errors.amount_som?.message}
      >
        <Input
          id={`${formId}-amount`}
          type="number"
          min={0}
          step={10_000}
          inputMode="numeric"
          {...register("amount_som")}
        />
      </FormField>

      <FormField
        id={`${formId}-discount`}
        label="Chegirma (so'm)"
        error={errors.discount_som?.message}
        hint="Summadan ayiriladi"
      >
        <Input
          id={`${formId}-discount`}
          type="number"
          min={0}
          step={10_000}
          inputMode="numeric"
          {...register("discount_som")}
        />
      </FormField>

      <FormField
        id={`${formId}-due-date`}
        label="To'lov muddati"
        required
        error={errors.due_date?.message}
      >
        <Input id={`${formId}-due-date`} type="date" {...register("due_date")} />
      </FormField>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
