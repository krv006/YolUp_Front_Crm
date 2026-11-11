import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { SwitchField } from "@/shared/ui/switch-field";
import { branchSchema, type BranchValues } from "../model/schemas";

interface BranchFormProps {
  formId: string;
  defaultValues?: Partial<BranchValues>;
  onSubmit: (values: BranchValues) => void;
}

export function BranchForm({ formId, defaultValues, onSubmit }: BranchFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      phone: "",
      is_active: true,
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <FormField id={`${formId}-name`} label="Filial nomi" required error={errors.name?.message}>
          <Input
            id={`${formId}-name`}
            placeholder="Chilonzor filiali"
            {...register("name")}
          />
        </FormField>

        <FormField
          id={`${formId}-code`}
          label="Kod"
          required
          hint="Qisqa identifikator"
          error={errors.code?.message}
        >
          <Input
            id={`${formId}-code`}
            placeholder="CHL"
            className="uppercase"
            {...register("code")}
          />
        </FormField>
      </div>

      <FormField id={`${formId}-phone`} label="Telefon" error={errors.phone?.message}>
        <Input
          id={`${formId}-phone`}
          placeholder="+998 71 200 00 00"
          autoComplete="tel"
          {...register("phone")}
        />
      </FormField>

      <FormField id={`${formId}-address`} label="Manzil" error={errors.address?.message}>
        <Input
          id={`${formId}-address`}
          placeholder="Toshkent sh., Chilonzor tumani, Bunyodkor 12"
          {...register("address")}
        />
      </FormField>

      <SwitchField
        control={control}
        name="is_active"
        label="Faol filial"
        hint="Nofaol filiallar yangi guruhlarda tanlanmaydi"
      />

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
