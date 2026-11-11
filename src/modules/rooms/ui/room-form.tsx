import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { SwitchField } from "@/shared/ui/switch-field";
import { roomSchema, type RoomValues } from "../model/schemas";

export interface BranchOption {
  id: string;
  name: string;
}

interface RoomFormProps {
  /** Sheet footer submits this form by id. */
  formId: string;
  defaultValues?: Partial<RoomValues>;
  branches: BranchOption[];
  onSubmit: (values: RoomValues) => void;
}

export function RoomForm({ formId, defaultValues, branches, onSubmit }: RoomFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { branch_id: "", name: "", capacity: 12, is_active: true, ...defaultValues },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField
        id={`${formId}-branch_id`}
        label="Filial"
        required
        error={errors.branch_id?.message}
      >
        <Select id={`${formId}-branch_id`} {...register("branch_id")}>
          <option value="">Filialni tanlang…</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-name`} label="Xona raqami" required error={errors.name?.message}>
          <Input id={`${formId}-name`} placeholder="201" {...register("name")} />
        </FormField>

        <FormField
          id={`${formId}-capacity`}
          label="Sig'im"
          required
          hint="Bir vaqtda nechta o'quvchi"
          error={errors.capacity?.message}
        >
          <Input
            id={`${formId}-capacity`}
            type="number"
            min={1}
            inputMode="numeric"
            {...register("capacity")}
          />
        </FormField>
      </div>

      <SwitchField
        control={control}
        name="is_active"
        label="Faol xona"
        hint="Nofaol xonalar jadvalda ko'rsatilmaydi"
      />

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
