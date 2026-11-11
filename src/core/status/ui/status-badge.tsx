import { Chip, type ChipProps } from "@/shared/ui/chip";
import { cn } from "@/shared/lib/cn";

interface StatusBadgeProps {
  status: string;
  /** Ko'rsatiladigan matn — jadvalda yo'q kalitlar uchun (masalan kanban ustuni). */
  label?: string;
  /** Rangni majburan almashtirish. */
  tone?: Tone;
  className?: string;
  dot?: boolean;
}

type Tone = NonNullable<ChipProps["tone"]>;

const STATUS: Record<string, { label: string; tone: Tone }> = {
  // attendance
  PRESENT: { label: "Keldi", tone: "success" },
  LATE: { label: "Kechikdi", tone: "warning" },
  ABSENT: { label: "Kelmadi", tone: "danger" },
  EXCUSED: { label: "Ruxsatli", tone: "info" },
  // groups / courses
  planned: { label: "Rejalashtirilgan", tone: "neutral" },
  active: { label: "Faol", tone: "success" },
  completed: { label: "Tugallangan", tone: "success" },
  archived: { label: "Arxiv", tone: "neutral" },
  // payroll
  DRAFT: { label: "Qoralama", tone: "neutral" },
  LOCKED: { label: "Qayd etilgan", tone: "warning" },
  PAID: { label: "To'langan", tone: "success" },
  // leads
  open: { label: "Ochiq", tone: "neutral" },
  trial: { label: "Sinov", tone: "info" },
  won: { label: "O'quvchiga aylandi", tone: "success" },
  lost: { label: "Yutqizdi", tone: "danger" },
  waiting: { label: "Kutilmoqda", tone: "warning" },
  new: { label: "Yangi", tone: "brand" },
  connected: { label: "Bog'landi", tone: "info" },
  not_connected: { label: "Bog'lanmadi", tone: "warning" },
  enrolled: { label: "Ro'yxatga olindi", tone: "success" },
  rejected: { label: "Bekor qilindi", tone: "danger" },
  // enrollment / student
  frozen: { label: "Muzlatilgan", tone: "warning" },
  left: { label: "Ketgan", tone: "neutral" },
  graduated: { label: "Bitirgan", tone: "success" },
  inactive: { label: "Faol emas", tone: "neutral" },
  expired: { label: "Muddati tugagan", tone: "warning" },
  blocked: { label: "Bloklangan", tone: "danger" },
  // payment methods
  cash: { label: "Naqd", tone: "neutral" },
  card: { label: "Karta", tone: "neutral" },
  click: { label: "Click", tone: "neutral" },
  payme: { label: "Payme", tone: "neutral" },
  uzum: { label: "Uzum", tone: "neutral" },
  transfer: { label: "O'tkazma", tone: "neutral" },
};

export function StatusBadge({ status, label, tone, className, dot = true }: StatusBadgeProps) {
  const item = STATUS[status];
  return (
    <Chip tone={tone ?? item?.tone ?? "neutral"} dot={dot} className={cn(className)}>
      {label ?? item?.label ?? status}
    </Chip>
  );
}
