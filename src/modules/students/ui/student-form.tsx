import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { studentSchema, type StudentValues } from "../model/schemas";

interface StudentFormProps {
  /**
   * The visible action lives in the sheet footer, which submits this form by
   * id (`<Button type="submit" form={formId}>`) — keeps the fields reusable.
   */
  formId: string;
  defaultValues?: Partial<StudentValues>;
  onSubmit: (values: StudentValues) => void;
}

export function StudentForm({ formId, defaultValues, onSubmit }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      phone: "",
      email: "",
      birth_date: "",
      gender: undefined,
      address: "",
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-first_name`}
          label="Ism"
          required
          error={errors.first_name?.message}
        >
          <Input
            id={`${formId}-first_name`}
            autoComplete="given-name"
            placeholder="Aziz"
            {...register("first_name")}
          />
        </FormField>

        <FormField
          id={`${formId}-last_name`}
          label="Familiya"
          required
          error={errors.last_name?.message}
        >
          <Input
            id={`${formId}-last_name`}
            autoComplete="family-name"
            placeholder="Karimov"
            {...register("last_name")}
          />
        </FormField>
      </div>

      <FormField
        id={`${formId}-middle_name`}
        label="Otasining ismi"
        error={errors.middle_name?.message}
      >
        <Input id={`${formId}-middle_name`} {...register("middle_name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-phone`} label="Telefon" error={errors.phone?.message}>
          <Input
            id={`${formId}-phone`}
            autoComplete="tel"
            placeholder="+998 90 000 00 00"
            {...register("phone")}
          />
        </FormField>

        <FormField
          id={`${formId}-birth_date`}
          label="Tug'ilgan sana"
          error={errors.birth_date?.message}
        >
          <Input id={`${formId}-birth_date`} type="date" {...register("birth_date")} />
        </FormField>
      </div>

      <FormField id={`${formId}-email`} label="Email" error={errors.email?.message}>
        <Input
          id={`${formId}-email`}
          type="email"
          autoComplete="email"
          placeholder="ota-ona@example.com"
          {...register("email")}
        />
      </FormField>

      <FormField id={`${formId}-gender`} label="Jins" error={errors.gender?.message}>
        <Select id={`${formId}-gender`} {...register("gender")}>
          <option value="">Tanlanmagan</option>
          <option value="male">Erkak</option>
          <option value="female">Ayol</option>
          <option value="other">Boshqa</option>
        </Select>
      </FormField>

      <FormField id={`${formId}-address`} label="Manzil" error={errors.address?.message}>
        <Input
          id={`${formId}-address`}
          placeholder="Toshkent sh., Chilonzor tumani"
          {...register("address")}
        />
      </FormField>

      {/* Enter-to-submit helper — the visible button sits in the sheet footer. */}
      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
