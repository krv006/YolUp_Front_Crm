import { useState } from "react";
import { MoreHorizontal, Plus, UserMinus, Users } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  ConfirmModal,
} from "@/shared/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { FormField } from "@/shared/ui/form-field";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";
import type { GroupStudent } from "../model/types";

export interface StudentOption {
  id: string;
  name: string;
  /** Boshqa faol guruhdagi o'quvchi — ogohlantirish uchun. */
  groupName?: string | null;
}

interface GroupStudentsPanelProps {
  members: GroupStudent[];
  isLoading: boolean;
  options: StudentOption[];
  capacity: number;
  canManage: boolean;
  pending?: boolean;
  onEnroll: (payload: Record<string, unknown>) => void;
  onStatusChange: (enrollmentId: string, payload: Record<string, unknown>) => void;
  onRemove: (enrollmentId: string) => void;
}

/** A'zolik holatlari — sabab talab qiladiganlari alohida belgilangan. */
const MEMBER_STATUSES = ["trial", "active", "frozen", "left", "completed"] as const;
const REASON_REQUIRED: string[] = ["frozen", "left"];

const STATUS_HINT: Record<string, string> = {
  trial: "Sinov darsi — hali asosiy a'zo emas",
  active: "To'lov qilayotgan a'zo",
  frozen: "Muzlatilgan — sabab majburiy",
  left: "Guruhdan chiqqan — sabab majburiy",
  completed: "Kursni tugatgan",
};

const ENROLLABLE = ["trial", "active"] as const;

/**
 * Guruh a'zolari: holat, balans va amallar. «Har bir imkoniyat» qoidasi
 * bo'yicha muzlatish/chiqishda sabab so'raladi, guruh to'lgan bo'lsa qabul
 * bloklanadi, a'zolikni butunlay o'chirish alohida tasdiqlanadi.
 */
