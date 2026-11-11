import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

import {
  durationMinutes,
  normalizeTime,
  parseScheduleLabel,
  scheduleLabel,
} from "@/shared/lib/schedule";

import {
  BRANCH_ID,
  TENANT_ID,
  demoAttendance,
  demoBranches,
  demoCenterSettings,
  demoChargesWithPayments,
  demoCourses,
  demoDashboard,
  demoDaysOff,
  demoEnrollments,
  demoExpenseCategories,
  demoExpenses,
  demoGroupTeachers,
  demoGroups,
  demoLeads,
  demoLeadLossReasons,
  demoLeadSources,
  demoLeadStages,
  demoLessons,
  demoMessageLogs,
  demoMessageTemplates,
  demoParents,
  demoParentUser,
  demoPaymentMethods,
  demoPayments,
  demoPayroll,
  demoRooms,
  demoSchools,
  demoStudents,
  demoStudentUser,
  demoTenants,
  demoUser,
  demoUsers,
  resolveDemoUser,
} from "./demo-data";

/**
 * Backend o'rnini bosuvchi mock adapter.
 *
 * `api.defaults.adapter` ga o'rnatiladi — shu sabab bilan butun ilova
 * (react-query, axios interceptorlar, xatoliklarni normallashtirish)
 * o'zgarmagan holda ishlaydi. Haqiqiy backend tayyor bo'lganda
 * `VITE_USE_MOCK_API=false` qilish kifoya.
 */

type AnyRecord = Record<string, any>;

const LATENCY_MS = 260;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/*  Response helpers                                                           */
/* -------------------------------------------------------------------------- */

function respond<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status < 400 ? "OK" : "Error",
    headers: {},
    config,
  } as AxiosResponse<T>;
}

function rejectWith(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosError {
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    config,
    undefined,
    respond(config, data, status),
  );
}

function parseBody(config: InternalAxiosRequestConfig): AnyRecord {
  const { data } = config;
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as AnyRecord;
    } catch {
      return {};
    }
  }
  return data as AnyRecord;
}

/* -------------------------------------------------------------------------- */
/*  Demo "database"                                                            */
/* -------------------------------------------------------------------------- */

const db: Record<string, { items: AnyRecord[] }> = {
  "/tenants/": { items: demoTenants as AnyRecord[] },
  "/branches/": { items: demoBranches as AnyRecord[] },
  "/rooms/": { items: demoRooms as AnyRecord[] },
  "/students/": { items: demoStudents as AnyRecord[] },
  "/groups/": { items: demoGroups as AnyRecord[] },
  "/courses/": { items: demoCourses as AnyRecord[] },
  "/users/": { items: demoUsers as AnyRecord[] },
  "/parents/": { items: demoParents as AnyRecord[] },
  "/leads/": { items: demoLeads as AnyRecord[] },
  "/schools/": { items: demoSchools as AnyRecord[] },
  "/lead-sources/": { items: demoLeadSources as AnyRecord[] },
  "/lead-stages/": { items: demoLeadStages as AnyRecord[] },
  "/lead-loss-reasons/": { items: demoLeadLossReasons as AnyRecord[] },
  "/days-off/": { items: demoDaysOff as AnyRecord[] },
  "/settings/center/": { items: [demoCenterSettings as AnyRecord] },
  "/attendance/": { items: demoAttendance as AnyRecord[] },
  "/payroll/": { items: demoPayroll as AnyRecord[] },
  "/payroll/adjustments/": { items: [] },
  "/finance/payments/": { items: demoPayments as AnyRecord[] },
  "/finance/charges/": { items: demoChargesWithPayments as AnyRecord[] },
  "/finance/payment-methods/": { items: demoPaymentMethods as AnyRecord[] },
  "/finance/expenses/": { items: demoExpenses as AnyRecord[] },
  "/finance/expense-categories/": { items: demoExpenseCategories as AnyRecord[] },
  "/messaging/templates/": { items: demoMessageTemplates as AnyRecord[] },
  "/messaging/logs/": { items: demoMessageLogs as AnyRecord[] },
  /*
   * Guruh ichidagi resurslar (`/groups/{id}/teachers/`) uchun saqlash joyi —
   * tashqi manzili `handleGroupRelations` da qayta ishlanadi.
   */
  "/group-teachers/": { items: demoGroupTeachers as AnyRecord[] },
  "/enrollments/": { items: demoEnrollments as AnyRecord[] },
  // Bo'sh kolleksiyalar — sahifalar 404/ogohlantirish bermasligi uchun.
  "/lessons/": { items: demoLessons as AnyRecord[] },
  "/finance/ledger/": { items: [] },
};

const DEFAULT_PAGE_SIZE = 20;

/** Query params that drive paging/sorting rather than exact-match filtering. */
const RESERVED_PARAMS = new Set(["search", "page", "page_size", "ordering"]);

function paginate(items: AnyRecord[], params: AnyRecord = {}) {
  const search = String(params.search ?? "").trim().toLowerCase();

  let filtered = items;
  if (search) {
    filtered = filtered.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search),
    );
  }

  // Har qanday boshqa parametr — aniq mos kelish bo'yicha filtr
  // (masalan `status=active`, `branch_id=...`, `is_active=true`).
  for (const [key, rawValue] of Object.entries(params)) {
    if (RESERVED_PARAMS.has(key)) continue;
    if (rawValue === undefined || rawValue === null || rawValue === "" || rawValue === "all") {
      continue;
    }

    const expected = String(rawValue);

    if (key === "has_debt") {
      const wantsDebt = expected === "true";
      filtered = filtered.filter(
        (item) => (Number(item.balance_tiyin ?? 0) < 0) === wantsDebt,
      );
      continue;
    }

    filtered = filtered.filter((item) => String(item[key]) === expected);
  }

  // `ordering=-created_at` — minus belgisi kamayish tartibini bildiradi.
  const ordering = String(params.ordering ?? "").trim();
  if (ordering) {
    const descending = ordering.startsWith("-");
    const field = descending ? ordering.slice(1) : ordering;
    filtered = [...filtered].sort((a, b) => {
      const left = a[field];
      const right = b[field];
      if (left === right) return 0;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      const result = left > right ? 1 : -1;
      return descending ? -result : result;
    });
  }

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.page_size) || DEFAULT_PAGE_SIZE);
  const start = (page - 1) * pageSize;

  return {
    count: filtered.length,
    next: start + pageSize < filtered.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: filtered.slice(start, start + pageSize),
  };
}

/** Yangi yozuvga qo'shiladigan maydonlar — demo ma'lumot izchil ko'rinishi uchun. */
function defaultsFor(resource: string): AnyRecord {
  const today = new Date().toISOString();
  switch (resource) {
    case "students":
      return {
        tenant_id: TENANT_ID,
        branch_id: BRANCH_ID,
        middle_name: null,
        email: null,
        birth_date: null,
        gender: null,
        address: null,
        photo_url: null,
        enrollment_date: today,
        status: "trial",
        balance_tiyin: 0,
      };
    case "branches":
    case "rooms":
      return { tenant_id: TENANT_ID, is_active: true };
    case "users":
      return { tenant_id: TENANT_ID, branch_id: BRANCH_ID, is_active: true, avatar_url: null };
    case "groups":
      return { tenant_id: TENANT_ID, branch_id: BRANCH_ID, status: "active", students_count: 0 };
    case "courses":
      return { tenant_id: TENANT_ID, is_active: true };
    case "tenants":
      return { is_active: true, is_blocked: false, students_count: 0 };
    case "leads":
      return {
        tenant_id: TENANT_ID,
        branch_id: BRANCH_ID,
        status: "new",
        stage: "open",
        temperature: "warm",
      };
    case "parents":
      return { tenant_id: TENANT_ID, students_count: 1 };
    case "lead-stages":
      return { tenant_id: TENANT_ID, color: "action", order: 0, is_active: true };
    case "lead-sources":
    case "lead-loss-reasons":
      return { tenant_id: TENANT_ID, is_active: true };
    case "days-off":
      return { tenant_id: TENANT_ID, branch_id: null, note: null, date_to: null };
    case "finance/payments":
      return {
        tenant_id: TENANT_ID,
        paid_at: today,
        receipt_number: `YLP-${Math.floor(2000 + Math.random() * 8000)}`,
      };
    case "finance/charges":
      return {
        tenant_id: TENANT_ID,
        branch_id: BRANCH_ID,
        discount_tiyin: 0,
        paid_tiyin: 0,
        created_by: demoUser.id,
      };
    case "finance/payment-methods":
      return { tenant_id: TENANT_ID, is_active: true };
    case "finance/expenses":
      return { tenant_id: TENANT_ID, branch_id: BRANCH_ID, date: today.slice(0, 10) };
    case "messaging/templates":
      return { tenant_id: TENANT_ID, channel: "sms", is_active: true };
    case "payroll":
      return { tenant_id: TENANT_ID, state: "DRAFT", adjustments_tiyin: 0 };
    default:
      return {};
  }
}

const nextId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/* -------------------------------------------------------------------------- */
/*  Router                                                                     */
/* -------------------------------------------------------------------------- */

function normalizePath(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? "";
  const withoutOrigin = url.replace(/^[a-z]+:\/\/[^/]+/i, "");
  const [path] = withoutOrigin.split("?");
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

async function handleAuth(
  config: InternalAxiosRequestConfig,
  path: string,
  method: string,
): Promise<AxiosResponse | null> {
  if (path === "/auth/login/" && method === "post") {
    const body = parseBody(config);
    if (!body.identifier || !body.password) {
      throw rejectWith(config, 400, {
        detail: "Telefon/email va parol kiritilishi shart",
      });
    }
    /*
     * Demo rejim: parol tekshirilmaydi, lekin **identifikator bo'yicha rol**
     * aniqlanadi (masalan `admin`, `student`, `parent`). Foydalanuvchi ID'si
     * token ichiga yoziladi — sahifa yangilanganda `/auth/me/` sessiyani
     * shundan tiklaydi.
     */
    const user = resolveDemoUser(String(body.identifier));
    const userId = String(user?.id ?? demoUser.id);
    return respond(config, {
      access: `${DEMO_TOKEN_PREFIX}${userId}`,
      refresh: `${DEMO_TOKEN_PREFIX}${userId}`,
    });
  }

  if (path === "/auth/refresh/" && method === "post") {
    const userId = tokenUserId(config) ?? String(demoUser.id);
    return respond(config, {
      access: `${DEMO_TOKEN_PREFIX}${userId}`,
      refresh: `${DEMO_TOKEN_PREFIX}${userId}`,
    });
  }

  if (path === "/auth/logout/" && method === "post") {
    return respond(config, { detail: "Chiqildi" });
  }

  if (path === "/auth/me/" && method === "get") {
    return respond(config, resolveDemoUserById(tokenUserId(config)));
  }

  if (path === "/auth/me/" && (method === "patch" || method === "put")) {
    const body = parseBody(config);
    const current = resolveDemoUserById(tokenUserId(config));
    return respond(config, { ...current, ...body });
  }

  return null;
}

/** Demo tokenlari shu prefiks bilan boshlanadi. */
const DEMO_TOKEN_PREFIX = "demo-access-token:";

/** `Authorization: Bearer demo-access-token:<userId>` dan ID'ni ajratib oladi. */
function tokenUserId(config: InternalAxiosRequestConfig): string | null {
  const raw = String(
    config.headers?.Authorization ?? config.headers?.authorization ?? "",
  );
  const token = raw.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith(DEMO_TOKEN_PREFIX)) return null;
  const id = token.slice(DEMO_TOKEN_PREFIX.length).trim();
  return id.length > 0 ? id : null;
}

