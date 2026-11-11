import { Users } from "lucide-react";

import { tiyinToSom } from "@/shared/lib";
import { parseScheduleLabel } from "@/shared/lib/schedule";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { groupPayload, type GroupValues } from "../model/schemas";
import type { Group } from "../model/types";
import { GroupForm, type Option } from "./group-form";

const FORM_ID = "group-form";

function toFormValues(group: Group): Partial<GroupValues> {
  return {
    branch_id: group.branch_id,
    course_id: group.course_id,
    name: group.name,
    color: group.color ?? undefined,
    room_id: group.room_id ?? "",
    capacity: group.capacity ?? 0,
    price_som: tiyinToSom(group.price_tiyin),
    start_date: group.start_date ? group.start_date.slice(0, 10) : "",
    end_date: group.end_date ? group.end_date.slice(0, 10) : "",
    billing_mode: group.billing_mode,
    status: group.status,
    /* Yangi API `schedule` qaytaradi; eski yozuvlar uchun yorliqdan tiklaymiz. */
    schedule:
      group.schedule && group.schedule.length > 0
        ? group.schedule
        : parseScheduleLabel(group.schedule_label),
  };
}

interface GroupFormSheetProps {
  open: boolean;
  /** `null` — yangi guruh yaratiladi. */
  group: Group | null;
  branches: Option[];
  courses: Option[];
  rooms: Option[];
  pending?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onClose: () => void;
}

/**
 * Guruh yaratish/tahrirlash paneli. Ro'yxat sahifasi ham, guruh sahifasi ham
 * shu komponentdan foydalanadi — forma ikki joyda takrorlanmasin.
 */
export function GroupFormSheet({
  open,
  group,
  branches,
  courses,
  rooms,
  pending = false,
  onSubmit,
  onClose,
}: GroupFormSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent>
        <SheetHeader>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <SheetTitle>{group ? "Guruhni tahrirlash" : "Yangi guruh"}</SheetTitle>
            <SheetDescription>
              Narx so'mda kiritiladi va hisob-kitob shu asosda bo'ladi. O'qituvchilar
              guruh sahifasida biriktiriladi.
            </SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          <GroupForm
            key={group?.id ?? "new"}
            formId={FORM_ID}
            defaultValues={group ? toFormValues(group) : undefined}
            branches={branches}
            courses={courses}
            rooms={rooms}
            onSubmit={(values) => onSubmit(groupPayload(values))}
          />
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Bekor qilish
          </Button>
          <Button type="submit" form={FORM_ID} loading={pending}>
            {group ? "Saqlash" : "Yaratish"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
