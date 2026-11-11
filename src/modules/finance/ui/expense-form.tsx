import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { expenseSchema, type ExpenseValues } from "../model/schemas";

export interface ExpenseOption {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  formId: string;
  defaultValues?: Partial<ExpenseValues>;
  categories: ExpenseOption[];
  branches: ExpenseOption[];
  onSubmit: (values: ExpenseValues) => void;
}

export function ExpenseForm({
  formId,
  defaultValues,
  categories,
  branches,
  onSubmit,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category_id: "",
      branch_id: "",
      amount_som: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-category_id`}
          label="Kategoriya"
          required
          error={errors.category_id?.message}
        >
          <Select id={`${formId}-category_id`} {...register("category_id")}>
            <option value="">Kategoriyani tanlang…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id={`${formId}-branch_id`} label="Filial" error={errors.branch_id?.message}>
          <Select id={`${formId}-branch_id`} {...register("branch_id")}>
            <option value="">Umumiy xarajat</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-amount_som`}
          label="Summa (so'm)"
          required
          error={errors.amount_som?.message}
        >
          <Input
            id={`${formId}-amount_som`}
            type="number"
            min={0}
            step={10_000}
            inputMode="numeric"
            {...register("amount_som")}
          />
        </FormField>

        <FormField
          id={`${formId}-date`}
          label="Sana"
          required
          error={errors.date?.message}
        >
          <Input id={`${formId}-date`} type="date" {...register("date")} />
        </FormField>
      </div>

      <FormField id={`${formId}-description`} label="Izoh" error={errors.description?.message}>
        <Textarea
          id={`${formId}-description`}
          rows={3}
          placeholder="Masalan: noyabr oyi ijarasi"
          {...register("description")}
        />
      </FormField>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
