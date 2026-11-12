import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { leadSchema, type LeadValues } from "../model/schemas";

export interface LeadOption {
  id: string;
  name: string;
}

export interface LeadStageOption {
  value: string;
  label: string;
}

const TEMPERATURES: Array<{ value: NonNullable<LeadValues["temperature"]>; label: string }> = [
  { value: "hot", label: "Issiq — hoziroq qo'ng'iroq qilish kerak" },
  { value: "warm", label: "Iliq — qiziqish bor" },
  { value: "cold", label: "Sovuq — keyinroq bog'lanish" },
];

/** Tizim bosqichlari — sahifa ustunlar ro'yxatini bermasa ishlatiladi. */
const DEFAULT_STAGES: LeadStageOption[] = [
  { value: "open", label: "Ochiq" },
  { value: "waiting", label: "Kutilmoqda" },
  { value: "trial", label: "Sinov darsi" },
  { value: "won", label: "O'quvchiga aylandi" },
  { value: "lost", label: "Rad etilgan" },
];

interface LeadFormProps {
  formId: string;
  defaultValues?: Partial<LeadValues>;
  sources: LeadOption[];
  /** Lid qaysi maktabdan kelgani — katalogdan tanlanadi (ixtiyoriy). */
  schools?: LeadOption[];
  teachers: LeadOption[];
  stages?: LeadStageOption[];
  onSubmit: (values: LeadValues) => void;
}

export function LeadForm({
  formId,
  defaultValues,
  sources,
  schools = [],
  teachers,
  stages = DEFAULT_STAGES,
  onSubmit,
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      source_id: "",
      school_id: "",
      teacher_id: "",
      age: undefined,
      lesson_time: "",
      temperature: "warm",
      stage: "open",
      body: "",
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-first_name`} label="Ism" required error={errors.first_name?.message}>
          <Input id={`${formId}-first_name`} placeholder="Dilshod" {...register("first_name")} />
        </FormField>

        <FormField id={`${formId}-last_name`} label="Familiya" required error={errors.last_name?.message}>
          <Input id={`${formId}-last_name`} placeholder="Nazarov" {...register("last_name")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-phone`}
          label="Telefon"
          required
          error={errors.phone?.message}
        >
          <Input
            id={`${formId}-phone`}
            placeholder="+998 90 123 45 67"
            autoComplete="tel"
            {...register("phone")}
          />
        </FormField>

        <FormField id={`${formId}-age`} label="Yoshi" error={errors.age?.message}>
          <Input
            id={`${formId}-age`}
            type="number"
            min={5}
            max={70}
            inputMode="numeric"
            placeholder="16"
            {...register("age", { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${formId}-source_id`} label="Manba" error={errors.source_id?.message}>
          <Select id={`${formId}-source_id`} {...register("source_id")}>
            <option value="">Manbani tanlang…</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id={`${formId}-school_id`}
          label="Maktab"
          hint="Lid qaysi maktabdan kelgan"
          error={errors.school_id?.message}
        >
          <Select id={`${formId}-school_id`} {...register("school_id")}>
            <option value="">Maktab tanlanmagan</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id={`${formId}-teacher_id`} label="Mas'ul xodim" error={errors.teacher_id?.message}>
          <Select id={`${formId}-teacher_id`} {...register("teacher_id")}>
            <option value="">Tayinlanmagan</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${formId}-stage`} label="Bosqich" error={errors.stage?.message}>
          <Select id={`${formId}-stage`} {...register("stage")}>
            {stages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id={`${formId}-temperature`} label="Harorat" error={errors.temperature?.message}>
          <Select id={`${formId}-temperature`} {...register("temperature")}>
            {TEMPERATURES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id={`${formId}-lesson_time`} label="Sinov darsi vaqti" error={errors.lesson_time?.message}>
          <Input id={`${formId}-lesson_time`} type="time" {...register("lesson_time")} />
        </FormField>
      </div>

      <FormField id={`${formId}-body`} label="Izoh" error={errors.body?.message}>
        <Textarea
          id={`${formId}-body`}
          rows={3}
          placeholder="Qo'ng'iroq natijasi, kelishuv tafsilotlari…"
          {...register("body")}
        />
      </FormField>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
