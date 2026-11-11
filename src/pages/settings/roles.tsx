import { ShieldCheck, UserRound } from "lucide-react";

import { ROLE_LABELS } from "@/core/auth";
import { ROLE_PERMISSIONS, type Permission } from "@/core/permission";
import { useUserList } from "@/modules/users";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { formatNumber } from "@/shared/lib";

/** Resurs kaliti → o'qishga qulay nom. */
const RESOURCE_LABELS: Record<string, string> = {
  tenants: "Markazlar",
  branches: "Filiallar",
  rooms: "Xonalar",
  users: "Xodimlar",
  students: "O'quvchilar",
  parents: "Ota-onalar",
  groups: "Guruhlar",
  courses: "Kurslar",
  schools: "Maktablar",
  schedule: "Jadval",
  days_off: "Dam olish kunlari",
  lessons: "Darslar",
  enrollments: "A'zolik",
  attendance: "Davomat",
  assessments: "Baholash",
  scores: "Baholar",
  leads: "Lidlar",
  lead_sources: "Lid manbalari",
  lead_loss_reasons: "Yo'qotish sabablari",
  lead_stages: "Lid bosqichlari",
  lead_forms: "Lid shakllari",
  payments: "To'lovlar",
  charges: "Hisoblar",
  discounts: "Chegirmalar",
  refunds: "Qaytarishlar",
  expenses: "Xarajatlar",
  expense_categories: "Xarajat turlari",
  cash_shifts: "Kassa smenalari",
  pnl: "Foyda va zarar",
  payroll: "Ish haqi",
  message_templates: "Xabar shablonlari",
  automation_rules: "Avtomatik qoidalar",
  message_logs: "Xabar loglari",
  sms: "SMS",
  roles: "Rollar",
  settings: "Sozlamalar",
  audit_logs: "Audit log",
  approval_requests: "Tasdiqlash",
  reports: "Hisobotlar",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Qo'shish",
  view: "Ko'rish",
  update: "Tahrirlash",
  delete: "O'chirish",
  manage: "Boshqarish",
  block: "Bloklash",
  unblock: "Blokdan chiqarish",
  convert: "O'tkazish",
  lock: "Qulflash",
  pay: "To'lash",
  override_password: "Parolni tiklash",
  view_password: "Parolni ko'rish",
  manage_subscription: "Obunani boshqarish",
  manage_links: "Bog'lanishni boshqarish",
  enroll: "Ro'yxatga olish",
  bulk: "Ommaviy amal",
  send: "Yuborish",
  decide: "Qaror qabul qilish",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ceo: "Markaz egasi — barcha markazlar va sozlamalarga to'liq huquq.",
  admin: "Administrator — kunlik boshqaruv, moliya va xodimlar.",
  teacher: "O'qituvchi — guruhlari, davomat va baholar bilan ishlaydi.",
  parent: "Ota-ona — farzandining davomati, to'lovlari va dars jadvali.",
  student: "O'quvchi — o'z jadvali, uy vazifalari va baholari.",
};

function groupByResource(permissions: Permission[]) {
  const groups = new Map<string, string[]>();

  for (const permission of permissions) {
    const [resource, ...rest] = permission.split(".");
    const action = rest.join(".") || permission;
    const list = groups.get(resource) ?? [];
    list.push(action);
    groups.set(resource, list);
  }

  return Array.from(groups.entries()).map(([resource, actions]) => ({
    resource,
    actions: [...actions].sort(),
  }));
}

export default function SettingsRolesPage() {
  const { data: usersData } = useUserList({ page: 1, page_size: 200 });
  const users = usersData?.results ?? [];

  const userCountByRole = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1;
    return acc;
  }, {});

  const roles = Object.keys(ROLE_PERMISSIONS).map((role) => ({
    role,
    permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS],
    groups: groupByResource(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]),
    count: userCountByRole[role] ?? 0,
  }));

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Rollar"
        subtitle="5 ta asosiy rol va ularning ruxsatlari — hozircha faqat ko'rish uchun, custom rollar keyingi bosqichda qo'shiladi"
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {roles.map(({ role, count }) => (
          <StatCard
            key={role}
            size="sm"
            label={ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
            value={formatNumber(count)}
            icon={<UserRound className="h-4 w-4" />}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map(({ role, groups }) => (
          <Card key={role} className="flex flex-col p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-ink">
                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
                </h2>
                <p className="text-xs text-ink-muted">
                  {groups.length} ta bo'lim · {formatNumber(userCountByRole[role] ?? 0)} xodim
                </p>
              </div>
            </div>

            {ROLE_DESCRIPTIONS[role] && (
              <p className="mt-3 text-sm text-ink-muted">{ROLE_DESCRIPTIONS[role]}</p>
            )}

            <div className="mt-4 grid gap-2.5">
              {groups.map(({ resource, actions }) => (
                <div key={resource} className="grid gap-1">
                  <span className="text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                    {RESOURCE_LABELS[resource] ?? resource}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map((action) => (
                      <Chip key={action} tone="neutral">
                        {ACTION_LABELS[action] ?? action}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
