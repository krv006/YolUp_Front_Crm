import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { dayOffSchema, type DayOffFormValues } from "../model/schemas";
import { toastError } from "@/shared/lib/toast";

const SELECT_CLASS =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm";

interface DayOffFormProps {
  branches: Array<{ id: string; name: string }>;
  defaultValues: DayOffFormValues;
  isPending?: boolean;
  onSubmit: (values: DayOffFormValues, onError: (error: unknown) => void) => void;
}

export function DayOffForm({ branches, defaultValues, isPending, onSubmit }: DayOffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DayOffFormValues>({
    resolver: zodResolver(dayOffSchema),
    defaultValues,
  });

  const handleError = (error: unknown) =>
    toastError(error as { message?: string; fieldErrors?: Record<string, string> });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, handleError))}
      className="space-y-4"
    >
      <FormField id="name" label="Sana / tadbir nomi" required error={errors.name?.message}>
        <Input id="name" {...register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="date_from"
          label="Boshlanish sanasi"
          required
          error={errors.date_from?.message}
        >
          <Input id="date_from" type="date" {...register("date_from")} />
        </FormField>

        <FormField id="date_to" label="Tugash sanasi" required error={errors.date_to?.message}>
          <Input id="date_to" type="date" {...register("date_to")} />
        </FormField>
      </div>

      <FormField
        id="branch_id"
        label="Filial"
        hint="Bo'sh qoldirilsa qoidasi butun markaz uchun amal qiladi."
      >
        <select id="branch_id" {...register("branch_id")} className={SELECT_CLASS}>
          <option value="">Butun markaz</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="note" label="Izoh">
        <Input id="note" {...register("note")} />
      </FormField>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