/**
 * Token ichidagi ID bo'yicha foydalanuvchini qaytaradi.
 *
 * Backend `/auth/me/` ni token bo'yicha hal qiladi, shuning uchun mock ham
 * xuddi shunday qiladi — aks holda har qanday rolda CEO qaytib, kabinetlar
 * ishlamasdi.
 */
function resolveDemoUserById(userId: string | null): AnyRecord {
  if (!userId) return demoUser;
  if (userId === demoUser.id) return demoUser;
  if (userId === demoStudentUser.id) return demoStudentUser;
  if (userId === demoParentUser.id) return demoParentUser;
  const staff = demoUsers.find((user) => user.id === userId);
  if (staff) return { ...staff, permissions: [] };
  return demoUser;
}

/** `GET /dashboard/overview/` — CEO bosh sahifasi uchun yig'ma ma'lumot. */
function handleDashboard(
  config: InternalAxiosRequestConfig,
  path: string,
  method: string,
): AxiosResponse | null {
  if (path === "/dashboard/overview/" && method === "get") {
    return respond(config, demoDashboard);
  }
  return null;
}

/**
 * Xabarlar: qo'lda SMS yuborish (logga yoziladi) va shablonlar CRUD'i.
 * Shablon nomi takrorlanmasligi tekshiriladi.
 */
