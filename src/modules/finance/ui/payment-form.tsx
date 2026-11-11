import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { paymentSchema, type PaymentValues } from "../model/schemas";

export interface PaymentOption {
  id: string;
  name: string;
}

/** To'lov turi — `/finance/payment-methods/` katalogidan. */
export interface PaymentMethodOption {
  code: string;
  name: string;
}

interface PaymentFormProps {
  formId: string;
  defaultValues?: Partial<PaymentValues>;
  students: PaymentOption[];
  groups: PaymentOption[];
  /** Bo'sh bo'lsa katalog hali yuklanmagan — select ham bo'sh turadi. */
  methods: PaymentMethodOption[];
  onSubmit: (values: PaymentValues) => void;
}

export function PaymentForm({
  formId,
  defaultValues,
  students,
  groups,
  methods,
  onSubmit,
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: "",
      group_id: "",
      amount_som: 0,
      method: methods[0]?.code ?? "cash",
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id={`${formId}-student_id`}
        label="O'quvchi"
        required
        error={errors.student_id?.message}
      >
        <Select id={`${formId}-student_id`} {...register("student_id")}>
          <option value="">O'quvchini tanlang…</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id={`${formId}-group_id`} label="Guruh" error={errors.group_id?.message}>
        <Select id={`${formId}-group_id`} {...register("group_id")}>
          <option value="">Guruhsiz / umumiy to'lov</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
      </FormField>

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
          id={`${formId}-method`}
          label="To'lov turi"
          required
          error={errors.method?.message}
        >
          <Select id={`${formId}-method`} {...register("method")}>
            {methods.map((method) => (
              <option key={method.code} value={method.code}>
                {method.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
