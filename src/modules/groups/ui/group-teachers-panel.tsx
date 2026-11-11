import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crown, MoreHorizontal, Plus, Trash2, UserCog } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { ConfirmModal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  groupTeacherPayload,
  groupTeacherSchema,
  teacherPayLabel,
  type GroupTeacherValues,
} from "../model/schemas";
import { PAY_RULE_LABELS, TEACHER_ROLE_LABELS } from "../model/labels";
import type { GroupTeacher, GroupTeacherPayRule, GroupTeacherRole } from "../model/types";

export interface TeacherOption {
  id: string;
  name: string;
}

interface GroupTeachersPanelProps {
  teachers: GroupTeacher[];
  isLoading: boolean;
  /** Biriktirish mumkin bo'lgan o'qituvchilar (xodimlar ro'yxati). */
  options: TeacherOption[];
  canManage: boolean;
  pending?: boolean;
  onCreate: (payload: Record<string, unknown>) => void;
  onSetMain: (teacher: GroupTeacher) => void;
  onRemove: (teacherId: string) => void;
}

/**
 * Guruh o'qituvchilari: asosiy, yordamchi va hammuallif rollari hamda har bir
 * o'qituvchining haq sharti. Guruhda faqat bitta asosiy o'qituvchi bo'ladi —
 * almashtirishda avvalgisi avtomatik yordamchiga o'tadi.
 */
export function GroupTeachersPanel({
  teachers,
  isLoading,
  options,
  canManage,
  pending = false,
  onCreate,
  onSetMain,
  onRemove,
}: GroupTeachersPanelProps) {
  const [removing, setRemoving] = useState<GroupTeacher | null>(null);
  const hasMain = teachers.some((teacher) => teacher.role === "main");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<GroupTeacherValues>({
    resolver: zodResolver(groupTeacherSchema),
    defaultValues: {
      user_id: "",
      role: hasMain ? "assistant" : "main",
      pay_rule: "fixed",
      pay_value: 0,
    },
  });

  const payRule = watch("pay_rule");
  const taken = new Set(teachers.map((teacher) => teacher.user_id));
  const available = options.filter((option) => !taken.has(option.id));

  const submit = (values: GroupTeacherValues) => {
    onCreate(groupTeacherPayload(values));
    reset({ user_id: "", role: hasMain ? "assistant" : "main", pay_rule: "fixed", pay_value: 0 });
  };

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <UserCog className="h-4 w-4 text-ink-muted" />
          O'qituvchilar
          <span className="text-ink-muted">({teachers.length})</span>
        </h2>
        {teachers.length > 0 && !hasMain ? (
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-ink">
            Asosiy o'qituvchi belgilanmagan
          </span>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-surface">
        {isLoading ? (
          <div className="grid gap-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : teachers.length === 0 ? (
          <EmptyState
            icon={<UserCog className="h-6 w-6" />}
            title="O'qituvchi biriktirilmagan"
            description="Guruhga mas'ul o'qituvchini biriktiring — ish haqi shu bog'lanish asosida hisoblanadi."
          />
        ) : (
          <ul className="divide-y divide-border">
            {teachers.map((teacher) => (
              <li
                key={teacher.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-ink">
                      {teacher.user_name ?? "O'qituvchi"}
                    </span>
                    {teacher.role === "main" && (
                      <Crown className="h-3.5 w-3.5 text-warning-ink" aria-label="Asosiy" />
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-muted">
                    {teacher.user_phone ?? "Telefon yo'q"}
                  </span>
                </span>

                <span className="flex flex-none items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      teacher.role === "main"
                        ? "bg-action-soft text-action-soft-text"
                        : "bg-surface-2 text-ink-secondary",
                    )}
                  >
                    {TEACHER_ROLE_LABELS[teacher.role]}
                  </span>
                  <span className="money text-xs font-semibold text-ink-secondary">
                    {teacherPayLabel(teacher.pay_rule, teacher.pay_value_tiyin)}
                  </span>
                </span>

                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`${teacher.user_name ?? "O'qituvchi"} amallari`}
                        className="h-8 w-8 px-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={teacher.role === "main"}
                        onSelect={() => onSetMain(teacher)}
                      >
                        <Crown className="h-4 w-4" />
                        Asosiy qilib belgilash
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-danger-ink"
                        onSelect={() => setRemoving(teacher)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Olib tashlash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage ? (
        <form
          onSubmit={handleSubmit(submit)}
          className="grid gap-3 rounded-lg border border-dashed border-border-strong bg-surface-inset p-4"
          noValidate
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              id="teacher-user"
              label="O'qituvchi"
              error={errors.user_id?.message}
              hint={
                available.length === 0 ? "Barcha o'qituvchilar allaqachon biriktirilgan" : undefined
              }
            >
              <Select id="teacher-user" disabled={available.length === 0} {...register("user_id")}>
                <option value="">Tanlang…</option>
                {available.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="teacher-role" label="Rol" error={errors.role?.message}>
              <Select id="teacher-role" {...register("role")}>
                {(Object.keys(TEACHER_ROLE_LABELS) as GroupTeacherRole[]).map((role) => (
                  <option key={role} value={role} disabled={role === "main" && hasMain}>
                    {TEACHER_ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="teacher-pay-rule" label="Haq sharti" error={errors.pay_rule?.message}>
              <Controller
                control={control}
                name="pay_rule"
                render={({ field }) => (
                  <Select
                    id="teacher-pay-rule"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    {(Object.keys(PAY_RULE_LABELS) as GroupTeacherPayRule[]).map((rule) => (
                      <option key={rule} value={rule}>
                        {PAY_RULE_LABELS[rule].label}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </FormField>

            <FormField
              id="teacher-pay-value"
              label={`Qiymat (${PAY_RULE_LABELS[payRule].unit})`}
              error={errors.pay_value?.message}
              hint={
                payRule === "percentage"
                  ? "Guruh oylik tushumining foizi"
                  : "Har oy uchun so'mda"
              }
            >
              <Input
                id="teacher-pay-value"
                type="number"
                min={0}
                max={payRule === "percentage" ? 100 : undefined}
                step={payRule === "percentage" ? 1 : 50_000}
                inputMode="numeric"
                {...register("pay_value")}
              />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={pending} disabled={available.length === 0}>
              <Plus className="h-4 w-4" />
              Biriktirish
            </Button>
          </div>
        </form>
      ) : null}

      <ConfirmModal
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="O'qituvchini olib tashlash"
        description={
          removing
            ? `${removing.user_name ?? "O'qituvchi"} guruhdan olib tashlanadi.${
                removing.role === "main"
                  ? " Guruhda asosiy o'qituvchi qolmaydi — yangisini belgilang."
                  : ""
              }`
            : undefined
        }
        confirmLabel="Olib tashlash"
        loading={pending}
        onConfirm={() => {
          if (removing) onRemove(removing.id);
          setRemoving(null);
        }}
      />
    </section>
  );
}