function handleMessaging(
  config: InternalAxiosRequestConfig,
  path: string,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (path === "/messaging/sms/send/" && method === "post") {
    const body = parseBody(config);
    const created = {
      id: nextId("message-log"),
      tenant_id: TENANT_ID,
      recipient_phone: String(body.to ?? ""),
      recipient_name: "Qo'lda yuborilgan",
      channel: "sms",
      template_name: null,
      body: String(body.body ?? ""),
      status: "sent",
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    db["/messaging/logs/"].items.unshift(created);
    return respond(config, { sent: 1, log: created }, 201);
  }

  if (segments[0] !== "messaging" || segments[1] !== "templates") return null;

  const templates = db["/messaging/templates/"].items;
  const now = new Date().toISOString();

  /* --- /messaging/templates/ → ro'yxat | yaratish ------------------------ */
  if (segments.length === 2) {
    if (method === "get") {
      return respond(config, paginate(templates, config.params ?? {}));
    }

    if (method === "post") {
      const body = parseBody(config);
      const name = assertUniqueName(config, templates, body);
      if (!String(body.body ?? "").trim()) {
        throw rejectWith(config, 400, { body: ["Xabar matni majburiy"] });
      }
      const created = {
        id: nextId("template"),
        ...defaultsFor("messaging/templates"),
        ...body,
        name,
        created_at: now,
        updated_at: now,
      };
      templates.unshift(created);
      return respond(config, created, 201);
    }

    return null;
  }

  /* --- /messaging/templates/:id/ → tahrirlash | o'chirish --------------- */
  if (segments.length === 3) {
    const index = templates.findIndex((item) => item.id === segments[2]);
    if (index === -1) throw rejectWith(config, 404, { detail: "Shablon topilmadi" });
    const current = templates[index];

    if (method === "get") return respond(config, current);

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const name =
        body.name === undefined
          ? String(current.name)
          : assertUniqueName(config, templates, { name: body.name }, String(current.id));
      if (body.body !== undefined && !String(body.body).trim()) {
        throw rejectWith(config, 400, { body: ["Xabar matni majburiy"] });
      }
      templates[index] = { ...current, ...body, name, updated_at: now };
      return respond(config, templates[index]);
    }

    if (method === "delete") {
      templates.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/** Hisobot manzillari — demo ma'lumotlardan hisoblab beriladi. */
function handleReports(
  config: InternalAxiosRequestConfig,
  path: string,
  method: string,
): AxiosResponse | null {
  if (method !== "get") return null;

  const payments = db["/finance/payments/"].items;
  const expenses = db["/finance/expenses/"].items;
  const students = db["/students/"].items;
  const leads = db["/leads/"].items;
  const attendance = db["/attendance/"].items;
  const payroll = db["/payroll/"].items;

  if (path === "/reports/finance/") {
    const revenue = payments.reduce((sum, item) => sum + Number(item.amount_tiyin ?? 0), 0);
    const spending = expenses.reduce((sum, item) => sum + Number(item.amount_tiyin ?? 0), 0);

    const byMethod = new Map<string, number>();
    for (const payment of payments) {
      const key = String(payment.method ?? "boshqa");
      byMethod.set(key, (byMethod.get(key) ?? 0) + Number(payment.amount_tiyin ?? 0));
    }

    const byStudent = new Map<string, { student_id: string; student_name: string; amount: number }>();
    for (const payment of payments) {
      const key = String(payment.student_id ?? "—");
      const current = byStudent.get(key);
      if (current) {
        current.amount += Number(payment.amount_tiyin ?? 0);
      } else {
        byStudent.set(key, {
          student_id: key,
          student_name: String(payment.student_name ?? "O'quvchi"),
          amount: Number(payment.amount_tiyin ?? 0),
        });
      }
    }

    return respond(config, {
      revenue_tiyin: revenue,
      expenses_tiyin: spending,
      net_profit_tiyin: revenue - spending,
      by_payment_method: [...byMethod].map(([method, amount]) => ({ method, amount })),
      by_student: [...byStudent.values()].sort((a, b) => b.amount - a.amount).slice(0, 10),
    });
  }

  if (path === "/reports/students/") {
    const countOf = (status: string) => students.filter((item) => item.status === status).length;
    return respond(config, {
      total_students: students.length,
      active_students: countOf("active"),
      frozen_students: countOf("frozen"),
      left_students: countOf("left"),
      graduates: countOf("graduated"),
      total_debt_tiyin: students.reduce((sum, item) => {
        const balance = Number(item.balance_tiyin ?? 0);
        return balance < 0 ? sum + balance : sum;
      }, 0),
    });
  }

  if (path === "/reports/leads/") {
    const byStage = new Map<string, number>();
    const bySource = new Map<string, number>();
    for (const lead of leads) {
      const stage = String(lead.stage ?? "open");
      byStage.set(stage, (byStage.get(stage) ?? 0) + 1);
      const source = String(lead.source_name ?? "Boshqa");
      bySource.set(source, (bySource.get(source) ?? 0) + 1);
    }
    const won = leads.filter((lead) => lead.stage === "won").length;
    return respond(config, {
      total_leads: leads.length,
      by_stage: [...byStage].map(([stage, count]) => ({ stage, count })),
      by_source: [...bySource].map(([source, count]) => ({ source, count })),
      conversion_rate: leads.length > 0 ? Math.round((won / leads.length) * 1000) / 10 : 0,
    });
  }

  if (path === "/reports/attendance/") {
    const groups = db["/groups/"].items;
    const present = attendance.filter(
      (item) => item.status === "PRESENT" || item.status === "LATE",
    ).length;
    return respond(config, {
      total_lessons: new Set(attendance.map((item) => item.lesson_id)).size,
      attendance_rate:
        attendance.length > 0 ? Math.round((present / attendance.length) * 1000) / 10 : 0,
      by_group: groups.map((group) => {
        const rows = attendance.filter((item) => item.group_name === group.name);
        const ok = rows.filter(
          (item) => item.status === "PRESENT" || item.status === "LATE",
        ).length;
        return {
          group_id: String(group.id),
          group_name: String(group.name),
          rate: rows.length > 0 ? Math.round((ok / rows.length) * 1000) / 10 : 0,
        };
      }),
    });
  }

  if (path === "/reports/payroll/") {
    const byTeacher = new Map<string, { teacher_id: string; teacher_name: string; amount: number }>();
    for (const row of payroll) {
      const key = String(row.user_id ?? "—");
      byTeacher.set(key, {
        teacher_id: key,
        teacher_name: String(row.user_name ?? "Xodim"),
        amount: Number(row.final_amount_tiyin ?? 0),
      });
    }
    return respond(config, {
      total_payroll_tiyin: payroll.reduce(
        (sum, item) => sum + Number(item.final_amount_tiyin ?? 0),
        0,
      ),
      by_teacher: [...byTeacher.values()].sort((a, b) => b.amount - a.amount),
    });
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Group relations — o'qituvchilar, o'quvchilar, qabul qilish                 */
/* -------------------------------------------------------------------------- */

/** So'rov egasi — mock token ichidagi foydalanuvchi. */
function actorOf(config: InternalAxiosRequestConfig): AnyRecord {
  return resolveDemoUserById(tokenUserId(config));
}

/** Rahbariyat (ceo/admin) — guruh/o'quvchi yozuvlarini boshqaradi. */
function isManager(actor: AnyRecord): boolean {
  return actor.role === "ceo" || actor.role === "admin";
}

function assertManager(config: InternalAxiosRequestConfig): void {
  if (!isManager(actorOf(config))) {
    throw rejectWith(config, 403, { detail: "Bu amal uchun ruxsat yo'q" });
  }
}

/** O'qituvchi faqat o'z guruhini ko'radi (boshqasiga 404). */
function assertGroupVisible(config: InternalAxiosRequestConfig, group: AnyRecord): void {
  const actor = actorOf(config);
  if (actor.role === "teacher" && group.teacher_id !== actor.id) {
    throw rejectWith(config, 404, { detail: "Guruh topilmadi" });
  }
}

/**
 * Guruh yozuviga katalog nomlarini qo'shadi — ro'yxat serializeri kabi.
 * Yangi guruhda `branch_name`/`course_name` bo'sh qolmasligi uchun.
 */
function enrichGroup(group: AnyRecord): AnyRecord {
  const branch = db["/branches/"].items.find((item) => item.id === group.branch_id);
  const course = db["/courses/"].items.find((item) => item.id === group.course_id);
  const room = group.room_id
    ? db["/rooms/"].items.find((item) => item.id === group.room_id)
    : null;
  const teacher = group.teacher_id
    ? db["/users/"].items.find((item) => item.id === group.teacher_id)
    : null;

  return {
    ...group,
    branch_name: branch?.name ?? group.branch_name ?? null,
    course_name: course?.name ?? group.course_name ?? null,
    room_name: room?.name ?? (group.room_id ? group.room_name : null) ?? null,
    teacher_name: teacher
      ? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()
      : group.teacher_name ?? null,
  };
}

/** Guruhning asosiy o'qituvchisini `group-teachers` yozuvlaridan qayta hisoblaydi. */
function syncGroupMainTeacher(groupId: string): void {
  const groups = db["/groups/"].items;
  const index = groups.findIndex((item) => item.id === groupId);
  if (index === -1) return;

  const main = db["/group-teachers/"].items.find(
    (row) => row.group_id === groupId && row.role === "main",
  );
  const user = main
    ? db["/users/"].items.find((item) => item.id === main.user_id)
    : undefined;

  groups[index] = {
    ...groups[index],
    teacher_id: user?.id ?? null,
    teacher_name: user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : null,
    updated_at: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Guruh jadvali → darslar                                                   */
/* -------------------------------------------------------------------------- */

const GROUP_LESSON_TOPICS = [
  "Kirish va takrorlash",
  "Yangi mavzu",
  "Grammatika amaliyoti",
  "Lug'at va talaffuz",
  "Test va tahlil",
  "Nazorat ishi",
  "Suhbat va munozara",
];

const LESSON_WINDOW_PAST_DAYS = 28;
const LESSON_WINDOW_FUTURE_DAYS = 7;
const DAY_MS = 86_400_000;
const pad2 = (value: number) => String(value).padStart(2, "0");

/** Guruh jadvali — yangi maydon, eski yozuvlarda yorliqdan tiklanadi. */
function scheduleOfGroup(group: AnyRecord): Array<{
  day_of_week: number;
  start_time: string;
  end_time: string;
}> {
  const raw = Array.isArray(group.schedule) ? group.schedule : [];
  if (raw.length > 0) {
    return raw
      .map((slot: AnyRecord) => ({
        day_of_week: Number(slot.day_of_week),
        start_time: normalizeTime(slot.start_time, "09:00"),
        end_time: normalizeTime(slot.end_time, "10:30"),
      }))
      .filter((slot) => slot.day_of_week >= 0 && slot.day_of_week <= 6);
  }
  return parseScheduleLabel(String(group.schedule_label ?? ""));
}

/** Bir kunning boshidan sanani `YYYY-MM-DD` ko'rinishida. */
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Guruh jadvali bo'yicha darslarni yaratadi.
 *
 * Idempotent: mavjud darslar `sana + vaqt` kaliti bo'yicha aniqlanadi, shu
 * sabab bilan qayta chaqirilganda dublikat yaratilmaydi. `replaceFuture` —
 * jadval o'zgarganda kelgusi (davomati belgilanmagan) darslarni tozalaydi;
 * o'tgan darslar tarix sifatida saqlanadi.
 */
function generateLessonsForGroup(group: AnyRecord, replaceFuture = false): void {
  const lessons = db["/lessons/"].items;
  const attendance = db["/attendance/"].items;
  const now = new Date();
  const schedule = scheduleOfGroup(group);

  if (replaceFuture) {
    for (let index = lessons.length - 1; index >= 0; index -= 1) {
      const row = lessons[index];
      if (row.group_id !== group.id) continue;
      if (new Date(row.starts_at).getTime() < now.getTime()) continue;
      if (attendance.some((item) => item.lesson_id === row.id)) continue;
      lessons.splice(index, 1);
    }
  }

  if (schedule.length === 0) return;

  const rosterCount = lessonRoster(String(group.id)).length;
  const existingKeys = new Set(
    lessons
      .filter((row) => row.group_id === group.id)
      .map((row) => {
        const date = new Date(row.starts_at);
        return `${dateKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
      }),
  );

  for (let offset = -LESSON_WINDOW_FUTURE_DAYS; offset <= LESSON_WINDOW_PAST_DAYS; offset += 1) {
    const day = new Date(now.getTime() - offset * DAY_MS);
    const slots = schedule.filter((slot) => slot.day_of_week === day.getDay());

    for (const slot of slots) {
      const [hours, minutes] = slot.start_time.split(":").map(Number);
      const start = new Date(day);
      start.setHours(hours, minutes, 0, 0);
      const startsAt = start.toISOString();

      if (group.start_date && startsAt < String(group.start_date)) continue;
      if (group.end_date && startsAt > String(group.end_date)) continue;

      const key = `${dateKey(start)}T${pad2(start.getHours())}:${pad2(start.getMinutes())}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);

      const isPast = start.getTime() <= now.getTime();
      lessons.push({
        id: `lesson-${group.id}-${dateKey(start)}-${pad2(hours)}${pad2(minutes)}`,
        tenant_id: TENANT_ID,
        group_id: group.id,
        room_id: group.room_id ?? null,
        room_name: group.room_name ?? "—",
        title: GROUP_LESSON_TOPICS[lessons.length % GROUP_LESSON_TOPICS.length],
        starts_at: startsAt,
        ends_at: new Date(
          start.getTime() +
            (durationMinutes(slot.start_time, slot.end_time) || 90) * 60_000,
        ).toISOString(),
        status: isPast ? "held" : "scheduled",
        group_name: group.name,
        teacher_name: group.teacher_name ?? "—",
        students_count: rosterCount,
        created_at: startsAt,
        updated_at: startsAt,
      });
    }
  }

  /*
   * Eng oxirgi o'tgan dars "belgilanmagan" qoladi — o'qituvchi davomatni
   * darhol belgilashi uchun (demo fixture'lardagi bilan bir xil qoida).
   */
  const latestPast = lessons
    .filter((row) => row.group_id === group.id)
    .filter((row) => new Date(row.starts_at).getTime() <= now.getTime())
    .sort((a, b) => String(b.starts_at).localeCompare(String(a.starts_at)))[0];

  if (latestPast && !attendance.some((item) => item.lesson_id === latestPast.id)) {
    latestPast.status = "scheduled";
  }
}

/**
 * `POST|PATCH /groups/` — jadval, xona va sig'imni normallashtiradi.
 *
 * `handleCollection` dan oldin chaqiriladi: u oddiy maydonlarni ko'chirib
 * oladi, lekin `schedule` → `schedule_label` va dars generatsiyasini
 * bilmaydi.
 */
function handleGroupWrite(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "groups" || segments.length > 2) return null;
  if (method === "get") return null;

  assertManager(config);

  /* O'chirishni `handleCollection` bajaradi — bu yerda faqat ruxsat tekshirildi. */
  if (method === "delete") return null;

  const groups = db["/groups/"].items;
  const rooms = db["/rooms/"].items;
  const body = parseBody(config);
  const now = new Date().toISOString();

  const normalize = (current?: AnyRecord): AnyRecord => {
    const next: AnyRecord = { ...body };

    const rawSchedule = Array.isArray(body.schedule)
      ? body.schedule
      : Array.isArray(current?.schedule)
        ? current?.schedule
        : undefined;

    if (rawSchedule !== undefined) {
      const schedule = (rawSchedule as AnyRecord[])
        .map((slot) => ({
          day_of_week: Number(slot.day_of_week),
          start_time: normalizeTime(slot.start_time, "09:00"),
          end_time: normalizeTime(slot.end_time, "10:30"),
        }))
        .filter((slot) => slot.day_of_week >= 0 && slot.day_of_week <= 6);

      if (schedule.some((slot) => slot.end_time <= slot.start_time)) {
        throw rejectWith(config, 400, {
          schedule: ["Tugash vaqti boshlanishdan keyin bo'lsin"],
        });
      }

      next.schedule = schedule;
      next.schedule_label = scheduleLabel(schedule);
    }

    if (body.room_id !== undefined) {
      const roomId = body.room_id ? String(body.room_id) : "";
      const room = rooms.find((item) => item.id === roomId);
      const branchId = String(body.branch_id ?? current?.branch_id ?? "");
      if (room && branchId && room.branch_id && room.branch_id !== branchId) {
        throw rejectWith(config, 400, { room_id: ["Xona boshqa filialda"] });
      }
      next.room_id = room ? room.id : null;
      next.room_name = room ? room.name : null;
    }

    if (body.capacity !== undefined) {
      next.capacity = Math.max(0, Number(body.capacity) || 0);
    }

    return next;
  };

  if (method === "post") {
    const normalized = normalize();
    if (String(normalized.name ?? "").trim().length === 0) {
      throw rejectWith(config, 400, { name: ["Nomi majburiy"] });
    }

    const created = enrichGroup({
      id: nextId("groups"),
      ...defaultsFor("groups"),
      capacity: 0,
      room_id: null,
      room_name: null,
      schedule: [],
      schedule_label: "",
      ...normalized,
      created_at: now,
      updated_at: now,
    });

    if (created.status === "active" && created.schedule.length === 0) {
      throw rejectWith(config, 400, {
        schedule: ["Faol guruh uchun kamida bitta dars kuni tanlanishi kerak"],
      });
    }

    groups.unshift(created);
    generateLessonsForGroup(created, true);
    return respond(config, created, 201);
  }

  /* PATCH | PUT */
  const index = groups.findIndex((item) => item.id === segments[1]);
  if (index === -1) throw rejectWith(config, 404, { detail: "Guruh topilmadi" });

  const current = groups[index];
  const updated = enrichGroup({ ...current, ...normalize(current), updated_at: now });

  if (
    updated.status === "active" &&
    (!Array.isArray(updated.schedule) || updated.schedule.length === 0)
  ) {
    throw rejectWith(config, 400, {
      schedule: ["Faol guruh uchun kamida bitta dars kuni tanlanishi kerak"],
    });
  }

  groups[index] = updated;
  generateLessonsForGroup(updated, true);
  return respond(config, updated);
}

/**
 * `POST /payroll/adjustments/` — ish haqiga bonus/jarima/avans qo'shadi.
 *
 * Faqat **qoralama** (DRAFT) holatidagi yozuvga tuzatish kiritiladi: qayd
 * etilgandan keyin summa muzlatiladi. `amount_tiyin` musbat yuboriladi;
 * ishora turiga qarab serverda qo'llanadi.
 */
function handlePayrollAdjustment(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "payroll" || segments[1] !== "adjustments") return null;
  if (method !== "post") return null;

  assertManager(config);

  const body = parseBody(config);
  const payrollId = String(body.payroll_id ?? "");
  const payroll = db["/payroll/"].items.find((item) => item.id === payrollId);
  if (!payroll) throw rejectWith(config, 404, { detail: "Ish haqi yozuvi topilmadi" });

  if (payroll.state !== "DRAFT") {
    throw rejectWith(config, 400, {
      detail: "Faqat qoralama holatidagi yozuvga tuzatish kiritiladi",
    });
  }

  const type = String(body.type ?? "");
  if (!["bonus", "fine", "advance"].includes(type)) {
    throw rejectWith(config, 400, { type: ["Tuzatish turi noto'g'ri"] });
  }

  const amount = Math.abs(Number(body.amount_tiyin) || 0);
  if (amount <= 0) {
    throw rejectWith(config, 400, { amount_tiyin: ["Summa noldan katta bo'lsin"] });
  }

  const now = new Date().toISOString();
  const signed = type === "bonus" ? amount : -amount;
  const created = {
    id: nextId("payroll-adjustment"),
    tenant_id: TENANT_ID,
    payroll_id: payrollId,
    type,
    amount_tiyin: signed,
    reason: body.reason ? String(body.reason) : null,
    created_by: actorOf(config).id,
    created_at: now,
  };

  db["/payroll/adjustments/"].items.unshift(created);
  payroll.adjustments_tiyin = Number(payroll.adjustments_tiyin ?? 0) + signed;
  payroll.final_amount_tiyin =
    Number(payroll.base_amount_tiyin ?? 0) + Number(payroll.adjustments_tiyin ?? 0);

  return respond(config, created, 201);
}

/**
 * `GET|POST /groups/{id}/teachers/`, `PATCH|DELETE /groups/{id}/teachers/{tid}/`,
 * `GET /groups/{id}/students/`, `POST /groups/{id}/enroll/`.
 *
 * `handleCollection` dan oldin chaqiriladi, chunki bu manzillar resurs
 * yozuviga emas, guruh ichidagi bog'lanishlarga tegishli.
 */
function handleGroupRelations(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "groups" || segments.length < 3) return null;

  const groups = db["/groups/"].items;
  const groupIndex = groups.findIndex((item) => item.id === segments[1]);
  if (groupIndex === -1) throw rejectWith(config, 404, { detail: "Guruh topilmadi" });

  const group = groups[groupIndex];
  assertGroupVisible(config, group);

  const teachers = db["/group-teachers/"].items;
  const enrollments = db["/enrollments/"].items;
  const students = db["/students/"].items;
  const now = new Date().toISOString();

  /* --- /groups/:id/teachers/ -------------------------------------------- */
  if (segments.length === 3 && segments[2] === "teachers") {
    if (method === "get") {
      const rows = teachers.filter((row) => row.group_id === group.id);
      return respond(config, paginate(rows, { page_size: 100, ...(config.params ?? {}) }));
    }

    if (method === "post") {
      assertManager(config);
      const body = parseBody(config);
      const userId = String(body.user_id ?? "");

      if (!userId) {
        throw rejectWith(config, 400, { user_id: ["O'qituvchi tanlanishi shart"] });
      }
      if (teachers.some((row) => row.group_id === group.id && row.user_id === userId)) {
        throw rejectWith(config, 400, {
          user_id: ["Bu o'qituvchi allaqachon guruhga biriktirilgan"],
        });
      }

      const role = String(body.role ?? "assistant");
      if (
        role === "main" &&
        teachers.some((row) => row.group_id === group.id && row.role === "main")
      ) {
        throw rejectWith(config, 400, {
          role: ["Guruhda bitta asosiy o'qituvchi bo'lishi mumkin"],
        });
      }

      const teacher = db["/users/"].items.find((item) => item.id === userId);
      const created = {
        id: nextId("group-teacher"),
        group_id: group.id,
        user_id: userId,
        role,
        pay_rule: String(body.pay_rule ?? "fixed"),
        pay_value_tiyin: Number(body.pay_value_tiyin ?? 0),
        user_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : "O'qituvchi",
        user_phone: teacher?.phone ?? null,
        created_at: now,
        updated_at: now,
      };
      teachers.unshift(created);
      syncGroupMainTeacher(group.id);
      return respond(config, created, 201);
    }
  }

  /* --- /groups/:id/teachers/:teacherId/ --------------------------------- */
  if (segments.length === 4 && segments[2] === "teachers") {
    const teacherIndex = teachers.findIndex((row) => row.id === segments[3]);
    if (teacherIndex === -1) throw rejectWith(config, 404, { detail: "O'qituvchi topilmadi" });

    if (method === "patch" || method === "put") {
      assertManager(config);
      const body = parseBody(config);
      const role = body.role === undefined ? teachers[teacherIndex].role : String(body.role);

      if (
        role === "main" &&
        teachers.some(
          (row) =>
            row.id !== segments[3] && row.group_id === group.id && row.role === "main",
        )
      ) {
        throw rejectWith(config, 400, {
          role: ["Guruhda bitta asosiy o'qituvchi bo'lishi mumkin"],
        });
      }

      teachers[teacherIndex] = {
        ...teachers[teacherIndex],
        ...body,
        pay_value_tiyin:
          body.pay_value_tiyin === undefined
            ? teachers[teacherIndex].pay_value_tiyin
            : Number(body.pay_value_tiyin),
        updated_at: now,
      };
      syncGroupMainTeacher(group.id);
      return respond(config, teachers[teacherIndex]);
    }

    if (method === "delete") {
      assertManager(config);
      teachers.splice(teacherIndex, 1);
      syncGroupMainTeacher(group.id);
      return respond(config, null, 204);
    }
  }

  /* --- /groups/:id/students/ -------------------------------------------- */
  if (segments.length === 3 && segments[2] === "students" && method === "get") {
    const rows = enrollments
      .filter((row) => row.group_id === group.id)
      .map((row) => {
        const student = students.find((item) => item.id === row.student_id);
        return {
          ...row,
          student_name: studentName(row.student_id),
          student_phone: student?.phone ?? null,
          student_balance_tiyin: student?.balance_tiyin ?? 0,
          student_status: student?.status ?? null,
        };
      });
    return respond(config, paginate(rows, { page_size: 100, ...(config.params ?? {}) }));
  }

  /* --- /groups/:id/enroll/ ---------------------------------------------- */
  if (segments.length === 3 && segments[2] === "enroll" && method === "post") {
    assertManager(config);
    const body = parseBody(config);
    const studentId = String(body.student_id ?? "");

    if (!studentId) {
      throw rejectWith(config, 400, { student_id: ["O'quvchi tanlanishi shart"] });
    }

    const created = createEnrollment(
      config,
      group.id,
      studentId,
      String(body.status ?? "trial"),
    );

    return respond(config, { ...created, student_name: studentName(studentId) }, 201);
  }

  return null;
}

/**
 * `students_count` ni a'zoliklardan qayta hisoblaydi va (kerak bo'lsa)
 * o'quvchining joriy guruhini yangilaydi — ro'yxat bilan mos turishi uchun.
 */
function syncGroupMembers(groupId: string, studentId?: string) {
  const groups = db["/groups/"].items;
  const enrollments = db["/enrollments/"].items;
  const students = db["/students/"].items;
  const now = new Date().toISOString();

  const groupIndex = groups.findIndex((item) => item.id === groupId);
  if (groupIndex === -1) return;

  const members = enrollments.filter(
    (row) => row.group_id === groupId && row.status !== "left" && row.status !== "completed",
  );
  groups[groupIndex] = {
    ...groups[groupIndex],
    students_count: members.length,
    updated_at: now,
  };

  if (!studentId) return;
  const studentIndex = students.findIndex((item) => item.id === studentId);
  if (studentIndex === -1) return;

  const active = enrollments.find(
    (row) => row.student_id === studentId && row.status !== "left" && row.status !== "completed",
  );
  const activeGroup = active ? groups.find((item) => item.id === active.group_id) : null;
  students[studentIndex] = {
    ...students[studentIndex],
    group_name: activeGroup ? activeGroup.name : null,
    updated_at: now,
  };
}

/** O'quvchi ismini yozuvlarga inline qo'shish uchun yagona yordamchi. */
function studentName(studentId: unknown) {
  const student = db["/students/"].items.find((item) => item.id === studentId);
  return student ? `${student.first_name} ${student.last_name}` : "O'quvchi";
}

/** A'zolikka ruxsat etilgan holatlar (guruh paneli faqat sinov/faol taklif qiladi). */
const ENROLLMENT_STATUSES = new Set(["trial", "active", "frozen", "left", "completed"]);

/**
 * A'zolik yaratish — `/groups/{id}/enroll/` va `/enrollments/` uchun yagona
 * qoida. Guruh mavjudligi, takror a'zolik, sig'im va o'quvchi mavjudligi shu
 * yerda tekshiriladi; so'ngra guruh soni sinxronlanadi.
 *
 * Ilgari umumiy `POST /enrollments/` bu tekshiruvlarni chetlab o'tardi —
 * sig'imdan oshib yozish va `students_count` eskirishi mumkin edi.
 */
function createEnrollment(
  config: InternalAxiosRequestConfig,
  groupId: string,
  studentId: string,
  status: string,
) {
  const groups = db["/groups/"].items;
  const enrollments = db["/enrollments/"].items;
  const students = db["/students/"].items;
  const now = new Date().toISOString();

  const group = groups.find((item) => item.id === groupId);
  if (!group) throw rejectWith(config, 404, { detail: "Guruh topilmadi" });

  const student = students.find((item) => item.id === studentId);
  if (!student) throw rejectWith(config, 404, { detail: "O'quvchi topilmadi" });

  if (enrollments.some((row) => row.group_id === groupId && row.student_id === studentId)) {
    throw rejectWith(config, 400, { student_id: ["O'quvchi allaqachon bu guruhda"] });
  }
  // O'quvchi bir vaqtda bir nechta guruhda bo'lishi mumkin (masalan ingliz
  // tili + matematika), shuning uchun boshqa guruhdagi a'zolik to'sqinlik
  // qilmaydi.

  const members = enrollments.filter(
    (row) => row.group_id === groupId && row.status !== "left" && row.status !== "completed",
  ).length;
  const capacity = Number(group.capacity ?? 0);
  if (capacity > 0 && members >= capacity) {
    throw rejectWith(config, 400, {
      detail: `Guruh to'lgan (${members}/${capacity}) — bo'sh joy yo'q`,
    });
  }

  const normalizedStatus = ENROLLMENT_STATUSES.has(status) ? status : "trial";

  const created = {
    id: nextId("enrollment"),
    tenant_id: TENANT_ID,
    group_id: groupId,
    student_id: studentId,
    status: normalizedStatus,
    joined_at: now,
    left_at: null,
    freeze_reason: null,
    left_reason: null,
    created_at: now,
    updated_at: now,
  };
  enrollments.unshift(created);
  syncGroupMembers(groupId, studentId);

  return created;
}

/**
 * `/enrollments/{id}/` — a'zolik holatini o'zgartirish yoki o'chirish.
 * Guruhdagi o'quvchilar soni va o'quvchining joriy guruhi sinxronlanadi.
 */
function handleEnrollmentMutations(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "enrollments" || segments.length !== 2) return null;
  if (method !== "patch" && method !== "put" && method !== "delete") return null;
  assertManager(config);

  const enrollments = db["/enrollments/"].items;
  const index = enrollments.findIndex((item) => item.id === segments[1]);
  if (index === -1) return null;

  const current = enrollments[index];
  const now = new Date().toISOString();

  if (method === "delete") {
    enrollments.splice(index, 1);
    syncGroupMembers(String(current.group_id), String(current.student_id));
    return respond(config, null, 204);
  }

  const body = parseBody(config);
  if (body.status !== undefined && !ENROLLMENT_STATUSES.has(String(body.status))) {
    throw rejectWith(config, 400, { status: ["Noto'g'ri a'zolik holati"] });
  }

  enrollments[index] = { ...current, ...body, updated_at: now };
  syncGroupMembers(String(current.group_id), String(current.student_id));
  return respond(config, enrollments[index]);
}

/**
 * `/enrollments/` — o'qishda guruh va o'qituvchi nomi inline qo'shiladi.
 *
 * O'quvchi kabineti a'zolikni guruh jadvali bilan birga ko'rsatadi, shu
 * sabab bilan nomlar backend serializatoridagidek shu yerda boyitiladi
 * (katalogdagi nom o'zgarsa ro'yxatda ham yangilanadi).
 */
function handleEnrollmentRelations(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "enrollments" || method !== "get") return null;

  const enrollments = db["/enrollments/"].items;
  const groups = db["/groups/"].items;
  const users = db["/users/"].items;

  const withRelations = (row: AnyRecord): AnyRecord => {
    const group = groups.find((item) => item.id === row.group_id);
    const teacher = group ? users.find((item) => item.id === group.teacher_id) : undefined;
    return {
      ...row,
      group_name: group ? String(group.name) : (row.group_name ?? null),
      teacher_name: teacher
        ? `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim()
        : null,
      schedule_label: group ? (group.schedule_label ?? null) : null,
    };
  };

  if (segments.length === 1) {
    return respond(
      config,
      paginate(enrollments.map(withRelations), config.params ?? {}),
    );
  }

  if (segments.length === 2) {
    const row = enrollments.find((item) => item.id === segments[1]);
    if (!row) return null;
    return respond(config, withRelations(row));
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Maktablar katalogi — lidlar bilan bog'lanish                               */
/* -------------------------------------------------------------------------- */

/** Maktab yozuviga lidlar bo'yicha yig'ma ko'rsatkichlarni qo'shadi. */
function withSchoolStats(school: AnyRecord): AnyRecord {
  const leads = db["/leads/"].items.filter((lead) => lead.school_id === school.id);
  const enrolled = leads.filter((lead) => lead.stage === "won").length;
  return {
    ...school,
    leads_count: leads.length,
    enrolled_count: enrolled,
    conversion_rate: leads.length > 0 ? Math.round((enrolled / leads.length) * 1000) / 10 : 0,
  };
}

/** Lid yozuviga maktab va manba nomini qo'shadi — backend serializatori ham shunday qiladi. */
function withLeadRelations(lead: AnyRecord): AnyRecord {
  const find = (collection: string, id: unknown) =>
    typeof id === "string" && id.length > 0
      ? db[collection].items.find((item) => item.id === id)
      : undefined;

  const school = find("/schools/", lead.school_id);
  const source = find("/lead-sources/", lead.source_id);
  const student = find("/students/", lead.converted_to_student_id);
  const group = find("/groups/", lead.converted_to_group_id);

  return {
    ...lead,
    school_name: school ? String(school.name) : null,
    // Manba nomi ham katalogdan olinadi: nom o'zgarsa lidlarda ham yangilanadi.
    source_name: source ? String(source.name) : (lead.source_name ?? null),
    converted_student_name: student
      ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
      : null,
    converted_group_name: group ? String(group.name) : null,
  };
}

/**
 * `/schools/` — maktablar katalogi. Lidlar bilan bog'langanligi sababli:
 * nom takrorlanmasligi tekshiriladi va lidlari bor maktab o'chirilmaydi.
 */
function handleSchools(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "schools") return null;

  const schools = db["/schools/"].items;
  const now = new Date().toISOString();

  /* --- /schools/ → ro'yxat | yaratish ----------------------------------- */
  if (segments.length === 1) {
    if (method === "get") {
      return respond(config, paginate(schools.map(withSchoolStats), config.params ?? {}));
    }

    if (method === "post") {
      const body = parseBody(config);
      const name = String(body.name ?? "").trim();
      if (!name) throw rejectWith(config, 400, { name: ["Nomi majburiy"] });
      if (schools.some((item) => String(item.name).toLowerCase() === name.toLowerCase())) {
        throw rejectWith(config, 400, { name: ["Bu nom bilan maktab allaqachon mavjud"] });
      }

      const created = {
        id: nextId("school"),
        tenant_id: TENANT_ID,
        type: "public",
        district: null,
        address: null,
        contact_person: null,
        phone: null,
        student_capacity: 0,
        is_active: true,
        partner_since: null,
        notes: null,
        ...body,
        name,
        created_at: now,
        updated_at: now,
      };
      schools.unshift(created);
      return respond(config, withSchoolStats(created), 201);
    }

    return null;
  }

  /* --- /schools/:id/ → bitta yozuv -------------------------------------- */
  if (segments.length === 2) {
    const index = schools.findIndex((item) => item.id === segments[1]);
    if (index === -1) throw rejectWith(config, 404, { detail: "Maktab topilmadi" });
    const current = schools[index];

    if (method === "get") return respond(config, withSchoolStats(current));

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const name = body.name === undefined ? String(current.name) : String(body.name).trim();
      if (!name) throw rejectWith(config, 400, { name: ["Nomi majburiy"] });
      if (
        schools.some(
          (item) =>
            item.id !== current.id && String(item.name).toLowerCase() === name.toLowerCase(),
        )
      ) {
        throw rejectWith(config, 400, { name: ["Bu nom bilan maktab allaqachon mavjud"] });
      }

      const updated = { ...current, ...body, name, updated_at: now };
      schools[index] = updated;
      return respond(config, withSchoolStats(updated));
    }

    if (method === "delete") {
      const linked = db["/leads/"].items.filter((lead) => lead.school_id === current.id).length;
      if (linked > 0) {
        throw rejectWith(config, 400, {
          detail: `Bu maktabga ${linked} ta lid bog'langan — avval ularni boshqa maktabga o'tkazing`,
        });
      }
      schools.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/** `/leads/` — o'qishda maktab nomi inline qo'shiladi. */
function handleLeadRelations(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "leads" || method !== "get") return null;

  const leads = db["/leads/"].items;

  if (segments.length === 1) {
    // Inlay qidiruvdan oldin — maktab nomi bo'yicha ham qidirish ishlaydi.
    return respond(config, paginate(leads.map(withLeadRelations), config.params ?? {}));
  }

  if (segments.length === 2) {
    const lead = leads.find((item) => item.id === segments[1]);
    if (!lead) return null;
    return respond(config, withLeadRelations(lead));
  }

  return null;
}

/**
 * `/leads/{id}/convert/` — lidni haqiqiy o'quvchiga aylantirish.
 *
 * Ilgari bu amal faqat lidning `stage`/`status` maydonlarini o'zgartirardi:
 * o'quvchi yaratilmasdi, guruhga a'zo qilinmasdi va lid "aylantirilgan"
 * deb hisoblanardi. Endi:
 *
 *   1. lid holati yopiladi (`stage: won`, `status: enrolled`);
 *   2. lid ma'lumotlaridan **yangi o'quvchi** yaratiladi;
 *   3. `group_id` berilgan bo'lsa — guruhga a'zolik ham yaratiladi
 *      (guruh to'lganligi va takrorlanish tekshiriladi);
 *   4. lidga yaratilgan o'quvchi/guruh ID'lari yoziladi.
 *
 * Qaytaradi: yangilangan lid (+ `converted_student_name`).
 */
function handleLeadConvert(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "leads" || segments.length !== 3 || segments[2] !== "convert") {
    return null;
  }
  if (method !== "post") return null;

  const leads = db["/leads/"].items;
  const index = leads.findIndex((item) => item.id === segments[1]);
  if (index === -1) throw rejectWith(config, 404, { detail: "Lid topilmadi" });

  const lead = leads[index];
  if (lead.converted_to_student_id) {
    throw rejectWith(config, 400, {
      detail: "Bu lid allaqachon o'quvchiga aylantirilgan",
    });
  }

  const body = parseBody(config);
  const now = new Date().toISOString();

  const firstName = String(body.first_name ?? lead.first_name ?? "").trim();
  const lastName = String(body.last_name ?? lead.last_name ?? "").trim();
  if (!firstName) {
    throw rejectWith(config, 400, { first_name: ["Ism majburiy"] });
  }

  /* 1. O'quvchi yaratiladi (lid ma'lumotlari asosida). */
  const students = db["/students/"].items;
  const student = {
    id: nextId("student"),
    ...defaultsFor("students"),
    first_name: firstName,
    last_name: lastName,
    phone: String(body.phone ?? lead.phone ?? ""),
    birth_date: body.birth_date ?? lead.birth_date ?? null,
    branch_id: lead.branch_id ?? BRANCH_ID,
    status: "trial",
    source_id: lead.source_id ?? null,
    created_at: now,
    updated_at: now,
  };
  students.unshift(student);

  /* 2. Guruh berilgan bo'lsa — a'zolik (xuddi `/groups/{id}/enroll/` kabi). */
  const groupId = String(body.group_id ?? "").length > 0 ? String(body.group_id) : null;
  if (groupId) {
    const groups = db["/groups/"].items;
    const group = groups.find((item) => item.id === groupId);
    if (!group) throw rejectWith(config, 404, { detail: "Guruh topilmadi" });

    const enrollments = db["/enrollments/"].items;
    const members = enrollments.filter(
      (row) =>
        row.group_id === groupId && row.status !== "left" && row.status !== "completed",
    ).length;
    const capacity = Number(group.capacity ?? 0);
    if (capacity > 0 && members >= capacity) {
      throw rejectWith(config, 400, {
        detail: `Guruh to'lgan (${members}/${capacity}) — bo'sh joy yo'q`,
      });
    }

    enrollments.unshift({
      id: nextId("enrollment"),
      tenant_id: TENANT_ID,
      group_id: groupId,
      student_id: student.id,
      status: "trial",
      joined_at: now,
      left_at: null,
      freeze_reason: null,
      left_reason: null,
      created_at: now,
      updated_at: now,
    });
    syncGroupMembers(groupId, String(student.id));
  }

  /* 3. Lid yopiladi va konvertatsiya bog'lanishi yoziladi. */
  leads[index] = {
    ...lead,
    status: "enrolled",
    stage: "won",
    converted_to_student_id: student.id,
    converted_to_group_id: groupId,
    converted_at: now,
    updated_at: now,
  };

  return respond(config, {
    ...withLeadRelations(leads[index]),
    student: { ...student, group_name: null },
  });
}

