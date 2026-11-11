import { useEffect, useRef, useState } from "react";
import { GraduationCap, UserPlus } from "lucide-react";

import { leadName, useLeadConvert, type Lead } from "@/modules/leads";
import { useGroupList } from "@/modules/groups";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

interface LeadConvertSheetProps {
  /** Aylantiriladigan lid (`null` — oyna yopiq). */
  lead: Lead | null;
  onClose: () => void;
  /** Muvaffaqiyatli konvertatsiyadan keyin (masalan, o'quvchiga o'tish). */
  onConverted?: (studentId: string | null) => void;
}

/**
 * Lid → o'quvchi konvertatsiyasi.
 *
 * Bir qadamda: lid ma'lumotlaridan o'quvchi yaratiladi, ixtiyoriy ravishda
 * guruhga a'zo qilinadi va lid yopiladi (`stage: won`). Lid allaqachon
 * aylantirilgan bo'lsa, oyna buni ko'rsatadi va takroriy yaratishga yo'l
 * qo'yilmaydi (mock ham 400 qaytaradi).
 */
export default function LeadConvertSheet({
  lead,
  onClose,
  onConverted,
}: LeadConvertSheetProps) {
  const open = Boolean(lead);

  const { data: groupsData } = useGroupList({ page: 1, page_size: 100 });
  const groups = groupsData?.results ?? [];

  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", group_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Yaratilgan o'quvchi ID'si — `onDone` shu ref'dan o'qiydi (render'ga bog'liq emas). */
  const convertedStudentId = useRef<string | null>(null);

  const convert = useLeadConvert(lead?.id ?? "", () => {
    onClose();
    onConverted?.(convertedStudentId.current);
  });

  /* Lid almashganda forma lid ma'lumotlari bilan to'ldiriladi. */
  useEffect(() => {
    if (!lead) {
      setForm({ first_name: "", last_name: "", phone: "", group_id: "" });
      setErrors({});
      return;
    }
    setForm({
      first_name: lead.first_name ?? "",
      last_name: lead.last_name ?? "",
      phone: lead.phone ?? "",
      group_id: "",
    });
    setErrors({});
    convertedStudentId.current = null;
  }, [lead]);

  if (!lead) return null;

  const alreadyConverted = Boolean(lead.converted_to_student_id);

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = "Ismni kiriting";
    if (!form.phone.trim()) next.phone = "Telefon raqamni kiriting";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    convert.mutate(
      {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        group_id: form.group_id || null,
      },
      {
        onSuccess: (result) => {
          const payload = result as { student?: { id?: string } } | undefined;
          convertedStudentId.current = payload?.student?.id ?? null;
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent>
        <SheetHeader>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-success-soft text-success-ink">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <SheetTitle>O'quvchiga aylantirish</SheetTitle>
            <SheetDescription>{leadName(lead)} · {lead.phone}</SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          {alreadyConverted ? (
            <div className="grid gap-2 rounded-md border border-success/30 bg-success-soft p-3.5 text-sm text-success-ink">
              <p className="font-semibold">Bu lid allaqachon aylantirilgan</p>
              <p>
                O'quvchi:{" "}
                <span className="font-semibold">
                  {lead.converted_student_name ?? lead.converted_to_student_id}
                </span>
                {lead.converted_group_name ? ` · Guruh: ${lead.converted_group_name}` : ""}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-secondary">
                Lid ma'lumotlaridan yangi o'quvchi yaratiladi (sinov holatida) va lid
                yopiladi. Guruhni tanlasangiz, o'quvchi darhol guruhga a'zo qilinadi.
              </p>

              <FormField id="lc-first" label="Ism" required error={errors.first_name}>
                <Input
                  id="lc-first"
                  value={form.first_name}
                  onChange={(event) => setForm({ ...form, first_name: event.target.value })}
                />
              </FormField>

              <FormField id="lc-last" label="Familiya">
                <Input
                  id="lc-last"
                  value={form.last_name}
                  onChange={(event) => setForm({ ...form, last_name: event.target.value })}
                />
              </FormField>

              <FormField id="lc-phone" label="Telefon" required error={errors.phone}>
                <Input
                  id="lc-phone"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </FormField>

              <FormField id="lc-group" label="Guruh (ixtiyoriy)">
                <Select
                  id="lc-group"
                  value={form.group_id}
                  onChange={(event) => setForm({ ...form, group_id: event.target.value })}
                >
                  <option value="">Guruhga qo'shmasdan</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.students_count ?? 0}/{group.capacity ?? "—"})
                    </option>
                  ))}
                </Select>
              </FormField>
            </>
          )}
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" onClick={onClose} disabled={convert.isPending}>
            {alreadyConverted ? "Yopish" : "Bekor qilish"}
          </Button>
          {!alreadyConverted && (
            <Button onClick={submit} loading={convert.isPending}>
              <UserPlus className="h-4 w-4" />
              O'quvchiga aylantirish
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
