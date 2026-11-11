import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, UserPlus } from "lucide-react";

import { groupApi, groupKeys, useGroupList } from "@/modules/groups";
import { useStudentCreate, useStudentList } from "@/modules/students";
import {
  paymentPayload,
  usePaymentCreate,
  usePaymentMethodList,
} from "@/modules/finance";
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
import { toastError, toastInfo, toastSuccess } from "@/shared/lib/toast";
import { useShellStore } from "@/shared/model";

/**
 * Tezkor amallar — dashboard, topbar va command palette'dan ochiladi.
 *
 * Bu yerdagi formalar **modul API'lari** orqali ishlaydi (to'lov turi
 * katalogdan, o'quvchi yaratilgach guruhga enrollment yaratiladi). Ilgari
 * bu yerda `http` ga to'g'ridan-to'g'ri murojaat qilinardi: kesh
 * yangilanmasdi, to'lov usullari qattiq yozilgan edi va "Ota-ona ismi"
 * maydoni hech qayerga yuborilmasdi.
 */
export default function QuickActionSheets() {
  const quickAction = useShellStore((s) => s.quickAction);
  const setQuickAction = useShellStore((s) => s.setQuickAction);

  return (
    <>
      <AddStudentSheet
        open={quickAction === "student"}
        onClose={() => setQuickAction(null)}
      />
      <AddPaymentSheet
        open={quickAction === "payment"}
        onClose={() => setQuickAction(null)}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function AddStudentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", group_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: groupsData } = useGroupList({ page: 1, page_size: 100 });
  const groups = groupsData?.results ?? [];

  const create = useStudentCreate();
  const queryClient = useQueryClient();

  /*
   * Guruhga a'zo qilish — guruh ID **so'rov paytida** uzatiladi.
   * `useGroupEnroll(id)` ni ishlatib bo'lmaydi: forma yopilganda u bo'sh
   * ID bilan qayta render bo'lardi va so'rov `/groups//enroll/` ga ketardi.
   */
  const enroll = useMutation({
    mutationFn: (vars: { groupId: string; studentId: string }) =>
      groupApi.enroll(vars.groupId, { student_id: vars.studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      toastSuccess("O'quvchi guruhga qo'shildi");
    },
    onError: (error) => toastError(error),
  });

  /* Yopilganda forma tozalanadi — keyingi ochilishda eski qiymat qolmasin. */
  useEffect(() => {
    if (!open) {
      setForm({ name: "", phone: "", group_id: "" });
      setErrors({});
    }
  }, [open]);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Ismni kiriting";
    if (!form.phone.trim()) next.phone = "Telefon raqamni kiriting";
    if (!form.group_id) next.group_id = "Guruhni tanlang";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const parts = form.name.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    const groupId = form.group_id;

    let created: { id?: string } | undefined;
    try {
      created = (await create.mutateAsync({
        first_name: firstName,
        last_name: lastName || "—",
        phone: form.phone.trim(),
        status: "trial",
      })) as { id?: string };
    } catch {
      /* Xato toast'i modul ichida ko'rsatiladi — forma ochiq qoladi. */
      return;
    }

    /*
     * O'quvchi yaratildi; endi guruhga a'zo qilamiz. Bu qadam
     * muvaffaqiyatsiz bo'lsa o'quvchi baribir mavjud — uni Guruhlar
     * bo'limidan qo'shish mumkin. Sheet faqat ikkala qadam tugagach yopiladi.
     */
    if (groupId && created?.id) {
      try {
        await enroll.mutateAsync({ groupId, studentId: created.id });
      } catch {
        toastInfo("O'quvchi yaratildi, lekin guruhga qo'shilmadi — Guruhlar bo'limidan qo'shing");
      }
    }

    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent>
        <SheetHeader>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <SheetTitle>O'quvchi qo'shish</SheetTitle>
            <SheetDescription>
              O'quvchi yaratiladi va tanlangan guruhga biriktiriladi (sinov holatida).
            </SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          <FormField id="qs-name" label="To'liq ism" required error={errors.name}>
            <Input
              id="qs-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Masalan, Aziz Karimov"
            />
          </FormField>

          <FormField id="qs-phone" label="Telefon" required error={errors.phone}>
            <Input
              id="qs-phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+998 90 000 00 00"
            />
          </FormField>

          <FormField id="qs-group" label="Guruh" required error={errors.group_id}>
            <Select
              id="qs-group"
              value={form.group_id}
              onChange={(event) => setForm({ ...form, group_id: event.target.value })}
            >
              <option value="">Tanlang…</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </FormField>
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            Bekor qilish
          </Button>
          <Button onClick={submit} loading={create.isPending || enroll.isPending}>
            Saqlash
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

function AddPaymentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ student_id: "", amount: "", method: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: studentsData } = useStudentList({ page: 1, page_size: 200 });
  const { data: methodsData } = usePaymentMethodList({
    page: 1,
    page_size: 50,
    is_active: "true",
  });
  const methods = methodsData?.results ?? [];

  const create = usePaymentCreate();

  const defaultMethod = methods[0]?.code ?? "";

  useEffect(() => {
    if (!open) {
      setForm({ student_id: "", amount: "", method: "", note: "" });
      setErrors({});
      return;
    }
    if (!form.method && defaultMethod) {
      setForm((current) => ({ ...current, method: defaultMethod }));
    }
  }, [open, defaultMethod, form.method]);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!form.student_id) next.student_id = "O'quvchini tanlang";
    const amount = Number(form.amount.replace(/\s/g, ""));
    if (!form.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      next.amount = "Summani kiriting";
    }
    if (!form.method) next.method = "To'lov turini tanlang";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await create.mutateAsync(
        paymentPayload({
          student_id: form.student_id,
          amount_som: amount,
          method: form.method,
          note: form.note.trim() || null,
          group_id: null,
        }),
      );
      onClose();
    } catch {
      /* Xato toast'i modul ichida — forma ochiq qoladi. */
    }
  };

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent>
        <SheetHeader>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-success-soft text-success-ink">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <SheetTitle>To'lov qabul qilish</SheetTitle>
            <SheetDescription>
              To'lov kassaga yoziladi va o'quvchining qarzi avtomatik yopiladi.
            </SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody>
          <FormField id="qp-student" label="O'quvchi" required error={errors.student_id}>
            <Select
              id="qp-student"
              value={form.student_id}
              onChange={(event) => setForm({ ...form, student_id: event.target.value })}
            >
              <option value="">Tanlang…</option>
              {(studentsData?.results ?? []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="qp-amount" label="Summa (so'm)" required error={errors.amount}>
            <Input
              id="qp-amount"
              inputMode="numeric"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              placeholder="1 200 000"
            />
          </FormField>

          <FormField id="qp-method" label="To'lov turi" required error={errors.method}>
            <Select
              id="qp-method"
              value={form.method}
              onChange={(event) => setForm({ ...form, method: event.target.value })}
            >
              {methods.length === 0 && <option value="">Turni tanlang…</option>}
              {methods.map((method) => (
                <option key={method.code} value={method.code}>
                  {method.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="qp-note" label="Izoh">
            <Input
              id="qp-note"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Masalan, noyabr oyi uchun"
            />
          </FormField>
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
            Bekor qilish
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            To'lovni qabul qilish
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** To'lov uchun o'quvchilar — faqat forma ochilganda yuklanadi. */