/* -------------------------------------------------------------------------- */
/*  Sozlamalar — markaz profili, lid sozlamalari, xodimlar                      */
/* -------------------------------------------------------------------------- */

/** Nomi bo'sh bo'lmasligi va takrorlanmasligini tekshiradi. */
function assertUniqueName(
  config: InternalAxiosRequestConfig,
  collection: AnyRecord[],
  body: AnyRecord,
  currentId?: string,
): string {
  const name = String(body.name ?? "").trim();
  if (!name) throw rejectWith(config, 400, { name: ["Nomi majburiy"] });

  const taken = collection.some(
    (item) =>
      item.id !== currentId &&
      String(item.name ?? "")
        .trim()
        .toLowerCase() === name.toLowerCase(),
  );
  if (taken) throw rejectWith(config, 400, { name: ["Bu nom allaqachon mavjud"] });
  return name;
}

/** `GET/PATCH /settings/center/` — markaz (tenant) o'z profili. */
function handleSettingsCenter(
  config: InternalAxiosRequestConfig,
  path: string,
  method: string,
): AxiosResponse | null {
  if (path !== "/settings/center/") return null;

  const store = db["/settings/center/"].items;
  const current = store[0];

  if (method === "get") return respond(config, current);

  if (method === "patch" || method === "put") {
    const body = parseBody(config);
    const name = body.name === undefined ? String(current.name) : String(body.name).trim();
    if (!name) throw rejectWith(config, 400, { name: ["Markaz nomi majburiy"] });

    const updated = { ...current, ...body, name, updated_at: new Date().toISOString() };
    store[0] = updated;
    return respond(config, updated);
  }

  return null;
}

