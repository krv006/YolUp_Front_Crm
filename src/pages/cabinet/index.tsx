import { ShieldAlert } from "lucide-react";

import { useCurrentUser } from "@/core/auth";
import { usePermission } from "@/core/permission";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import ParentCabinet from "./parent-cabinet";
import StudentCabinet from "./student-cabinet";
import TeacherCabinet from "./teacher-cabinet";

/**
 * Shaxsiy kabinet — rol bo'yicha farq qiladi.
 *
 * `teacher` → guruhlari, bugungi darslari, davomat.
 * `student` → o'z guruhi, davomati, to'lovlari.
 * `parent`  → farzandlari va ularning hisob-kitobi.
 *
 * Rahbariyat (CEO/admin) bu sahifaga tushmaydi — ularning bosh sahifasi
 * `/` (markaz boshqaruv paneli).
 */
export default function CabinetPage() {
  const user = useCurrentUser();
  const { hasRole } = usePermission();

  if (hasRole(["teacher"])) return <TeacherCabinet />;

  if (hasRole(["student"])) {
    if (!user?.student_id) {
      return (
        <div className="grid gap-5">
          <PageHeader title="Kabinet" subtitle="Shaxsiy ma'lumotlar" />
          <Card>
            <EmptyState
              title="O'quvchi bog'lanmagan"
              description="Hisobingizga o'quvchi yozuvi bog'lanmagan — markazga murojaat qiling."
            />
          </Card>
        </div>
      );
    }
    return <StudentCabinet studentId={user.student_id} />;
  }

  if (hasRole(["parent"])) return <ParentCabinet />;

  return (
    <div className="grid gap-5">
      <PageHeader title="Kabinet" subtitle="Shaxsiy ma'lumotlar" />
      <Card>
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Bu bo'lim sizning rolingiz uchun emas"
          description="Rahbariyat bosh sahifasi — / (Bosh sahifa) bo'limi."
        />
      </Card>
    </div>
  );
}
