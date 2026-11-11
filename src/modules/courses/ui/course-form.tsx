import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";

import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { SwitchField } from "@/shared/ui/switch-field";
import { Textarea } from "@/shared/ui/textarea";
import { formatNumber } from "@/shared/lib";
import { courseSchema, type CourseValues } from "../model/schemas";

interface CourseFormProps {
  /** Sheet footer submits this form by id. */
  formId: string;
  defaultValues?: Partial<CourseValues>;
  onSubmit: (values: CourseValues) => void;
  /** Kursga bog'langan guruhlar soni — narx ogohlantirishi uchun. */
  groupsCount?: number;
  /** Band kodlar (katta harfda) — backend'dagi unique cheklovning oldindan tekshiruvi. */
  takenCodes?: string[];
}

/**
 * Bir darsning o'rtacha narxi: oylik narx ÷ (darslar soni ÷ davomiylik).
 * Mahsulotning asosiy solishtirma ko'rsatkichi, shuning uchun formada
 * jonli hisoblanadi. Qiymatlar yetarli bo'lmasa `null`.
 */
function averageLessonPrice(price: unknown, months: unknown, lessons: unknown): number | null {
  const priceSom = Number(price);
  const monthCount = Number(months);
  const lessonCount = Number(lessons);

  if (!priceSom || !monthCount || !lessonCount) return null;
  if (priceSom <= 0 || monthCount <= 0 || lessonCount <= 0) return null;

  return Math.round(priceSom / (lessonCount / monthCount));
}

export function CourseForm({
  formId,
  defaultValues,
  onSubmit,
  groupsCount = 0,
  takenCodes = [],
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      price_som: 0,
      is_active: true,
      ...defaultValues,
    },
  });

  /* Kod bandligi — backend unique cheklovini kutmasdan tekshiriladi
     (API bir xil holatda 400 `{code: [...]}` qaytaradi). */
  const submit = handleSubmit((values) => {
    const code = (values.code ?? "").trim().toUpperCase();
    if (code.length > 0 && takenCodes.includes(code)) {
      setError("code", { message: "Bu kod band — boshqa kod tanlang" });
      return;
    }
    onSubmit(values);
  });

  /* Bir darsning o'rtacha narxi — narx, davomiylik va darslar sonidan
     hisoblanadi (mahsulotning asosiy solishtirma ko'rsatkichi). */
  const [price, months, lessons] = watch(["price_som", "duration_months", "lessons_count"]);
  const perLesson = averageLessonPrice(price, months, lessons);

  return (
    <form id={formId} onSubmit={submit} className="grid gap-4" noValidate>
      <FormField
        id={`${formId}-name`}
        label="Kurs nomi"
        required
        error={errors.name?.message}
      >
        <Input
          id={`${formId}-name`}
          placeholder="Ingliz tili — umumiy kurs"
          {...register("name")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-code`}
          label="Kod"
          hint="Hisobot va qidiruv uchun qisqa nom"
          error={errors.code?.message}
        >
          <Input
            id={`${formId}-code`}
            placeholder="ENG"
            maxLength={12}
            {...register("code", { onChange: () => clearErrors("code") })}
          />
        </FormField>

        <FormField
          id={`${formId}-price_som`}
          label="Oylik narx (so'm)"
          required
          hint={
            perLesson != null
              ? `≈ ${formatNumber(perLesson)} so'm — 1 dars uchun`
              : "1 dars narxi davomiylik va darslar sonidan hisoblanadi"
          }
          error={errors.price_som?.message}
        >
          <Input
            id={`${formId}-price_som`}
            type="number"
            min={0}
            step={10_000}
            inputMode="numeric"
            {...register("price_som")}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-duration_months`}
          label="Davomiyligi (oy)"
          hint="Ixtiyoriy"
          error={errors.duration_months?.message}
        >
          <Input
            id={`${formId}-duration_months`}
            type="number"
            min={1}
            max={60}
            inputMode="numeric"
            placeholder="9"
            {...register("duration_months")}
          />
        </FormField>

        <FormField
          id={`${formId}-lessons_count`}
          label="Darslar soni"
          hint="Kursdagi umumiy darslar"
          error={errors.lessons_count?.message}
        >
          <Input
            id={`${formId}-lessons_count`}
            type="number"
            min={1}
            max={1000}
            inputMode="numeric"
            placeholder="72"
            {...register("lessons_count")}
          />
        </FormField>
      </div>

      <FormField
        id={`${formId}-description`}
        label="Tavsif"
        hint="Kurs kimga mo'ljallangani, natijasi"
        error={errors.description?.message}
      >
        <Textarea
          id={`${formId}-description`}
          rows={3}
          placeholder="Boshlang'ich daraja uchun umumiy ingliz tili kursi"
          {...register("description")}
        />
      </FormField>

      <SwitchField
        control={control}
        name="is_active"
        label="Faol kurs"
        hint="Nofaol kurs yangi guruhga taklif qilinmaydi"
      />

      {groupsCount > 0 && (
        <div className="flex gap-2.5 rounded-md border border-border bg-surface-2 p-3">
          <Info className="mt-0.5 h-4 w-4 flex-none text-info" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-ink-secondary">
            Bu kursga <span className="font-semibold text-ink">{groupsCount} ta guruh</span>{" "}
            bog'langan. Narx o'zgarishi mavjud guruhlarga ta'sir qilmaydi — har bir guruh
            narxi alohida saqlanadi.
          </p>
        </div>
      )}

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