type LeadConfigKind = "lead-sources" | "lead-loss-reasons" | "lead-stages";

/**
 * Lid sozlamalarini o'chirishdan oldin tekshiriladigan bog'lanishlar —
 * ishlatilib turgan yozuvni o'chirish lidlarni "manbasiz" qoldiradi.
 */
const LEAD_CONFIG_GUARDS: Record<
  LeadConfigKind,
  { count: (id: string) => number; message: (count: number) => string }
> = {
  "lead-sources": {
    count: (id) => db["/leads/"].items.filter((lead) => lead.source_id === id).length,
    message: (count) =>
      `Bu manbadan ${count} ta lid kelgan — avval ularni boshqa manbaga o'tkazing`,
  },
  "lead-loss-reasons": {
    count: (id) => db["/leads/"].items.filter((lead) => lead.loss_reason_id === id).length,
    message: (count) => `Bu sabab ${count} ta lidga qo'yilgan — avval ularni yangilang`,
  },
  "lead-stages": {
    count: (id) => db["/leads/"].items.filter((lead) => lead.stage === id).length,
    message: (count) =>
      `Bu ustunda ${count} ta lid bor — avval ularni boshqa ustunga ko'chiring`,
  },
};

/**
 * `/lead-sources/`, `/lead-loss-reasons/`, `/lead-stages/` — kanban va lid
 * formasini sozlaydigan ro'yxatlar: nom takrorlanmasligi va o'chirish
 * himoyasi shu yerda (umumiy CRUD'dan oldin ishlaydi).
 */
