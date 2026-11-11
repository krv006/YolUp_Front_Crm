import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { tenantSchema, type TenantValues } from "../model/schemas";

const TIERS: Array<{ value: TenantValues["subscription_tier"]; label: string }> = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "professional", label: "Professional" },
  { value: "enterprise", label: "Enterprise" },
];

interface TenantFormProps {
  formId: string;
  defaultValues?: Partial<TenantValues>;
  onSubmit: (values: TenantValues) => void;
}

export function TenantForm({ formId, defaultValues, onSubmit }: TenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      phone: "",
      email: "",
      address: "",
      currency: "UZS",
      subscription_tier: "basic",
      max_students: 100,
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField id={`${formId}-name`} label="Markaz nomi" required error={errors.name?.message}>
        <Input id={`${formId}-name`} placeholder="Yolup Learning Center" {...register("name")} />
      </FormField>

      <FormField
        id={`${formId}-slug`}
        label="Slug"
        required
        hint="Faqat kichik harf, raqam va tire — subdomen uchun"
        error={errors.slug?.message}
      >
        <Input id={`${formId}-slug`} placeholder="yolup-learning" {...register("slug")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-phone`} label="Telefon" error={errors.phone?.message}>
          <Input id={`${formId}-phone`} placeholder="+998 71 200 00 00" {...register("phone")} />
        </FormField>

        <FormField id={`${formId}-email`} label="Email" error={errors.email?.message}>
          <Input
            id={`${formId}-email`}
            type="email"
            placeholder="info@markaz.uz"
            {...register("email")}
          />
        </FormField>
      </div>

      <FormField id={`${formId}-address`} label="Manzil" error={errors.address?.message}>
        <Input id={`${formId}-address`} placeholder="Toshkent sh." {...register("address")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id={`${formId}-subscription_tier`}
          label="Tarif"
          required
          error={errors.subscription_tier?.message}
        >
          <Select id={`${formId}-subscription_tier`} {...register("subscription_tier")}>
            {TIERS.map((tier) => (
              <option key={tier.value} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id={`${formId}-currency`} label="Valyuta" error={errors.currency?.message}>
          <Select id={`${formId}-currency`} {...register("currency")}>
            <option value="UZS">UZS — so'm</option>
            <option value="USD">USD — dollar</option>
            <option value="RUB">RUB — rubl</option>
          </Select>
        </FormField>

        <FormField
          id={`${formId}-max_students`}
          label="Limit (o'quvchi)"
          error={errors.max_students?.message}
        >
          <Input
            id={`${formId}-max_students`}
            type="number"
            min={0}
            inputMode="numeric"
            {...register("max_students")}
          />
        </FormField>
      </div>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
