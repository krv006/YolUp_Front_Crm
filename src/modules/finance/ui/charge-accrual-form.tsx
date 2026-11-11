import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { chargeAccrualSchema, type ChargeAccrualFormValues } from "../model/schemas";
import type { PeriodOption } from "../model/format";

interface ChargeAccrualFormProps {
  formId: string;
  groups: Array<{ id: string; name: string }>;
  periods: PeriodOption[];
  isPending: boolean;
  onSubmit: (values: ChargeAccrualFormValues) => void;
}

/**
 * Oylik hisoblash formasi: guruh + davr → guruhdagi har bir o'quvchiga
 * hisob-faktura. Bir guruh uchun bir davr faqat bir marta hisoblanadi.
 */
export function ChargeAccrualForm({
  formId,
  groups,
  periods,
  isPending,
  onSubmit,
}: ChargeAccrualFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChargeAccrualFormValues>({
    resolver: zodResolver(chargeAccrualSchema),
    defaultValues: {
      group_id: "",
      period: periods[0]?.value ?? "",
      due_day: 5,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id={`${formId}-group`}
        label="Guruh"
        required
        error={errors.group_id?.message}
        hint="Guruhdagi faol o'quvchilarning barchasiga yozuv yaratiladi"
      >
        <Select id={`${formId}-group`} {...register("group_id")}>
          <option value="">Guruhni tanlang…</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-period`} label="Davr" required error={errors.period?.message}>
          <Select id={`${formId}-period`} {...register("period")}>
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id={`${formId}-due-day`}
          label="To'lov muddati (oyning kuni)"
          error={errors.due_day?.message}
          hint="1–28"
        >
          <Input
            id={`${formId}-due-day`}
            type="number"
            min={1}
            max={28}
            inputMode="numeric"
            {...register("due_day")}
          />
        </FormField>
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Hisoblash
      </Button>
    </form>
  );
}
