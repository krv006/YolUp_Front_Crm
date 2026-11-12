import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Check, Clock, Users } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import {
  WEEKDAY_OPTIONS,
  addMinutes,
  durationMinutes,
  normalizeTime,
  scheduleSummary,
} from '@/shared/lib/schedule';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { groupSchema, type GroupValues } from '../model/schemas';

export interface Option {
  id: string;
  name: string;
  /** Xona uchun — filial bo'yicha filtrlash. */
  branchId?: string | null;
  /** Xona uchun — sig'im maslahati. */
  capacity?: number | null;
}

/** Swatches offered for the group colour dot. */
const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#dc2626', '#0891b2'];

const BILLING_MODES: Array<{ value: GroupValues['billing_mode']; label: string }> = [
  { value: 'monthly_calendar', label: "Oylik — kalendar oyi bo'yicha" },
  { value: 'per_lesson', label: 'Har bir dars uchun' },
];

const STATUSES: Array<{ value: GroupValues['status']; label: string }> = [
  { value: 'planned', label: 'Rejalashtirilgan' },
  { value: 'active', label: 'Faol' },
  { value: 'completed', label: 'Tugallangan' },
];

interface GroupFormProps {
  formId: string;
  defaultValues?: Partial<GroupValues>;
  branches: Option[];
  courses: Option[];
  rooms: Option[];
  onSubmit: (values: GroupValues) => void;
}

/**
 * Guruh formasi — asosiy maydonlar, **haftalik jadval**, xona va sig'im.
 *
 * Jadval bitta vaqt oralig'i bilan tanlanadi (MVP): kunlarni belgilang,
 * boshlanish/tugash vaqtini kiriting — darslar shu asosda avtomatik
 * generatsiya qilinadi.
 */