export function GroupStudentsPanel({
  members,
  isLoading,
  options,
  capacity,
  canManage,
  pending = false,
  onEnroll,
  onStatusChange,
  onRemove,
}: GroupStudentsPanelProps) {
  const [studentId, setStudentId] = useState("");
  const [enteringStatus, setEnteringStatus] = useState<string>("trial");
  const [statusTarget, setStatusTarget] = useState<{ member: GroupStudent; status: string } | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [removing, setRemoving] = useState<GroupStudent | null>(null);

  const memberIds = new Set(members.map((member) => member.student_id));
  const available = options.filter((option) => !memberIds.has(option.id));
  const activeCount = members.filter(
    (member) => member.status !== "left" && member.status !== "completed",
  ).length;
  const isFull = capacity > 0 && activeCount >= capacity;

  const askStatus = (member: GroupStudent, status: string) => {
    if (REASON_REQUIRED.includes(status)) {
      setReason("");
      setStatusTarget({ member, status });
      return;
    }
    onStatusChange(member.id, { status });
  };

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Users className="h-4 w-4 text-ink-muted" />
          O'quvchilar
          <span className="text-ink-muted">
            ({activeCount}
            {capacity > 0 ? `/${capacity}` : ""})
          </span>
        </h2>
        {isFull ? (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger-ink">
            Guruh to'lgan
          </span>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        {isLoading ? (
          <div className="grid gap-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Guruhda o'quvchi yo'q"
            description="O'quvchini guruhga qo'shsangiz, davomat va to'lovlar shu guruh bo'yicha hisoblanadi."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface-inset text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">O'quvchi</th>
                  <th className="px-4 py-2.5 font-semibold">Holat</th>
                  <th className="px-4 py-2.5 font-semibold">Qo'shilgan</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Balans</th>
                  {canManage ? <th className="w-12 px-2 py-2.5" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const balance = Number(member.student_balance_tiyin ?? 0);
                  return (
                    <tr key={member.id} className="align-middle">
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-ink">
                          {member.student_name ?? "O'quvchi"}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {member.student_phone ?? "Telefon yo'q"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={member.status} />
                        {member.status === "frozen" && member.freeze_reason ? (
                          <span className="mt-1 block text-xs text-ink-muted">
                            {member.freeze_reason}
                          </span>
                        ) : null}
                        {member.status === "left" && member.left_reason ? (
                          <span className="mt-1 block text-xs text-ink-muted">
                            {member.left_reason}
                          </span>
                        ) : null}
                      </td>
                      <td className="money px-4 py-3 text-ink-secondary">
                        {member.joined_at?.slice(0, 10) ?? "—"}
                      </td>
                      <td
                        className={cn(
                          "money px-4 py-3 text-right font-semibold",
                          balance < 0 ? "text-danger-ink" : "text-ink",
                        )}
                      >
                        {formatMoney(balance)}
                      </td>
                      {canManage ? (
                        <td className="px-2 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`${member.student_name ?? "O'quvchi"} amallari`}
                                className="h-8 w-8 px-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Holatni o'zgartirish</DropdownMenuLabel>
                              {MEMBER_STATUSES.map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  disabled={member.status === status}
                                  onSelect={() => askStatus(member, status)}
                                >
                                  <StatusBadge status={status} dot={false} />
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-danger-ink"
                                onSelect={() => setRemoving(member)}
                              >
                                <UserMinus className="h-4 w-4" />
                                Guruhdan chiqarish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!studentId) return;
            onEnroll({ student_id: studentId, status: enteringStatus });
            setStudentId("");
          }}
          className="grid gap-3 rounded-lg border border-dashed border-border-strong bg-surface-inset p-4 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end"
        >
          <FormField
            id="enroll-student"
            label="O'quvchi qo'shish"
            hint={
              available.length === 0
                ? "Barcha o'quvchilar shu guruhda"
                : isFull
                  ? "Guruh to'lgan — avval joy bo'shating"
                  : undefined
            }
          >
            <Select
              id="enroll-student"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={available.length === 0 || isFull}
            >
              <option value="">Tanlang…</option>
              {available.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {option.groupName ? ` — ${option.groupName}` : ""}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="enroll-status" label="Holat">
            <Select
              id="enroll-status"
              value={enteringStatus}
              onChange={(event) => setEnteringStatus(event.target.value)}
              disabled={isFull}
            >
              {ENROLLABLE.map((status) => (
                <option key={status} value={status}>
                  {status === "trial" ? "Sinov" : "Faol"}
                </option>
              ))}
            </Select>
          </FormField>

          <Button
            type="submit"
            size="sm"
            loading={pending}
            disabled={!studentId || isFull}
            className="sm:mb-[2px]"
          >
            <Plus className="h-4 w-4" />
            Qo'shish
          </Button>
        </form>
      ) : null}

      {/* Muzlatish/chiqishda sabab majburiy — Cron katalogi keyingi bosqichda. */}
      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogTitle>A'zolik holatini o'zgartirish</DialogTitle>
          <DialogDescription>
            {statusTarget
              ? `${statusTarget.member.student_name ?? "O'quvchi"} — ${
                  STATUS_HINT[statusTarget.status] ?? statusTarget.status
                }`
              : undefined}
          </DialogDescription>

          <FormField id="status-reason" label="Sabab" required>
            <Textarea
              id="status-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Masalan: moliyaviy qiyinchilik"
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setStatusTarget(null)} disabled={pending}>
              Bekor qilish
            </Button>
            <Button
              loading={pending}
              disabled={(reason ?? "").trim().length === 0}
              onClick={() => {
                if (!statusTarget) return;
                onStatusChange(statusTarget.member.id, {
                  status: statusTarget.status,
                  [statusTarget.status === "frozen" ? "freeze_reason" : "left_reason"]: reason,
                });
                setStatusTarget(null);
              }}
            >
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="O'quvchini guruhdan chiqarish"
        description={
          removing
            ? `${removing.student_name ?? "O'quvchi"} a'zoligi butunlay o'chiriladi. Davomat va to'lov tarixini saqlab qolish uchun "Ketgan" holatidan foydalanish tavsiya etiladi.`
            : undefined
        }
        confirmLabel="Chiqarish"
        loading={pending}
        onConfirm={() => {
          if (removing) onRemove(removing.id);
          setRemoving(null);
        }}
      />
    </section>
  );
}