function handleLeadConfig(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  const kind = segments[0] as LeadConfigKind;
  if (!(kind in LEAD_CONFIG_GUARDS)) return null;

  const collection = db[`/${kind}/`].items;
  const now = new Date().toISOString();

  /* --- /{kind}/ → ro'yxat | yaratish ------------------------------------ */
  if (segments.length === 1) {
    if (method === "get") {
      return respond(config, paginate(collection, config.params ?? {}));
    }

    if (method === "post") {
      const body = parseBody(config);
      const name = assertUniqueName(config, collection, body);
      const order =
        kind === "lead-stages"
          ? collection.reduce((max, item) => Math.max(max, Number(item.order ?? 0)), 0) + 1
          : null;

      const created = {
        id: nextId(kind.slice(0, -1)),
        ...defaultsFor(kind),
        ...body,
        name,
        ...(order === null ? {} : { order }),
        created_at: now,
        updated_at: now,
      };
      collection.push(created);
      return respond(config, created, 201);
    }

    return null;
  }

  /* --- /{kind}/:id/ → tahrirlash | o'chirish ---------------------------- */
  if (segments.length === 2) {
    const index = collection.findIndex((item) => item.id === segments[1]);
    if (index === -1) throw rejectWith(config, 404, { detail: "Topilmadi" });
    const current = collection[index];

    if (method === "get") return respond(config, current);

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const name =
        body.name === undefined
          ? String(current.name)
          : assertUniqueName(config, collection, { name: body.name }, String(current.id));

      collection[index] = { ...current, ...body, name, updated_at: now };
      return respond(config, collection[index]);
    }

    if (method === "delete") {
      const guard = LEAD_CONFIG_GUARDS[kind];
      const linked = guard.count(String(current.id));
      if (linked > 0) throw rejectWith(config, 400, { detail: guard.message(linked) });

      collection.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/**
 * `/users/` — xodimlar. Telefon raqami takrorlanmasligi va o'z hisobini
 * o'chirishga yo'l qo'yilmasligi tekshiriladi.
 */
function handleUsers(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "users") return null;

  const users = db["/users/"].items;
  const now = new Date().toISOString();

  const phoneTaken = (phone: string, currentId?: string) =>
    users.some(
      (item) => item.id !== currentId && String(item.phone ?? "").trim() === phone.trim(),
    );

  /* --- /users/ → ro'yxat | qo'shish -------------------------------------- */
  if (segments.length === 1) {
    if (method === "get") return respond(config, paginate(users, config.params ?? {}));

    if (method === "post") {
      const body = parseBody(config);
      const phone = String(body.phone ?? "").trim();
      if (!phone) throw rejectWith(config, 400, { phone: ["Telefon majburiy"] });
      if (phoneTaken(phone)) {
        throw rejectWith(config, 400, { phone: ["Bu telefon raqam allaqachon band"] });
      }

      const created = {
        id: nextId("user"),
        ...defaultsFor("users"),
        ...body,
        phone,
        email: body.email ? String(body.email) : null,
        is_email_verified: false,
        is_phone_verified: false,
        last_login_at: null,
        permissions: [],
        created_at: now,
        updated_at: now,
      };
      users.unshift(created);
      return respond(config, created, 201);
    }

    return null;
  }

  /* --- /users/:id/ → tahrirlash | o'chirish ----------------------------- */
  if (segments.length === 2) {
    const index = users.findIndex((item) => item.id === segments[1]);
    if (index === -1) throw rejectWith(config, 404, { detail: "Xodim topilmadi" });
    const current = users[index];

    if (method === "get") return respond(config, current);

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const phone = body.phone === undefined ? String(current.phone) : String(body.phone).trim();
      if (!phone) throw rejectWith(config, 400, { phone: ["Telefon majburiy"] });
      if (phoneTaken(phone, String(current.id))) {
        throw rejectWith(config, 400, { phone: ["Bu telefon raqam allaqachon band"] });
      }

      // Bo'sh parol o'zgarishsiz qoldiriladi (forma ham shunday yuboradi).
      const patch = { ...body };
      delete patch.password;

      users[index] = { ...current, ...patch, phone, updated_at: now };
      return respond(config, users[index]);
    }

    if (method === "delete") {
      if (current.id === demoUser.id) {
        throw rejectWith(config, 400, { detail: "O'z hisobingizni o'chira olmaysiz" });
      }
      users.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Moliya — to'lov turlari, hisob-fakturalar, qarzlar                         */
/* -------------------------------------------------------------------------- */

const PAYMENT_METHOD_KINDS = ["cash", "card", "online", "transfer"];

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Hisob-fakturani UI uchun "ko'rinish"ga aylantiradi: o'quvchi/guruh nomlari,
 * qarz summasi, holati va kechikkanligi shu yerda hisoblanadi.
 */
function withChargeView(charge: AnyRecord): AnyRecord {
  const student = db["/students/"].items.find((item) => item.id === charge.student_id);
  const group = db["/groups/"].items.find((item) => item.id === charge.group_id);

  const total = Number(charge.amount_tiyin ?? 0) - Number(charge.discount_tiyin ?? 0);
  const paid = Number(charge.paid_tiyin ?? 0);
  const dueDate = String(charge.due_date ?? "");

  return {
    ...charge,
    student_name: student
      ? `${String(student.first_name)} ${String(student.last_name)}`
      : null,
    group_name: group ? String(group.name) : null,
    total_tiyin: total,
    debt_tiyin: Math.max(0, total - paid),
    status: paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid",
    is_overdue: dueDate.length > 0 && dueDate < todayIso() && paid < total,
  };
}

/**
 * Qarzdorlar ro'yxati — hisob-fakturalardan hosil qilinadi (o'quvchi kesimida).
 * `debt_tiyin` musbat bo'lsa qarz, `advance_tiyin` musbat bo'lsa avans.
 */
function debtRows(): AnyRecord[] {
  const charges = db["/finance/charges/"].items.map(withChargeView);
  const payments = db["/finance/payments/"].items;

  return db["/students/"].items
    .map((student): AnyRecord | null => {
      const own = charges.filter((charge) => charge.student_id === student.id);
      if (own.length === 0) return null;

      const charged = own.reduce((sum, charge) => sum + Number(charge.total_tiyin ?? 0), 0);
      const paid = own.reduce((sum, charge) => sum + Number(charge.paid_tiyin ?? 0), 0);
      const overdue = own
        .filter((charge) => Boolean(charge.is_overdue))
        .reduce((sum, charge) => sum + Number(charge.debt_tiyin ?? 0), 0);

      const branch = db["/branches/"].items.find((item) => item.id === student.branch_id);
      const lastPayment = payments
        .filter((payment) => payment.student_id === student.id)
        .sort((a, b) => String(b.paid_at).localeCompare(String(a.paid_at)))[0];

      const dueDates = own
        .map((charge) => String(charge.due_date ?? ""))
        .filter((value) => value.length > 0)
        .sort();

      const groupNames = [
        ...new Set(own.map((charge) => String(charge.group_name ?? ""))),
      ].filter((value) => value.length > 0);

      return {
        student_id: student.id,
        student_name: `${String(student.first_name)} ${String(student.last_name)}`,
        phone: student.phone ?? null,
        student_status: student.status,
        branch_id: student.branch_id,
        branch_name: branch ? String(branch.name) : null,
        group_names: groupNames.length > 0 ? groupNames.join(", ") : null,
        charged_tiyin: charged,
        paid_tiyin: paid,
        debt_tiyin: Math.max(0, charged - paid),
        advance_tiyin: Math.max(0, paid - charged),
        overdue_tiyin: overdue,
        last_payment_at: lastPayment ? lastPayment.paid_at : null,
        oldest_due_date: dueDates[0] ?? null,
      };
    })
    .filter((row): row is AnyRecord => row !== null);
}

/**
 * `/finance/charges/` — hisob-fakturalar (billing) va `/finance/debts/` — qarzlar.
 *
 * Hisob-faktura o'quvchining guruhi narxidan oylik hosil qilinadi; to'langan
 * summa real to'lovlardan yig'iladi. To'lov qilingan hisob-faktura
 * o'chirilmaydi va tahrirlanmaydi (avval to'lovni qaytarish kerak).
 */
function handleBilling(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "finance") return null;

  /* --- /finance/debts/ → qarzdorlar ro'yxati ----------------------------- */
  if (segments[1] === "debts") {
    if (method !== "get") return null;

    const params: AnyRecord = { ...(config.params ?? {}) };
    const onlyDebt = String(params.only_debt ?? "true") !== "false";
    const overdueOnly = String(params.overdue ?? "false") === "true";
    delete params.only_debt;
    delete params.overdue;

    let rows = debtRows();
    if (onlyDebt) rows = rows.filter((row) => Number(row.debt_tiyin) > 0);
    if (overdueOnly) rows = rows.filter((row) => Number(row.overdue_tiyin) > 0);

    return respond(config, paginate(rows, params));
  }

  if (segments[1] !== "charges") return null;

  const charges = db["/finance/charges/"].items;
  const now = new Date().toISOString();

  /* --- /finance/charges/ → ro'yxat | davr uchun hisoblash ---------------- */
  if (segments.length === 2) {
    if (method === "get") {
      return respond(config, paginate(charges.map(withChargeView), config.params ?? {}));
    }

    if (method === "post") {
      const body = parseBody(config);
      const groupId = String(body.group_id ?? "");
      const period = String(body.period ?? "");

      const group = db["/groups/"].items.find((item) => item.id === groupId);
      if (!group) throw rejectWith(config, 400, { group_id: ["Guruh tanlanishi majburiy"] });
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
        throw rejectWith(config, 400, { period: ["Davr YYYY-MM ko'rinishida bo'lishi kerak"] });
      }
      if (charges.some((charge) => charge.group_id === groupId && charge.period === period)) {
        throw rejectWith(config, 400, {
          detail: `"${String(group.name)}" guruhi uchun ${period} davri allaqachon hisoblangan`,
        });
      }

      const members = db["/students/"].items.filter(
        (student) =>
          student.group_name === group.name &&
          student.status !== "left" &&
          student.status !== "graduated",
      );
      if (members.length === 0) {
        throw rejectWith(config, 400, { detail: "Bu guruhda hisoblash uchun o'quvchi yo'q" });
      }

      const price = Number(group.price_tiyin ?? 0);
      const created = members.map((student, index) => ({
        id: `charge-new-${Date.now()}-${index}`,
        tenant_id: TENANT_ID,
        branch_id: group.branch_id ?? student.branch_id ?? BRANCH_ID,
        student_id: student.id,
        group_id: groupId,
        period,
        amount_tiyin: price,
        discount_tiyin: 0,
        paid_tiyin: 0,
        due_date: `${period}-${String(body.due_day ?? 5).padStart(2, "0")}`,
        created_by: demoUser.id,
        created_at: now,
        updated_at: now,
      }));

      charges.push(...created);
      return respond(
        config,
        {
          created: created.length,
          skipped: 0,
          period,
          group_id: groupId,
          results: created.map(withChargeView),
        },
        201,
      );
    }

    return null;
  }

  /* --- /finance/charges/:id/ → tahrirlash | o'chirish -------------------- */
  if (segments.length === 3) {
    const index = charges.findIndex((item) => item.id === segments[2]);
    if (index === -1) throw rejectWith(config, 404, { detail: "Hisob-faktura topilmadi" });
    const current = charges[index];

    if (method === "get") return respond(config, withChargeView(current));

    if (Number(current.paid_tiyin ?? 0) > 0) {
      throw rejectWith(config, 400, {
        detail: "Bu hisob-fakturaga to'lov qilingan — avval to'lovni qaytaring",
      });
    }

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const patch: AnyRecord = {};
      if (body.amount_tiyin !== undefined) patch.amount_tiyin = Number(body.amount_tiyin);
      if (body.discount_tiyin !== undefined) patch.discount_tiyin = Number(body.discount_tiyin);
      if (body.due_date !== undefined) patch.due_date = String(body.due_date);

      charges[index] = { ...current, ...patch, updated_at: now };
      return respond(config, withChargeView(charges[index]));
    }

    if (method === "delete") {
      charges.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/**
 * `/finance/payment-methods/` — to'lov turlari katalogi.
 *
 * `name` va `code` takrorlanmasligi tekshiriladi. Ishlatilib turgan turni
 * o'chirish mumkin emas — to'lovlar "tursiz" qolib ketmasligi kerak.
 */
function handlePaymentMethods(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "finance" || segments[1] !== "payment-methods") return null;

  const methods = db["/finance/payment-methods/"].items;
  const now = new Date().toISOString();

  const assertUnique = (body: AnyRecord, currentId?: string) => {
    const name = String(body.name ?? "").trim();
    if (!name) throw rejectWith(config, 400, { name: ["Nomi majburiy"] });

    const code = String(body.code ?? "").trim().toLowerCase();
    if (!/^[a-z][a-z0-9_]*$/.test(code)) {
      throw rejectWith(config, 400, {
        code: ["Kod faqat lotin harflari, raqam va pastki chiziqdan iborat bo'lsin"],
      });
    }

    const nameTaken = methods.some(
      (item) =>
        item.id !== currentId &&
        String(item.name ?? "").trim().toLowerCase() === name.toLowerCase(),
    );
    if (nameTaken) throw rejectWith(config, 400, { name: ["Bu nom allaqachon mavjud"] });

    const codeTaken = methods.some(
      (item) => item.id !== currentId && String(item.code ?? "") === code,
    );
    if (codeTaken) throw rejectWith(config, 400, { code: ["Bu kod allaqachon ishlatilgan"] });

    return { name, code };
  };

  /* --- /finance/payment-methods/ → ro'yxat | yaratish -------------------- */
  if (segments.length === 2) {
    if (method === "get") return respond(config, paginate(methods, config.params ?? {}));

    if (method === "post") {
      const body = parseBody(config);
      const identity = assertUnique(body);

      const kind = String(body.kind ?? "cash");
      if (!PAYMENT_METHOD_KINDS.includes(kind)) {
        throw rejectWith(config, 400, { kind: ["To'lov turi guruhi noto'g'ri"] });
      }

      const created = {
        id: nextId("payment-method"),
        ...defaultsFor("finance/payment-methods"),
        ...body,
        ...identity,
        kind,
        sort_order: Number(body.sort_order ?? methods.length + 1),
        created_at: now,
        updated_at: now,
      };
      methods.push(created);
      return respond(config, created, 201);
    }

    return null;
  }

  /* --- /finance/payment-methods/:id/ → tahrirlash | o'chirish ------------ */
  if (segments.length === 3) {
    const index = methods.findIndex((item) => item.id === segments[2]);
    if (index === -1) throw rejectWith(config, 404, { detail: "To'lov turi topilmadi" });
    const current = methods[index];

    if (method === "get") return respond(config, current);

    if (method === "patch" || method === "put") {
      const body = parseBody(config);
      const identity = assertUnique(
        { name: body.name ?? current.name, code: body.code ?? current.code },
        String(current.id),
      );

      const kind = body.kind === undefined ? String(current.kind) : String(body.kind);
      if (!PAYMENT_METHOD_KINDS.includes(kind)) {
        throw rejectWith(config, 400, { kind: ["To'lov turi guruhi noto'g'ri"] });
      }

      methods[index] = { ...current, ...body, ...identity, kind, updated_at: now };
      return respond(config, methods[index]);
    }

    if (method === "delete") {
      const linked = db["/finance/payments/"].items.filter(
        (payment) => payment.method === current.code,
      ).length;
      if (linked > 0) {
        throw rejectWith(config, 400, {
          detail: `Bu to'lov turi ${linked} ta to'lovda ishlatilgan — avval ularni boshqa turga o'tkazing`,
        });
      }

      methods.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Darslar (lessons) va davomat                                               */
/* -------------------------------------------------------------------------- */

/** Guruhning joriy a'zolari — davomat ro'yxati uchun. */
function lessonRoster(groupId: string) {
  const enrollments = db["/enrollments/"].items;
  const students = db["/students/"].items;

  return enrollments
    .filter(
      (row) =>
        row.group_id === groupId && row.status !== "left" && row.status !== "completed",
    )
    .map((row) => {
      const student = students.find((item) => item.id === row.student_id);
      return {
        enrollment_id: String(row.id),
        student_id: String(row.student_id ?? ""),
        student_name: student ? `${student.first_name} ${student.last_name}` : "O'quvchi",
      };
    });
}

/** Dars yozuviga ro'yxat uchun hisoblangan maydonlarni qo'shadi. */
function withLessonView(row: AnyRecord) {
  const attendance = db["/attendance/"].items.filter(
    (item) => item.lesson_id === row.id,
  );
  const present = attendance.filter(
    (item) => item.status === "PRESENT" || item.status === "LATE",
  ).length;
  const group = db["/groups/"].items.find((item) => item.id === row.group_id);

  return {
    ...row,
    /* Nomlar va a'zolar soni katalogdan — guruh tahrirlanganda darhol yangilanadi. */
    group_name: group?.name ?? row.group_name ?? null,
    teacher_name: group?.teacher_name ?? row.teacher_name ?? null,
    room_name: group?.room_name ?? row.room_name ?? null,
    room_id: group?.room_id ?? row.room_id ?? null,
    students_count: lessonRoster(String(row.group_id)).length,
    lesson_date: String(row.starts_at ?? "").slice(0, 10),
    marked_count: attendance.length,
    present_count: present,
    is_marked: attendance.length > 0,
    attendance_rate:
      attendance.length > 0 ? Math.round((present / attendance.length) * 1000) / 10 : 0,
  };
}

/**
 * `GET /lessons/`, `GET /lessons/{id}/`, `GET /lessons/{id}/attendance/`.
 *
 * Davomat **dars bo'yicha** yuritiladi. Ro'yxatda guruhning o'sha darsdagi
 * barcha a'zolari qaytadi, hali belgilanmaganlar `status: null` bilan.
 */
function handleLessons(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments[0] !== "lessons") return null;

  const lessons = db["/lessons/"].items;

  /* --- /lessons/:id/attendance/ ----------------------------------------- */
  if (segments.length === 3 && segments[2] === "attendance" && method === "get") {
    const lesson = lessons.find((item) => item.id === segments[1]);
    if (!lesson) throw rejectWith(config, 404, { detail: "Dars topilmadi" });

    const attendance = db["/attendance/"].items;
    return respond(
      config,
      lessonRoster(String(lesson.group_id)).map((member) => {
        const record = attendance.find(
          (item) =>
            item.lesson_id === lesson.id && item.enrollment_id === member.enrollment_id,
        );
        return {
          ...member,
          status: record ? record.status : null,
          note: record ? record.note : null,
        };
      }),
    );
  }

  /* --- /lessons/:id/ ---------------------------------------------------- */
  if (segments.length === 2) {
    const lesson = lessons.find((item) => item.id === segments[1]);
    if (!lesson) throw rejectWith(config, 404, { detail: "Dars topilmadi" });
    if (method === "get") return respond(config, withLessonView(lesson));
    return null;
  }

  /* --- /lessons/ -------------------------------------------------------- */
  if (segments.length === 1 && method === "get") {
    const params: AnyRecord = { ...(config.params ?? {}) };
    const groupId = params.group_id;
    const status = params.status;
    /* Sana oralig'i aniq mos kelish emas, taqqoslash bilan filtrlanadi. */
    const from = params.date_from ? String(params.date_from).slice(0, 10) : null;
    const to = params.date_to ? String(params.date_to).slice(0, 10) : null;

    /*
     * Yangi yaratilgan yoki jadvali o'zgargan guruhlar uchun darslarni
     * to'ldiramiz. Funksiya idempotent — mavjud darslar takrorlanmaydi.
     */
    for (const group of db["/groups/"].items) {
      if (group.status === "completed") continue;
      generateLessonsForGroup(group);
    }

    let rows = lessons.slice();
    /* O'qituvchi faqat o'z guruhlarining darslarini ko'radi. */
    rows = scopedForRole(rows, "lessons", config);
    if (groupId) {
      rows = rows.filter((item) => String(item.group_id) === String(groupId));
    }
    if (status) rows = rows.filter((item) => String(item.status) === String(status));
    if (from) rows = rows.filter((item) => String(item.starts_at).slice(0, 10) >= from);
    if (to) rows = rows.filter((item) => String(item.starts_at).slice(0, 10) <= to);

    return respond(
      config,
      paginate(rows.map((item) => withLessonView(item)), {
        search: params.search,
        ordering: params.ordering ?? "-starts_at",
        page: params.page,
        page_size: params.page_size,
      }),
    );
  }

  return null;
}

/**
 * `POST /attendance/bulk/` — bir darsdagi davomatni to'plam saqlash.
 *
 * Mavjud yozuv yangilanadi, yo'g'i yaratiladi (upsert); saqlangach dars
 * "o'tilgan" holatiga o'tadi. `handleCollection` dan **oldin** chaqiriladi,
 * aks holda `/attendance/bulk/` id sifatida qaralib 404 qaytarardi.
 */
function handleAttendanceBulk(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  if (segments.length !== 2 || segments[0] !== "attendance" || segments[1] !== "bulk") {
    return null;
  }
  if (method !== "post" && method !== "put") return null;

  const body = parseBody(config);
  const lessonId = String(body.lesson_id ?? "");
  const items: AnyRecord[] = Array.isArray(body.items) ? body.items : [];

  const lessons = db["/lessons/"].items;
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) throw rejectWith(config, 404, { detail: "Dars topilmadi" });

  const attendance = db["/attendance/"].items;
  const students = db["/students/"].items;
  const now = new Date().toISOString();
  let saved = 0;

  for (const item of items) {
    const enrollmentId = String(item.enrollment_id ?? "");
    const status = String(item.status ?? "");
    if (!enrollmentId) continue;
    if (!["PRESENT", "LATE", "ABSENT", "EXCUSED"].includes(status)) {
      throw rejectWith(config, 400, {
        items: [`Noto'g'ri davomat holati: ${status || "(bo'sh)"}`],
      });
    }

    const enrollment = db["/enrollments/"].items.find((row) => row.id === enrollmentId);
    if (!enrollment || String(enrollment.group_id) !== String(lesson.group_id)) {
      throw rejectWith(config, 400, {
        enrollment_id: ["O'quvchi bu guruhga tegishli emas"],
      });
    }

    const student = students.find((row) => row.id === enrollment.student_id);
    const studentName = student
      ? `${student.first_name} ${student.last_name}`
      : String(enrollment.student_name ?? "O'quvchi");

    const existing = attendance.find(
      (row) => row.lesson_id === lessonId && row.enrollment_id === enrollmentId,
    );

    if (existing) {
      Object.assign(existing, {
        status,
        note: item.note ?? null,
        marked_by: demoUser.id,
        updated_at: now,
      });
    } else {
      attendance.push({
        id: `attendance-${String(attendance.length + 1).padStart(5, "0")}`,
        tenant_id: TENANT_ID,
        lesson_id: lessonId,
        enrollment_id: enrollmentId,
        student_id: enrollment.student_id,
        status,
        marked_by: demoUser.id,
        note: item.note ?? null,
        student_name: studentName,
        group_name: lesson.group_name,
        lesson_date: lesson.starts_at,
        created_at: now,
        updated_at: now,
      });
    }
    saved += 1;
  }

  lesson.status = "held";
  lesson.updated_at = now;

  return respond(config, { lesson_id: lessonId, saved }, 200);
}

/**
 * Rol bo'yicha ko'rish doirasi.
 *
 * O'qituvchi faqat **o'z** guruhlarini va ularning darslarini ko'radi —
 * aks holda guruhlar ro'yxati, davomat sahifasidagi tanlov va jadval butun
 * markazni ko'rsatib qo'yardi. Rahbariyat (ceo/admin) hammasini ko'radi.
 *
 * Backend ham shunday qiladi (queryset filtri), shuning uchun bu mock
 * adapteridagi xatti-harakat hujjat bilan mos.
 */
function scopedForRole(
  items: AnyRecord[],
  resource: string,
  config: InternalAxiosRequestConfig,
): AnyRecord[] {
  const actor = resolveDemoUserById(tokenUserId(config));
  if (String(actor.role) !== "teacher") return items;

  if (resource === "groups") {
    return items.filter((item) => item.teacher_id === actor.id);
  }

  if (resource === "lessons") {
    const own = new Set(
      db["/groups/"].items
        .filter((group) => group.teacher_id === actor.id)
        .map((group) => group.id),
    );
    return items.filter((item) => own.has(item.group_id));
  }

  /* O'qituvchi faqat o'z guruhlaridagi o'quvchilarni ko'radi. */
  if (resource === "students") {
    const own = new Set(
      db["/groups/"].items
        .filter((group) => group.teacher_id === actor.id)
        .map((group) => group.id),
    );
    const studentIds = new Set(
      db["/enrollments/"].items
        .filter((row) => own.has(String(row.group_id)))
        .map((row) => String(row.student_id)),
    );
    return items.filter((item) => studentIds.has(String(item.id)));
  }

  return items;
}

function handleCollection(
  config: InternalAxiosRequestConfig,
  segments: string[],
  method: string,
): AxiosResponse | null {
  /*
   * Resurs manzili bir yoki ikki segmentdan iborat bo'lishi mumkin
   * (`/students/` va `/finance/payments/`), shuning uchun db'dagi eng uzun
   * mos keluvchi prefiks izlanadi. Qolgan segmentlar — id va action.
   */
  let prefixLength = 0;
  let collection: { items: AnyRecord[] } | undefined;
  for (let length = Math.min(segments.length, 2); length >= 1; length -= 1) {
    const candidate = `/${segments.slice(0, length).join("/")}/`;
    if (db[candidate]) {
      collection = db[candidate];
      prefixLength = length;
      break;
    }
  }
  if (!collection) return null;

  const resource = segments.slice(0, prefixLength).join("/");
  const rest = segments.slice(prefixLength);

  /* O'quvchi yozuvlarini faqat rahbariyat o'zgartiradi (o'qituvchi — ko'rish). */
  if (resource === "students" && method !== "get") assertManager(config);

  // /resource/  → list | create
  if (rest.length === 0) {
    if (method === "get") {
      const visible = scopedForRole(collection.items, resource, config);
      return respond(config, paginate(visible, config.params ?? {}));
    }
    if (method === "post") {
      const body = parseBody(config);

      /* A'zolik faqat tekshiruvlar bilan yaratiladi (sig'im, takrorlanish). */
      if (resource === "enrollments") {
        assertManager(config);
        const groupId = String(body.group_id ?? "");
        const studentId = String(body.student_id ?? "");
        if (!groupId) {
          throw rejectWith(config, 400, { group_id: ["Guruh tanlanishi shart"] });
        }
        if (!studentId) {
          throw rejectWith(config, 400, { student_id: ["O'quvchi tanlanishi shart"] });
        }
        const created = createEnrollment(
          config,
          groupId,
          studentId,
          String(body.status ?? "trial"),
        );
        return respond(config, { ...created, student_name: studentName(studentId) }, 201);
      }

      const created = {
        id: nextId(segments[prefixLength - 1]),
        ...defaultsFor(resource),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      collection.items.unshift(created);
      return respond(config, created, 201);
    }
  }

  // /resource/:id/  → detail
  if (rest.length === 1) {
    const id = rest[0];

    if (method === "get") {
      const visible = scopedForRole(collection.items, resource, config);
      const item = visible.find((row) => row.id === id);
      if (!item) throw rejectWith(config, 404, { detail: "Topilmadi" });
      return respond(config, item);
    }

    const index = collection.items.findIndex((item) => item.id === id);
    if (index === -1) throw rejectWith(config, 404, { detail: "Topilmadi" });

    if (method === "patch" || method === "put") {
      const updated = {
        ...collection.items[index],
        ...parseBody(config),
        updated_at: new Date().toISOString(),
      };
      collection.items[index] = updated;
      return respond(config, updated);
    }

    if (method === "delete") {
      collection.items.splice(index, 1);
      return respond(config, null, 204);
    }
  }

  // /resource/:id/:action/  → action (block, unblock, enroll, ...)
  if (rest.length === 2) {
    const id = rest[0];
    const action = rest[1];
    const index = collection.items.findIndex((item) => item.id === id);
    if (index === -1) throw rejectWith(config, 404, { detail: "Topilmadi" });

    const item = collection.items[index];
    if (action === "block") {
      collection.items[index] = { ...item, is_blocked: true };
    }
    if (action === "unblock") {
      collection.items[index] = { ...item, is_blocked: false };
    }
    if (action === "subscription") {
      collection.items[index] = {
        ...item,
        ...parseBody(config),
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      };
    }
    if (action === "convert") {
      collection.items[index] = {
        ...item,
        ...parseBody(config),
        status: "enrolled",
        stage: "won",
        updated_at: new Date().toISOString(),
      };
    }
    if (action === "lock") {
      collection.items[index] = {
        ...item,
        state: "LOCKED",
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    if (action === "pay") {
      collection.items[index] = {
        ...item,
        state: "PAID",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return respond(config, collection.items[index]);
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Adapter                                                                    */
/* -------------------------------------------------------------------------- */

export const mockAdapter: AxiosAdapter = async (config) => {
  await sleep(LATENCY_MS);

  const method = (config.method ?? "get").toLowerCase();
  const path = normalizePath(config);
  const segments = path.split("/").filter(Boolean);

  const authResponse = await handleAuth(config, path, method);
  if (authResponse) return authResponse;

  const dashboardResponse = handleDashboard(config, path, method);
  if (dashboardResponse) return dashboardResponse;

  const messagingResponse = handleMessaging(config, path, segments, method);
  if (messagingResponse) return messagingResponse;

  const reportsResponse = handleReports(config, path, method);
  if (reportsResponse) return reportsResponse;

  const centerSettingsResponse = handleSettingsCenter(config, path, method);
  if (centerSettingsResponse) return centerSettingsResponse;

  const leadConfigResponse = handleLeadConfig(config, segments, method);
  if (leadConfigResponse) return leadConfigResponse;

  const usersResponse = handleUsers(config, segments, method);
  if (usersResponse) return usersResponse;

  /* Guruh yozuvi: jadval → yorliq, xona nomi va dars generatsiyasi. */
  const groupWriteResponse = handleGroupWrite(config, segments, method);
  if (groupWriteResponse) return groupWriteResponse;

  const groupRelationResponse = handleGroupRelations(config, segments, method);
  if (groupRelationResponse) return groupRelationResponse;

  const payrollAdjustmentResponse = handlePayrollAdjustment(config, segments, method);
  if (payrollAdjustmentResponse) return payrollAdjustmentResponse;

  const enrollmentResponse = handleEnrollmentMutations(config, segments, method);
  if (enrollmentResponse) return enrollmentResponse;

  const schoolResponse = handleSchools(config, segments, method);
  if (schoolResponse) return schoolResponse;

  const leadRelationResponse = handleLeadRelations(config, segments, method);
  if (leadRelationResponse) return leadRelationResponse;

  // Lid → o'quvchi konvertatsiyasi (o'quvchi + a'zolik yaratadi).
  const leadConvertResponse = handleLeadConvert(config, segments, method);
  if (leadConvertResponse) return leadConvertResponse;

  // A'zolik o'qishda guruh/o'qituvchi nomlari inline qo'shiladi.
  const enrollmentRelationResponse = handleEnrollmentRelations(config, segments, method);
  if (enrollmentRelationResponse) return enrollmentRelationResponse;

  const billingResponse = handleBilling(config, segments, method);
  if (billingResponse) return billingResponse;

  const paymentMethodResponse = handlePaymentMethods(config, segments, method);
  if (paymentMethodResponse) return paymentMethodResponse;

  // Darslar va davomat — `handleCollection` dan oldin (aks holda
  // `/attendance/bulk/` id sifatida qaraladi).
  const lessonsResponse = handleLessons(config, segments, method);
  if (lessonsResponse) return lessonsResponse;

  const attendanceBulkResponse = handleAttendanceBulk(config, segments, method);
  if (attendanceBulkResponse) return attendanceBulkResponse;

  const collectionResponse = handleCollection(config, segments, method);
  if (collectionResponse) return collectionResponse;

  // Noma'lum manzillar — bo'sh javob (UI buzilmasligi uchun).
  if (import.meta.env.DEV) {
    console.warn(`[mock-api] "${method.toUpperCase()} ${path}" uchun handler yo'q`);
  }

  if (method === "get" && path.endsWith("/")) {
    return respond(config, paginate([]));
  }

  return respond(config, {});
};