export function GroupForm({
  formId,
  defaultValues,
  branches,
  courses,
  rooms,
  onSubmit,
}: GroupFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      branch_id: '',
      course_id: '',
      name: '',
      color: COLORS[0],
      room_id: '',
      capacity: 0,
      price_som: 0,
      start_date: '',
      end_date: '',
      billing_mode: 'monthly_calendar',
      status: 'active',
      schedule: [],
      ...defaultValues,
    },
  });

  const schedule = watch('schedule') ?? [];
  const branchId = watch('branch_id');
  const roomId = watch('room_id');

  const initialSlot = (defaultValues?.schedule ?? [])[0];
  const [startTime, setStartTime] = useState(() => normalizeTime(initialSlot?.start_time, '09:00'));
  const [endTime, setEndTime] = useState(() => normalizeTime(initialSlot?.end_time, '10:30'));

  const selectedDays = useMemo(() => schedule.map((slot) => Number(slot.day_of_week)), [schedule]);
  const minutes = durationMinutes(startTime, endTime);

  /** Tanlangan kunlarga joriy vaqtni qo'llaydi. */
  const applySchedule = (days: number[], start = startTime, end = endTime) => {
    const ordered = WEEKDAY_OPTIONS.filter((day) => days.includes(day.value)).map((day) => ({
      day_of_week: day.value,
      start_time: start,
      end_time: end,
    }));
    setValue('schedule', ordered, { shouldValidate: true, shouldDirty: true });
  };

  const toggleDay = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((value) => value !== day)
      : [...selectedDays, day];
    applySchedule(next);
  };

  const changeStart = (value: string) => {
    const next = normalizeTime(value, startTime);
    setStartTime(next);
    /* Tugash vaqti boshlanishdan oldin qolib ketmasin. */
    const safeEnd = endTime <= next ? addMinutes(next, 90) : endTime;
    if (safeEnd !== endTime) setEndTime(safeEnd);
    if (selectedDays.length > 0) applySchedule(selectedDays, next, safeEnd);
  };

  const changeEnd = (value: string) => {
    const next = normalizeTime(value, endTime);
    setEndTime(next);
    if (selectedDays.length > 0) applySchedule(selectedDays, startTime, next);
  };

  /* Filial o'zgarsa, boshqa filialdagi xona tanlovi tozalanadi. */
  useEffect(() => {
    if (!roomId || !branchId) return;
    const room = rooms.find((item) => item.id === roomId);
    if (room?.branchId && room.branchId !== branchId) {
      setValue('room_id', '', { shouldDirty: true });
    }
  }, [branchId, roomId, rooms, setValue]);

  const roomOptions = rooms.filter(
    (room) => !branchId || !room.branchId || room.branchId === branchId
  );
  const selectedRoom = rooms.find((room) => room.id === roomId);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField id={`${formId}-name`} label="Guruh nomi" required error={errors.name?.message}>
        <Input
          id={`${formId}-name`}
          placeholder="Ingliz tili — Beginner A1"
          {...register('name')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-branch_id`}
          label="Filial"
          required
          error={errors.branch_id?.message}
        >
          <Select id={`${formId}-branch_id`} {...register('branch_id')}>
            <option value="">Filialni tanlang…</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id={`${formId}-course_id`}
          label="Kurs"
          required
          error={errors.course_id?.message}
        >
          <Select id={`${formId}-course_id`} {...register('course_id')}>
            <option value="">Kursni tanlang…</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {/* ---------------------------- Haftalik jadval --------------------------- */}
      <section className="grid gap-3 rounded-lg border border-border bg-surface-inset p-3.5">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 flex-none text-ink-muted" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Haftalik jadval</p>
            <p className="text-xs text-ink-muted">
              Dars kunlari va vaqti. Davomat darslari shu jadval asosida yaratiladi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Dars kunlari">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={active}
                title={day.label}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  'min-w-[46px] rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'border-action bg-action text-white'
                    : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
                )}
              >
                {day.short}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id={`${formId}-start_time`} label="Boshlanish vaqti">
            <Input
              id={`${formId}-start_time`}
              type="time"
              step={300}
              value={startTime}
              onChange={(event) => changeStart(event.target.value)}
            />
          </FormField>

          <FormField
            id={`${formId}-end_time`}
            label="Tugash vaqti"
            error={
              minutes <= 0
                ? "Tugash vaqti boshlanishdan keyin bo'lsin"
                : errors.schedule?.[0]?.end_time?.message
            }
          >
            <Input
              id={`${formId}-end_time`}
              type="time"
              step={300}
              value={endTime}
              onChange={(event) => changeEnd(event.target.value)}
            />
          </FormField>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Clock className="h-3.5 w-3.5" />
          {selectedDays.length > 0
            ? scheduleSummary(schedule)
            : 'Hali kun tanlanmagan — faol guruh uchun kamida bitta kun kerak.'}
        </p>

        {errors.schedule?.message ? (
          <p role="alert" className="text-xs font-medium text-danger-ink">
            {errors.schedule.message}
          </p>
        ) : null}
      </section>

      {/* ------------------------------ Xona / sig'im --------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-room_id`}
          label="Xona"
          hint={selectedRoom?.capacity ? `Xona sig'imi: ${selectedRoom.capacity}` : 'Ixtiyoriy'}
          error={errors.room_id?.message}
        >
          <Select id={`${formId}-room_id`} {...register('room_id')}>
            <option value="">Xona tanlanmagan</option>
            {roomOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id={`${formId}-capacity`}
          label="Guruh sig'imi"
          hint="0 — cheklanmagan"
          error={errors.capacity?.message}
        >
          <Input
            id={`${formId}-capacity`}
            type="number"
            min={0}
            max={1000}
            step={1}
            inputMode="numeric"
            {...register('capacity')}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-price_som`}
          label="Oylik narx (so'm)"
          required
          error={errors.price_som?.message}
        >
          <Input
            id={`${formId}-price_som`}
            type="number"
            min={0}
            step={10_000}
            inputMode="numeric"
            {...register('price_som')}
          />
        </FormField>

        <FormField
          id={`${formId}-billing_mode`}
          label="Hisob-kitob usuli"
          required
          error={errors.billing_mode?.message}
        >
          <Select id={`${formId}-billing_mode`} {...register('billing_mode')}>
            {BILLING_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-start_date`}
          label="Boshlanish sanasi"
          required
          error={errors.start_date?.message}
        >
          <Input id={`${formId}-start_date`} type="date" {...register('start_date')} />
        </FormField>

        <FormField
          id={`${formId}-end_date`}
          label="Tugash sanasi"
          hint="Ixtiyoriy"
          error={errors.end_date?.message}
        >
          <Input id={`${formId}-end_date`} type="date" {...register('end_date')} />
        </FormField>
      </div>

      <FormField id={`${formId}-status`} label="Holat" required error={errors.status?.message}>
        <Select id={`${formId}-status`} {...register('status')}>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id={`${formId}-color`} label="Rang belgisi">
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Rang">
              {COLORS.map((color) => {
                const active = field.value === color;
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`Rang ${color}`}
                    onClick={() => field.onChange(color)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform',
                      active ? 'border-ink scale-105' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {active && <Check className="h-4 w-4 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        />
      </FormField>

      <p className="flex items-start gap-2 rounded-md bg-surface-2 px-3 py-2 text-xs text-ink-muted">
        <Users className="mt-0.5 h-3.5 w-3.5 flex-none" />
        O'qituvchi guruh sahifasida biriktiriladi. Jadval o'zgarsa, kelgusi darslar avtomatik
        yangilanadi.
      </p>

      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
        Saqlash
      </button>
    </form>
  );
}
