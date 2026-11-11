import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { parentSchema, type ParentValues } from "../model/schemas";

const RELATIONS = ["Ota", "Ona", "Vasiy", "Boshqa"];

interface ParentFormProps {
  formId: string;
  defaultValues?: Partial<ParentValues>;
  onSubmit: (values: ParentValues) => void;
}

export function ParentForm({ formId, defaultValues, onSubmit }: ParentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      phone: "",
      email: "",
      relation: "Ona",
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-last_name`} label="Familiya" required error={errors.last_name?.message}>
          <Input id={`${formId}-last_name`} placeholder="Karimova" {...register("last_name")} />
        </FormField>

        <FormField id={`${formId}-first_name`} label="Ism" required error={errors.first_name?.message}>
          <Input id={`${formId}-first_name`} placeholder="Zilola" {...register("first_name")} />
        </FormField>
      </div>

      <FormField id={`${formId}-middle_name`} label="Otasining ismi" error={errors.middle_name?.message}>
        <Input id={`${formId}-middle_name`} placeholder="Bahodirovna" {...register("middle_name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-phone`} label="Telefon" required error={errors.phone?.message}>
          <Input
            id={`${formId}-phone`}
            placeholder="+998 90 123 45 67"
            autoComplete="tel"
            {...register("phone")}
          />
        </FormField>

        <FormField id={`${formId}-relation`} label="Kim bo'ladi" error={errors.relation?.message}>
          <Select id={`${formId}-relation`} {...register("relation")}>
            {RELATIONS.map((relation) => (
              <option key={relation} value={relation}>
                {relation}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id={`${formId}-email`} label="Email" error={errors.email?.message}>
        <Input
          id={`${formId}-email`}
          type="email"
          placeholder="ota-ona@example.com"
          {...register("email")}
        />
      </FormField>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
