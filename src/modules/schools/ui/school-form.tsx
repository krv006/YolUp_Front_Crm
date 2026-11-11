import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { SwitchField } from "@/shared/ui/switch-field";
import { Textarea } from "@/shared/ui/textarea";
import { formatNumber } from "@/shared/lib";
import { schoolSchema, type SchoolValues } from "../model/schemas";
import { SCHOOL_TYPE_OPTIONS } from "../model/labels";

interface SchoolFormProps {
  /** Sheet footer submits this form by id. */
  formId: string;
  defaultValues?: Partial<SchoolValues>;
  onSubmit: (values: SchoolValues) => void;
  /** Bu maktabdan kelgan lidlar soni — o'chirish mumkin emasligini aytish uchun. */
  leadsCount?: number;
  /** Band nomlar (kichik harfda) — backend'dagi unique cheklovning oldindan tekshiruvi. */
  takenNames?: string[];
}

export function SchoolForm({
  formId,
  defaultValues,
  onSubmit,
  leadsCount = 0,
  takenNames = [],
}: SchoolFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<SchoolValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      type: "public",
      district: "",
      address: "",
      contact_person: "",
      phone: "",
      partner_since: "",
      is_active: true,
      notes: "",
      ...defaultValues,
    },
  });

  /* Nom bandligi — server 400 kutmasdan tekshiriladi (API ham xuddi shunday
     holatda `{name: [...]}` qaytaradi). */
  const submit = handleSubmit((values) => {
    const name = values.name.trim().toLowerCase();
    if (name.length > 0 && takenNames.includes(name)) {
      setError("name", { message: "Bu nom bilan maktab allaqachon mavjud" });
      return;
    }
    onSubmit(values);
  });

  return (
    <form id={formId} onSubmit={submit} className="grid gap-4" noValidate>
      <FormField id={`${formId}-name`} label="Maktab nomi" required error={errors.name?.message}>
        <Input
          id={`${formId}-name`}
          placeholder="12-umumta'lim maktabi"
          {...register("name", { onChange: () => clearErrors("name") })}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-type`} label="Turi" error={errors.type?.message}>
          <Select id={`${formId}-type`} {...register("type")}>
            {SCHOOL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id={`${formId}-district`}
          label="Tuman / shahar"
          hint="Ixtiyoriy"
          error={errors.district?.message}
        >
          <Input id={`${formId}-district`} placeholder="Chilonzor tumani" {...register("district")} />
        </FormField>
      </div>

      <FormField
        id={`${formId}-address`}
        label="Manzil"
        hint="Ixtiyoriy"
        error={errors.address?.message}
      >
        <Input
          id={`${formId}-address`}
          placeholder="Bunyodkor shoh ko'chasi 12"
          {...register("address")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-contact_person`}
          label="Mas'ul shaxs"
          hint="Maktab tomonidagi aloqa qiluvchi"
          error={errors.contact_person?.message}
        >
          <Input
            id={`${formId}-contact_person`}
            placeholder="Malohat Rahimova"
            {...register("contact_person")}
          />
        </FormField>

        <FormField
          id={`${formId}-phone`}
          label="Telefon"
          hint="Ixtiyoriy"
          error={errors.phone?.message}
        >
          <Input
            id={`${formId}-phone`}
            type="tel"
            inputMode="tel"
            placeholder="+998 71 273 12 12"
            {...register("phone")}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-student_capacity`}
          label="O'quvchilar soni"
          hint="Potensial auditoriya hajmi"
          error={errors.student_capacity?.message}
        >
          <Input
            id={`${formId}-student_capacity`}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="1200"
            {...register("student_capacity")}
          />
        </FormField>

        <FormField
          id={`${formId}-partner_since`}
          label="Hamkorlik boshlangan"
          hint="Hali hamkor bo'lmasa bo'sh qoldiring"
          error={errors.partner_since?.message}
        >
          <Input id={`${formId}-partner_since`} type="date" {...register("partner_since")} />
        </FormField>
      </div>

      <FormField
        id={`${formId}-notes`}
        label="Izoh"
        hint="Masalan: qaysi sinflar bilan ishlash kelishilgan"
        error={errors.notes?.message}
      >
        <Textarea
          id={`${formId}-notes`}
          rows={3}
          placeholder="9-11 sinflar, har seshanba uchrashuv"
          {...register("notes")}
        />
      </FormField>

      <SwitchField
        control={control}
        name="is_active"
        label="Faol maktab"
        hint="Nofaol maktab lid formasida „(nofaol)“ belgisi bilan ko'rinadi"
      />

      {leadsCount > 0 && (
        <div className="flex gap-2.5 rounded-md border border-border bg-surface-2 p-3">
          <Info className="mt-0.5 h-4 w-4 flex-none text-info" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-ink-secondary">
            Bu maktabdan <span className="font-semibold text-ink">{formatNumber(leadsCount)} ta lid</span>{" "}
            kelgan. Ular saqlanib qoladi, shuning uchun maktabni o'chirib bo'lmaydi — avval
            lidlarni boshqa maktabga o'tkazing.
          </p>
        </div>
      )}
    </form>
  );
}
