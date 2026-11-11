/**
 * Demo ma'lumotlar — backend API tayyor bo'lmaganda UI ni ko'rish uchun.
 *
 * Bu fayl faqat `VITE_USE_MOCK_API !== "false"` bo'lganda ishlatiladi.
 * Haqiqiy backend ulanganda hech qanday ta'sir ko'rsatmaydi.
 */

import { durationMinutes, normalizeTime, scheduleLabel } from "@/shared/lib/schedule";

export const TENANT_ID = "6f1a1e2e-1111-4a11-9a11-000000000001";
export const BRANCH_ID = "6f1a1e2e-2222-4a22-9a22-000000000001";

const now = new Date();
const iso = (daysAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86_400_000).toISOString();

/** Demo foydalanuvchi — CEO (barcha huquqlar). */
export const demoUser = {
  id: "6f1a1e2e-0000-4a00-9a00-000000000001",
  tenant_id: TENANT_ID,
  branch_id: BRANCH_ID,
  role: "ceo",
  first_name: "Alisher",
  last_name: "Karimov",
  middle_name: "Bahodirovich",
  phone: "+998 90 123 45 67",
  email: "admin@yolup.uz",
  avatar_url: null,
  is_active: true,
  is_email_verified: true,
  is_phone_verified: true,
  last_login_at: iso(0),
  created_at: iso(180),
  updated_at: iso(0),
  permissions: ["*"],
};

/* -------------------------------------------------------------------------- */
/*  Tenants                                                                    */
/* -------------------------------------------------------------------------- */

export const demoTenants = [
  ["Yolup Learning Center", "yolup-learning", "professional", "active", false, 500],
  ["Bright Future Education", "bright-future", "standard", "active", false, 300],
  ["Zukko O'quv Markazi", "zukko", "enterprise", "active", false, 1200],
  ["Bilim Nur", "bilim-nur", "basic", "trial", false, 100],
  ["IT Academy Tashkent", "it-academy", "professional", "active", false, 600],
  ["Language Hub", "language-hub", "standard", "expired", false, 250],
  ["Kids Smart", "kids-smart", "basic", "active", true, 80],
  ["Professor School", "professor-school", "enterprise", "active", false, 1500],
].map(([name, slug, tier, status, blocked, maxStudents], index) => ({
  id: index === 0 ? TENANT_ID : `tenant-${String(index + 1).padStart(4, "0")}`,
  name,
  slug,
  phone: `+998 71 200 ${String(10 + index).padStart(2, "0")} ${String(20 + index).padStart(2, "0")}`,
  email: `${slug}@yolup.uz`,
  address: "Toshkent sh., Amir Temur ko'chasi",
  logo_url: null,
  currency: "UZS",
  timezone: "Asia/Tashkent",
  subscription_tier: tier,
  subscription_status: status,
  subscription_expires_at: iso(-30 - index * 10),
  max_students: maxStudents,
  is_blocked: blocked,
  created_at: iso(200 - index),
  updated_at: iso(index),
}));

/* -------------------------------------------------------------------------- */
/*  Branches                                                                   */
/* -------------------------------------------------------------------------- */

export const demoBranches = [
  { name: "Chilonzor filiali", code: "CHL", address: "Chilonzor, Bunyodkor 12", phone: "+998 71 200 10 10" },
  { name: "Yunusobod filiali", code: "YNS", address: "Yunusobod, Amir Temur 108", phone: "+998 71 200 10 20" },
  { name: "Mirzo Ulug'bek filiali", code: "MUB", address: "Mirzo Ulug'bek, Mustaqillik 59", phone: "+998 71 200 10 30" },
  { name: "Sergeli filiali", code: "SRG", address: "Sergeli, Yangi Sergeli 4", phone: "+998 71 200 10 40" },
].map((branch, index) => ({
  id: index === 0 ? BRANCH_ID : `branch-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  ...branch,
  is_active: index !== 3,
  created_at: iso(150 - index * 5),
  updated_at: iso(index * 2),
}));

/* -------------------------------------------------------------------------- */
/*  Rooms                                                                      */
/* -------------------------------------------------------------------------- */

const ROOM_NAMES = ["101-xona", "102-xona", "201-xona", "202-xona", "301-xona", "302-xona", "Kompyuter sinfi", "Aktzal"];

export const demoRooms = ROOM_NAMES.map((name, index) => ({
  id: `room-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  branch_id: demoBranches[index % demoBranches.length].id,
  name,
  capacity: [12, 15, 20, 20, 25, 25, 16, 60][index],
  is_active: true,
  created_at: iso(140 - index),
  updated_at: iso(index),
}));

/* -------------------------------------------------------------------------- */
/*  Students                                                                   */
/* -------------------------------------------------------------------------- */

/** Guruh nomlari — `demoGroups` bilan bir xil, jadvalda ko'rsatish uchun. */
const STUDENT_GROUPS = [
  "Ingliz tili — Beginner A1",
  "Ingliz tili — Intermediate B1",
  "Matematika — 9-sinf",
  "Frontend dasturlash",
  "IELTS tayyorlov",
];

/**
 * To'lov qiluvchi ota-onalar — demo uchun.
 *
 * Ro'yxat uzunligi `STUDENT_ROWS` dan kamroq: oxirgi ikki o'quvchi
 * birinchi ikki ota-onaga `index % length` orqali ulanadi va shu bilan
 * "ko'p farzandli" ota-ona stsenariysi demo ma'lumotda ham bo'ladi.
 */
const STUDENT_PARENTS = [
  "Bahodir Toshmatov",
  "Nargiza Rahimova",
  "Ulug'bek Yo'ldoshev",
  "Zulfiya Abdullayeva",
  "Anvar Nurmatov",
  "Dilfuza Ergasheva",
  "Suhrob Sultanov",
  "Malohat Qodirova",
  "Ravshan Mirzayev",
  "Gulnora Islomova",
  "Nodir Xolmatov",
  "Shahnoza Yusupova",
  "Farhod Rasulov",
  "Mavjuda Saidova",
  "Akmal Tursunov",
  "Sevara Qosimova",
  "Rustam Jalilov",
  "Hilola Umarova",
  "Botir Sattorov",
  "Munisa Xakimova",
  "Sherzod Nazarov",
  "Aziza Ismoilova",
  "Kamron Yoqubov",
  "Dildora Karimova",
  "Bahrom Umarov",
  "Ziyoda Sultonova",
  "Ilyos Rahimov",
  "Ozoda Toshpulatova",
];

/**
 * O'quvchilar: [ism, familiya, holat, balans (so'm)].
 *
 * 30 yozuv — guruhlar sahifasidagi "6/20" kabi bandlik ko'rsatkichlari
 * haqiqiy a'zolik (`demoEnrollments`) bilan mos bo'lishi uchun.
 */
const STUDENT_ROWS: Array<[string, string, string, number]> = [
  ["Aziz", "Toshmatov", "active", 0],
  ["Dilnoza", "Rahimova", "active", 450_000],
  ["Sardor", "Yo'ldoshev", "trial", -120_000],
  ["Malika", "Abdullayeva", "active", 0],
  ["Jasur", "Nurmatov", "frozen", -600_000],
  ["Zilola", "Ergasheva", "active", 0],
  ["Bekzod", "Sultanov", "active", 250_000],
  ["Nilufar", "Qodirova", "graduated", 0],
  ["Otabek", "Mirzayev", "active", -80_000],
  ["Shahzoda", "Islomova", "active", 0],
  ["Rustam", "Xolmatov", "left", 0],
  ["Kamola", "Yusupova", "active", 1_200_000],
  ["Farrux", "Rasulov", "trial", 0],
  ["Madina", "Saidova", "active", -350_000],
  ["Aziza", "Tursunova", "active", 0],
  ["Sanjar", "Qosimov", "active", -150_000],
  ["Mohira", "Jalilova", "active", 0],
  ["Doston", "Umarov", "trial", 0],
  ["Kamila", "Sattorova", "active", 900_000],
  ["Behruz", "Xakimov", "frozen", -450_000],
  ["Nodira", "Nazarova", "active", 0],
  ["Temur", "Ismoilov", "active", 300_000],
  ["Gulchehra", "Yoqubova", "active", 0],
  ["Sardor", "Karimov", "left", 0],
  ["Ziyoda", "Umarova", "active", -200_000],
  ["Aziz", "Sultonov", "trial", 0],
  ["Dildora", "Rahimova", "active", 1_500_000],
  ["Kamron", "Toshpulatov", "active", 0],
  ["Malika", "Ergasheva", "graduated", 0],
  ["Farrux", "Yusupov", "active", -100_000],
];

export const demoStudents = STUDENT_ROWS.map(([firstName, lastName, status, balance], index) => ({
  id: `student-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  branch_id: demoBranches[index % demoBranches.length].id,
  first_name: firstName,
  last_name: lastName,
  middle_name: null,
  phone: `+998 9${index % 10} ${300 + index} ${10 + index} ${20 + index}`,
  email: null,
  birth_date: iso(4000 + index * 40),
  gender: index % 2 === 0 ? "male" : "female",
  address: "Toshkent sh.",
  photo_url: null,
  enrollment_date: iso(120 - index * 3),
  status,
  balance_tiyin: balance * 100,
  group_name: STUDENT_GROUPS[index % STUDENT_GROUPS.length],
  parent_name: STUDENT_PARENTS[index % STUDENT_PARENTS.length],
  created_at: iso(120 - index * 3),
  updated_at: iso(index),
}));

/* -------------------------------------------------------------------------- */
/*  Groups                                                                     */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Staff (users)                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Xodimlar: [ism, familiya, rol, filial].
 *
 * `teacher` rolli yozuvlar guruhlarga biriktiriladi, shuning uchun ro'yxat
 * guruhlardan oldin e'lon qilinadi. Tartib o'zgarsa `GROUP_TEACHER_ROWS`
 * dagi indekslarni ham yangilash kerak.
 */
export const demoUsers = [
  ["Alisher", "Karimov", "ceo", BRANCH_ID],
  ["Nodira", "Ahmedova", "admin", BRANCH_ID],
  ["Sardor", "Bekmurodov", "teacher", demoBranches[1].id],
  ["Kamila", "Sattorova", "teacher", demoBranches[2].id],
  ["Javohir", "Ummatov", "teacher", BRANCH_ID],
  ["Lola", "Nazarova", "admin", demoBranches[3].id],
  ["Dilnoza", "Yusupova", "teacher", BRANCH_ID],
  ["Sanjar", "Tursunov", "teacher", demoBranches[1].id],
  ["Nilufar", "Aliyeva", "teacher", demoBranches[2].id],
  ["Javlon", "Bekmurodov", "teacher", demoBranches[3].id],
  ["Rustam", "Saidov", "teacher", BRANCH_ID],
  ["Malika", "Ergasheva", "teacher", demoBranches[1].id],
].map(([firstName, lastName, role, branchId], index) => ({
  id: index === 0 ? demoUser.id : `user-${String(index).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  branch_id: branchId,
  role,
  first_name: firstName,
  last_name: lastName,
  phone: `+998 9${index} ${400 + index} ${30 + index} ${40 + index}`,
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@yolup.uz`,
  avatar_url: null,
  is_active: true,
  created_at: iso(170 - index * 10),
  updated_at: iso(index),
}));

/** Guruhlarga biriktirish mumkin bo'lgan o'qituvchilar. */
export const demoTeachers = demoUsers.filter((user) => user.role === "teacher");

/* -------------------------------------------------------------------------- */
/*  Groups                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Guruh kartasi uchun qo'shimcha maydonlar:
 * [asosiy o'qituvchi (`demoTeachers` indeksi), xona, sig'im].
 * Haftalik jadval alohida — `GROUP_SCHEDULES`.
 */
const GROUP_EXTRA: Array<[number, string, number]> = [
  [3, "201-xona", 20],
  [4, "202-xona", 20],
  [5, "301-xona", 25],
  [6, "Kompyuter sinfi", 16],
  [7, "102-xona", 15],
  [8, "302-xona", 25],
];

/**
 * Har bir guruhning haftalik jadvali. `day_of_week` — JS `getDay()`:
 * 0 = Yakshanba, 1 = Dushanba … 6 = Shanba.
 */
const GROUP_SCHEDULES: Array<Array<{ day_of_week: number; start_time: string; end_time: string }>> =
  [
    [1, 3, 5].map((day) => ({ day_of_week: day, start_time: "11:00", end_time: "12:30" })),
    [2, 4, 6].map((day) => ({ day_of_week: day, start_time: "14:00", end_time: "15:30" })),
    [1, 2, 3].map((day) => ({ day_of_week: day, start_time: "11:00", end_time: "12:30" })),
    [4, 6].map((day) => ({ day_of_week: day, start_time: "18:30", end_time: "20:00" })),
    [1, 2, 4].map((day) => ({ day_of_week: day, start_time: "09:00", end_time: "10:30" })),
    [2, 3, 6].map((day) => ({ day_of_week: day, start_time: "16:00", end_time: "17:30" })),
  ];

/** `demoCourses` bilan bir xil tartib — modul yuklanish tartibiga bog'liq bo'lmasin. */
const GROUP_COURSE_NAMES = [
  "Ingliz tili — umumiy kurs",
  "Matematika — umumta'lim",
  "Frontend dasturlash",
  "Rus tili",
  "IELTS tayyorlov",
  "Kimyo",
];

/**
 * Guruhdagi faol a'zolar soni — yagona manba `demoStudents.group_name` va
 * holati (`left`/`graduated` a'zo hisoblanmaydi). Shu sababli ro'yxatdagi son
 * guruh sahifasidagi o'quvchilar ro'yxatiga doim mos keladi.
 */
const groupMembersCount = (groupName: string) =>
  demoStudents.filter(
    (student) =>
      student.group_name === groupName &&
      student.status !== "left" &&
      student.status !== "graduated",
  ).length;

export const demoGroups = [
  ["Ingliz tili — Beginner A1", "active", 650_000, "#2563eb", 1],
  ["Ingliz tili — Intermediate B1", "active", 750_000, "#7c3aed", 1],
  ["Matematika — 9-sinf", "active", 500_000, "#059669", 2],
  ["Frontend dasturlash", "active", 1_200_000, "#ea580c", 3],
  ["Rus tili — Boshlang'ich", "planned", 550_000, "#dc2626", 4],
  ["IELTS tayyorlov", "completed", 1_500_000, "#0891b2", 5],
].map(([name, status, price, color, courseIndex], index) => {
  const [teacherIndex, room, capacity] = GROUP_EXTRA[index];
  const teacher = demoTeachers[teacherIndex];
  const schedule = GROUP_SCHEDULES[index] ?? [];
  const roomRecord = demoRooms.find((item) => item.name === room);
  return {
    id: `group-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    branch_id: demoBranches[index % demoBranches.length].id,
    course_id: `course-${String(courseIndex).padStart(4, "0")}`,
    name,
    color,
    price_tiyin: Number(price) * 100,
    start_date: iso(100 - index * 10),
    end_date: index === 5 ? iso(10) : null,
    status,
    billing_mode: index % 2 === 0 ? "monthly_calendar" : "monthly_from_enrollment",
    created_by: demoUser.id,
    course_name: GROUP_COURSE_NAMES[Number(courseIndex) - 1],
    branch_name: demoBranches[index % demoBranches.length].name,
    teacher_id: teacher.id,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
    room_id: roomRecord?.id ?? null,
    room_name: room,
    schedule,
    schedule_label: scheduleLabel(schedule),
    students_count: groupMembersCount(String(name)),
    capacity,
    created_at: iso(100 - index * 10),
    updated_at: iso(index),
  };
});

/* -------------------------------------------------------------------------- */
/*  Group teachers — guruh ↔ o'qituvchi                                        */
/* -------------------------------------------------------------------------- */

/**
 * [guruh indeksi, o'qituvchi indeksi, rol, haq turi, qiymat].
 *
 * `percentage` uchun qiymat — foiz (30 → 30%), saqlashda 100 ga ko'paytiriladi
 * (`pay_value_tiyin` bazis punktda); qolgan turlar uchun qiymat — so'm.
 */
const GROUP_TEACHER_ROWS: Array<[number, number, string, string, number]> = [
  [0, 3, "main", "percentage", 30],
  [0, 4, "assistant", "fixed", 1_500_000],
  [1, 4, "main", "per_student", 150_000],
  [2, 5, "main", "fixed", 3_000_000],
  [2, 2, "co_teacher", "per_lesson", 80_000],
  [3, 6, "main", "percentage", 35],
  [4, 7, "main", "fixed", 2_500_000],
  [5, 8, "main", "per_lesson", 120_000],
  [5, 0, "assistant", "per_student", 100_000],
];

export const demoGroupTeachers = GROUP_TEACHER_ROWS.map(
  ([groupIndex, teacherIndex, role, payRule, value], index) => {
    const group = demoGroups[groupIndex];
    const teacher = demoTeachers[teacherIndex];
    return {
      id: `group-teacher-${String(index + 1).padStart(4, "0")}`,
      group_id: group.id,
      user_id: teacher.id,
      role,
      pay_rule: payRule,
      pay_value_tiyin: Number(value) * 100,
      user_name: `${teacher.first_name} ${teacher.last_name}`,
      user_phone: teacher.phone,
      created_at: iso(90 - groupIndex * 10),
      updated_at: iso(index),
    };
  },
);

/* -------------------------------------------------------------------------- */
/*  Enrollments — o'quvchi ↔ guruh a'zoligi                                    */
/* -------------------------------------------------------------------------- */

const ENROLLMENT_STATUS: Record<string, string> = { graduated: "completed" };

const FREEZE_REASONS = [
  "Moliyaviy qiyinchilik",
  "Sog'lig'i sababli",
  "Boshqa shaharga ketdi",
];
const LEFT_REASONS = [
  "Boshqa markazga o'tdi",
  "Dars jadvali to'g'ri kelmadi",
  "O'qishni to'xtatdi",
];

/**
 * Har bir o'quvchi bitta guruhda — `demoAttendance` dagi `enrollment_id`
 * (`enrollment-000N`) bilan bir xil tartibda.
 */
export const demoEnrollments = demoStudents.map((student, index) => {
  const group = demoGroups.find((item) => item.name === student.group_name);
  const status = ENROLLMENT_STATUS[student.status] ?? student.status;
  return {
    id: `enrollment-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    group_id: group?.id ?? null,
    student_id: student.id,
    status,
    joined_at: student.enrollment_date,
    left_at: status === "left" ? iso(index % 20) : null,
    freeze_reason: status === "frozen" ? FREEZE_REASONS[index % FREEZE_REASONS.length] : null,
    left_reason: status === "left" ? LEFT_REASONS[index % LEFT_REASONS.length] : null,
    created_at: student.enrollment_date,
    updated_at: iso(index),
  };
});

/* -------------------------------------------------------------------------- */
/*  Courses                                                                    */
/* -------------------------------------------------------------------------- */

/** [nomi, kodi, oylik narx, davomiylik (oy), darslar soni, faol, tavsif]. */
const COURSE_ROWS: Array<[string, string, number, number, number, boolean, string | null]> = [
  [
    "Ingliz tili — umumiy kurs",
    "ENG",
    650_000,
    9,
    72,
    true,
    "Boshlang'ich va o'rta daraja uchun umumiy ingliz tili kursi.",
  ],
  [
    "Matematika — umumta'lim",
    "MATH",
    500_000,
    9,
    72,
    true,
    "Maktab dasturiga moslashtirilgan matematika kursi.",
  ],
  [
    "Frontend dasturlash",
    "FE",
    1_200_000,
    6,
    48,
    true,
    "HTML, CSS, JavaScript va React asoslari.",
  ],
  ["Rus tili", "RUS", 550_000, 9, 72, true, null],
  ["IELTS tayyorlov", "IELTS", 1_500_000, 4, 32, true, "6.5+ natija uchun intensiv tayyorlov."],
  ["Kimyo", "CHEM", 600_000, 9, 72, true, null],
  /* Nofaol kurs — holat filtri va o'chirish oqimini sinash uchun. */
  [
    "Grafik dizayn",
    "GRAF",
    700_000,
    6,
    48,
    false,
    "Figma va Illustrator asosida dizayn kursi. Hozircha guruh ochilmagan.",
  ],
];

export const demoCourses = COURSE_ROWS.map(
  ([name, code, price, months, lessons, isActive, description], index) => ({
    id: `course-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    name,
    code,
    description,
    price_tiyin: Number(price) * 100,
    duration_months: months,
    lessons_count: lessons,
    syllabus: null,
    is_active: isActive,
    created_at: iso(190 - index * 7),
    updated_at: iso(index),
  }),
);

/* Xodimlar (users) ro'yxati — guruhlarga biriktirish uchun "Groups" bo'limidan
   oldin e'lon qilinadi (yuqoriga qarang). */

/* -------------------------------------------------------------------------- */
/*  Dashboard — CEO overview (demo)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pul birliklari — tiyin (1 so'm = 100 tiyin), `formatMoney` shuni kutadi.
 * `kind` esa komponentga qanday formatlashni aytadi.
 */
export const demoDashboard = {
  kpis: [
    {
      key: "students",
      title: "Faol o'quvchilar",
      kind: "number",
      value: 1240,
      delta: 3.8,
      trend: "up",
      spark: [42, 45, 44, 48, 52, 50, 56, 60, 58, 63, 66, 70],
    },
    {
      key: "attendance",
      title: "Bugungi davomat",
      kind: "percent",
      value: 89,
      delta: 1.2,
      trend: "up",
      spark: [80, 84, 82, 86, 88, 85, 89, 91, 88, 90, 92, 89],
    },
    {
      key: "balance",
      title: "Kassa balansi",
      kind: "money",
      value: 18_245_000_000,
      delta: 6.4,
      trend: "up",
      spark: [58, 60, 57, 62, 66, 64, 69, 72, 70, 75, 79, 84],
    },
    {
      key: "debt",
      title: "Umumiy qarz",
      kind: "money",
      value: 4_230_000_000,
      delta: -2.1,
      trend: "down",
      spark: [72, 70, 71, 68, 66, 67, 63, 61, 60, 58, 55, 52],
    },
  ],

  schedule: {
    rooms: ["101", "102", "201", "202"],
    slots: ["09:00", "11:00", "13:00", "15:00", "17:00"],
    blocks: [
      { slot: "09:00", room: "101", group: "Beginner A1", teacher: "N. Ahmedova", tone: 1 },
      { slot: "09:00", room: "201", group: "Matematika 9", teacher: "S. Bekmurodov", tone: 3 },
      { slot: "11:00", room: "101", group: "Intermediate B1", teacher: "K. Sattorova", tone: 2 },
      { slot: "11:00", room: "102", group: "Rus tili", teacher: "L. Nazarova", tone: 4 },
      { slot: "13:00", room: "201", group: "Frontend", teacher: "J. Ummatov", tone: 5 },
      { slot: "15:00", room: "202", group: "IELTS", teacher: "N. Ahmedova", tone: 1 },
      { slot: "15:00", room: "101", group: "Kimyo", teacher: "S. Bekmurodov", tone: 3 },
      { slot: "17:00", room: "201", group: "Beginner A1", teacher: "K. Sattorova", tone: 2 },
      { slot: "17:00", room: "202", group: "Frontend", teacher: "J. Ummatov", tone: 5 },
    ],
  },

  occupancy: [
    { room: "101-xona", percent: 96, seats: "16/16" },
    { room: "102-xona", percent: 82, seats: "13/16" },
    { room: "201-xona", percent: 88, seats: "22/25" },
    { room: "202-xona", percent: 64, seats: "16/25" },
    { room: "301-xona", percent: 74, seats: "18/24" },
  ],

  transactions: [
    { id: "tx-1", student: "Dilnoza Rahimova", group: "Beginner A1", amount_tiyin: 65_000_000, method: "click", time: "10:24" },
    { id: "tx-2", student: "Bekzod Sultanov", group: "Intermediate B1", amount_tiyin: 75_000_000, method: "cash", time: "10:02" },
    { id: "tx-3", student: "Kamola Yusupova", group: "Frontend", amount_tiyin: 120_000_000, method: "payme", time: "09:47" },
    { id: "tx-4", student: "Shahzoda Islomova", group: "Matematika 9", amount_tiyin: 50_000_000, method: "card", time: "09:15" },
    { id: "tx-5", student: "Aziz Toshmatov", group: "IELTS", amount_tiyin: 150_000_000, method: "transfer", time: "08:58" },
  ],

  tasks: [
    { id: "t-1", title: "12 ta to'lovni tasdiqlash", meta: "Kassa smenasi · Nodira A.", done: false },
    { id: "t-2", title: "Qarzdorlar ro'yxatini yuborish", meta: "3 o'quvchi · muddati o'tgan", done: false },
    { id: "t-3", title: "Yangi guruh jadvalini chiqarish", meta: "Rus tili · 14:00", done: true },
    { id: "t-4", title: "Oylik ish haqi loyihasi", meta: "Oktabr · 18 xodim", done: false },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Maktablar katalogi — lidlar qaysi maktabdan kelgani                        */
/* -------------------------------------------------------------------------- */

/**
 * [nomi, turi, tuman, manzil, mas'ul shaxs, telefon, o'quvchilar sig'imi,
 *  faol, hamkorlik boshlangan (kun oldin)]
 *
 * Demo ataylab "chala" yozuvlardan iborat: mas'ul shaxsi yo'q, telefonsiz,
 * faol bo'lmagan va hamkorlik sanasi kiritilmagan maktablar ham bor.
 */
const SCHOOL_ROWS: Array<
  [string, string, string, string, string | null, string | null, number, boolean, number | null]
> = [
  ["12-umumta'lim maktabi", "public", "Chilonzor tumani", "Bunyodkor shoh ko'chasi 12", "Malohat Rahimova", "+998 71 273 12 12", 1200, true, 300],
  ["56-umumta'lim maktabi", "public", "Yunusobod tumani", "Amir Temur shoh ko'chasi 56", "Ulug'bek Sattorov", "+998 71 234 56 56", 980, true, 240],
  ["Prezident maktabi", "lyceum", "Mirzo Ulug'bek tumani", "Mustaqillik shoh ko'chasi 4", null, null, 600, true, 180],
  ["«Bilim» xususiy maktabi", "private", "Mirzo Ulug'bek tumani", "Sayilgoh ko'chasi 21", "Nargiza Qosimova", "+998 90 144 21 21", 420, true, 150],
  ["Ziyo akademik litseyi", "lyceum", "Yakkasaroy tumani", "Shota Rustaveli 8", "Bahrom Umarov", "+998 71 255 08 08", 540, true, 120],
  ["«Kamalak» xususiy bog'chasi", "kindergarten", "Sergeli tumani", "Yangi Sergeli 3-mavze", "Dilfuza Ergasheva", "+998 93 366 03 03", 160, true, 90],
  ["Innovatsiya xususiy maktabi", "private", "Olmazor tumani", "Qorasaroy 74", "Sardor Yo'ldoshev", "+998 97 777 74 74", 300, false, 75],
  ["Toshkent davlat pedagogika universiteti", "university", "Chilonzor tumani", "Bunyodkor 27", "Ra'no Ismoilova", "+998 71 276 27 27", 5000, true, 60],
  ["«Oltin vodiy» umumta'lim maktabi", "public", "Yashnobod tumani", "Maxtumquli 9", "Farhod Rasulov", "+998 71 296 09 09", 860, true, 45],
  ["«Istiqlol» xususiy maktabi", "private", "Bektemir tumani", "Paxtakor ko'chasi 15", "Zulfiya Abdullayeva", null, 240, true, 30],
  ["211-umumta'lim maktabi", "public", "Uchtepa tumani", "Ahmad Donish 211", "Nodir Xolmatov", "+998 71 289 11 11", 1100, false, null],
  ["Xalqaro «Cambridge» maktabi", "private", "Mirzo Ulug'bek tumani", "Buyuk Ipak Yo'li 33", "Kamila Sattorova", "+998 90 188 33 33", 380, true, 15],
];

export const demoSchools = SCHOOL_ROWS.map(
  (
    [name, type, district, address, contactPerson, phone, capacity, isActive, partnerDays],
    index,
  ) => ({
    id: `school-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    name,
    type,
    district,
    address,
    contact_person: contactPerson,
    phone,
    student_capacity: capacity,
    is_active: isActive,
    partner_since: partnerDays === null ? null : iso(partnerDays).slice(0, 10),
    notes: null,
    created_at: iso(partnerDays ?? 30 + index * 5),
    updated_at: iso(index),
  }),
);

/* -------------------------------------------------------------------------- */
/*  Leads (CRM pipeline)                                                       */
/* -------------------------------------------------------------------------- */

/** [ism, familiya, status, bosqich, harorat, manba, maktab indeksi (-1 — yo'q)] */
const LEAD_ROWS: Array<
  [string, string, string, string, string, string, number]
> = [
  ["Dilshod", "Nazarov", "new", "open", "hot", "Instagram", 0],
  ["Zilola", "Karimova", "new", "open", "warm", "Telegram", 0],
  ["Sanjar", "Toshpo'latov", "new", "open", "cold", "Banner", 3],
  ["Bekzod", "Yusupov", "not_connected", "open", "cold", "Instagram", 0],
  ["Mohira", "Ergasheva", "connected", "waiting", "warm", "Tavsiya", 1],
  ["Ozoda", "Xolmatova", "connected", "trial", "hot", "Veb-sayt", 8],
  ["Umid", "Sattorov", "trial", "trial", "hot", "Telegram", 4],
  ["Feruza", "Ahmedova", "trial", "trial", "warm", "Tavsiya", 5],
  ["Islom", "Rahimov", "enrolled", "won", "hot", "Instagram", 2],
  ["Kamila", "Yusupova", "enrolled", "won", "warm", "Veb-sayt", 2],
  ["Davron", "Mirzayev", "enrolled", "won", "hot", "Tavsiya", 6],
  ["Nodira", "Sobirova", "rejected", "lost", "cold", "Banner", 11],
  ["Shoxrux", "Ismoilov", "rejected", "lost", "cold", "Instagram", -1],
];

export const demoLeadSources = ["Instagram", "Telegram", "Veb-sayt", "Tavsiya", "Banner"].map(
  (name, index) => ({
    id: `lead-source-${index + 1}`,
    tenant_id: TENANT_ID,
    name,
    is_active: true,
  }),
);

/**
 * Foydalanuvchi qo'shgan kanban ustunlari (tizim bosqichlaridan keyin).
 * `order` — ustunlar ketma-ketligi; tahrirlash Sozlamalar → Lid bosqichlarida.
 */
export const demoLeadStages: Array<Record<string, unknown>> = [
  {
    id: "lead-stage-0001",
    tenant_id: TENANT_ID,
    name: "Qayta qo'ng'iroq",
    color: "warning",
    order: 1,
    is_active: true,
    created_at: iso(40),
    updated_at: iso(3),
  },
  {
    id: "lead-stage-0002",
    tenant_id: TENANT_ID,
    name: "Hujjatlar tayyor",
    color: "info",
    order: 2,
    is_active: true,
    created_at: iso(35),
    updated_at: iso(2),
  },
];

export const demoLeadLossReasons = [
  "Narx qimmat",
  "Joylashuvi uzoq",
  "Vaqti to'g'ri kelmadi",
  "Boshqa markazni tanladi",
].map((name, index) => ({
  id: `lead-loss-${index + 1}`,
  tenant_id: TENANT_ID,
  name,
  is_active: true,
}));

const TEACHERS = demoUsers.filter((user) => user.role === "teacher");

/**
 * `school_name` ataylab saqlanmaydi — mock uni o'qishda maktab katalogidan
 * qo'shadi (`handleLeadRelations`), shuning uchun maktab nomi o'zgarsa ham
 * lidlarda eski nom qolib ketmaydi.
 */
export const demoLeads = LEAD_ROWS.map(
  ([first, last, status, stage, temperature, source, schoolIndex], index) => {
    const teacher = TEACHERS[index % TEACHERS.length];
    return {
      id: `lead-${String(index + 1).padStart(4, "0")}`,
      tenant_id: TENANT_ID,
      branch_id: demoBranches[index % demoBranches.length].id,
      source_id: `lead-source-${(index % 5) + 1}`,
      school_id: schoolIndex === -1 ? null : demoSchools[schoolIndex].id,
      first_name: first,
      last_name: last,
      phone: `+998 9${index % 10} ${500 + index} ${10 + index} ${30 + index}`,
      birth_date: null,
      age: 15 + (index % 10),
      teacher_id: teacher.id,
      lesson_time: index % 3 === 0 ? "16:00" : "11:00",
      lesson_day_type: "odd",
      status,
      stage,
      temperature,
      body: null,
      loss_reason_id: stage === "lost" ? "lead-loss-1" : null,
      converted_to_student_id: stage === "won" ? demoStudents[index % demoStudents.length].id : null,
      converted_to_group_id: null,
      created_by: demoUser.id,
      source_name: source,
      teacher_name: `${teacher.first_name} ${teacher.last_name}`,
      created_at: iso(index * 2),
      updated_at: iso(index),
    };
  },
);

/* -------------------------------------------------------------------------- */
/*  Moliya — to'lovlar va xarajatlar                                           */
/* -------------------------------------------------------------------------- */

const PAYMENT_METHODS = ["cash", "card", "click", "payme", "uzum", "transfer"];

/**
 * Hisob-kitob (billing) faqat **faol** o'quvchilarga yuritiladi.
 *
 * Sinov darsi (`trial`) bepul, muzlatilgan (`frozen`) o'quvchidan to'lov
 * olinmaydi, ketgan (`left`) va bitirgan (`graduated`) o'quvchilar esa
 * ro'yxatdan chiqqan. Ilgari trial/frozen ham hisoblanib, ular "qarzdor"
 * bo'lib ko'rinardi — bu biznes mantiqqa zid edi.
 */
const isBillable = (status: string) => status === "active";

/** To'lov qiladigan o'quvchilar — faqat faol holatdagilar. */
const BILLABLE_STUDENTS = demoStudents.filter((student) => isBillable(student.status));

/** Har to'rtinchi to'lov qismli — qarz to'liq yopilmagan holatlar uchun. */
const PARTIAL_PAYMENT_FACTOR = 0.5;

export const demoPayments = Array.from({ length: 42 }).map((_, index) => {
  const student = BILLABLE_STUDENTS[index % BILLABLE_STUDENTS.length];
  const group =
    demoGroups.find((item) => item.name === student.group_name) ?? demoGroups[0];
  const factor = index % 4 === 2 ? PARTIAL_PAYMENT_FACTOR : 1;

  return {
    id: `payment-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    student_id: student.id,
    group_id: group.id,
    amount_tiyin: Math.round(group.price_tiyin * factor),
    method: PAYMENT_METHODS[index % PAYMENT_METHODS.length],
    receipt_url: null,
    receipt_number: `YLP-${1000 + index}`,
    paid_at: iso((index * 3) % 150),
    created_by: demoUser.id,
    student_name: `${student.first_name} ${student.last_name}`,
    group_name: group.name,
    created_at: iso((index * 3) % 150),
  };
});

export const demoExpenseCategories = [
  "Ijara",
  "Kommunal",
  "Ish haqi",
  "Marketing",
  "Jihozlar",
  "Boshqa",
].map((name, index) => ({
  id: `expense-category-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  name,
  is_active: true,
}));

/** [kategoriya, so'm, izoh] */
const EXPENSE_ROWS: Array<[string, number, string]> = [
  ["Ijara", 12_000_000, "Noyabr oyi ijarasi"],
  ["Kommunal", 1_850_000, "Elektr va suv"],
  ["Marketing", 3_500_000, "Instagram target"],
  ["Jihozlar", 2_400_000, "5 ta noutbuk"],
  ["Boshqa", 640_000, "Ofis sarf materiallari"],
  ["Boshqa", 320_000, "Internet va aloqa"],
];

export const demoExpenses = EXPENSE_ROWS.map(([category, amount, description], index) => {
  const match = demoExpenseCategories.find((item) => item.name === category);
  return {
    id: `expense-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    branch_id: demoBranches[index % demoBranches.length].id,
    category_id: match?.id ?? demoExpenseCategories[0].id,
    category_name: category,
    amount_tiyin: amount * 100,
    description,
    date: iso(index * 3),
    created_by: demoUser.id,
    created_at: iso(index * 3),
  };
});

/* -------------------------------------------------------------------------- */
/*  Xabarlar — shablonlar va log                                               */
/* -------------------------------------------------------------------------- */

/** [nomi, kanal, matn] */
const TEMPLATE_ROWS: Array<[string, string, string]> = [
  [
    "To'lov qabul qilindi",
    "sms",
    "Hurmatli {ota-ona}! {o'quvchi} uchun {summa} so'm to'lov qabul qilindi. Rahmat!",
  ],
  [
    "Qarz eslatmasi",
    "sms",
    "Hurmatli {ota-ona}, {o'quvchi} bo'yicha {summa} so'm qarz mavjud. Iltimos, to'lovni amalga oshiring.",
  ],
  [
    "Davomat — kelmadi",
    "sms",
    "Hurmatli {ota-ona}, {o'quvchi} bugungi darsga kelmadi. Sababini bizga xabar qiling.",
  ],
  [
    "Sinov darsiga taklif",
    "telegram",
    "Assalomu alaykum! {o'quvchi} uchun bepul sinov darsi {time} da. Kelishingizni kutamiz.",
  ],
  ["Guruh boshlanishi", "push", "{group} guruhi {date} dan boshlanadi. Guruhga xush kelibsiz!"],
];

export const demoMessageTemplates = TEMPLATE_ROWS.map(([name, channel, body], index) => ({
  id: `template-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  name,
  channel,
  subject: null,
  body,
  is_active: true,
  created_at: iso(60 - index * 5),
}));

/** [qabul qiluvchi, shablon, holat, vaqt] */
const LOG_ROWS: Array<[string, string, string, number]> = [
  ["Aziz Toshmatov", "To'lov qabul qilindi", "sent", 0],
  ["Javohir Qodirov", "Qarz eslatmasi", "sent", 0],
  ["Sardor Yo'ldoshev", "Davomat — kelmadi", "queued", 0],
  ["Shahzoda Islomova", "Sinov darsiga taklif", "failed", 1],
  ["Malika Abdullayeva", "To'lov qabul qilindi", "sent", 1],
  ["Dilnoza Rahimova", "Qarz eslatmasi", "sent", 2],
  ["Jasur Nurmatov", "Guruh boshlanishi", "delivered", 2],
  ["Nodira Sobirova", "Davomat — kelmadi", "failed", 3],
];

export const demoMessageLogs = LOG_ROWS.map(([name, template, status, daysAgo], index) => ({
  id: `message-log-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  recipient_phone: `+998 9${index % 10} ${300 + index} ${10 + index} ${20 + index}`,
  recipient_name: name,
  channel: "sms",
  template_name: template,
  body: `Shablon: ${template}`,
  status,
  sent_at: iso(daysAgo),
  created_at: iso(daysAgo),
}));

/* -------------------------------------------------------------------------- */
/*  Ish haqi, ota-onalar, davomat                                              */
/* -------------------------------------------------------------------------- */

const PAYROLL_BASE = [4_500_000, 3_800_000, 5_200_000, 5_000_000, 5_400_000, 3_600_000];
const PAYROLL_ADJUSTMENTS = [200_000, 0, -150_000, 300_000, 0, 100_000];
const PAYROLL_STATES = ["PAID", "PAID", "LOCKED", "LOCKED", "DRAFT", "DRAFT"];

/** Joriy oy (`YYYY-MM`) — fixture vaqt o'tishi bilan eskirib qolmasin. */
const PAYROLL_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

/**
 * Xodimlar oyligi. Summalar ro'yxati xodimlar sonidan qisqa bo'lgani uchun
 * `index % length` ishlatiladi — ilgari to'g'ridan-to'g'ri indeks bo'yicha
 * olinib, 6 tadan keyingi xodimlarda `NaN` chiqardi.
 */
export const demoPayroll = demoUsers.map((user, index) => {
  const slot = index % PAYROLL_BASE.length;
  const base = PAYROLL_BASE[slot] * 100;
  const adjustments = PAYROLL_ADJUSTMENTS[slot] * 100;
  const state = PAYROLL_STATES[slot];
  return {
    id: `payroll-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    user_id: user.id,
    month: PAYROLL_MONTH,
    base_amount_tiyin: base,
    adjustments_tiyin: adjustments,
    final_amount_tiyin: base + adjustments,
    state,
    user_name: `${user.first_name} ${user.last_name}`,
    role: user.role,
    created_at: iso(6),
    locked_at: state === "DRAFT" ? null : iso(4),
    paid_at: state === "PAID" ? iso(2) : null,
  };
});

export const demoParents = STUDENT_PARENTS.map((fullName, index) => {
  const [first, last] = fullName.split(" ");
  const student = demoStudents[index % demoStudents.length];
  return {
    id: `parent-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    first_name: first,
    last_name: last,
    middle_name: null,
    phone: `+998 9${index % 10} ${600 + index} ${10 + index} ${40 + index}`,
    email: null,
    relation: index % 3 === 0 ? "Ota" : "Ona",
    student_name: `${student.first_name} ${student.last_name}`,
    students_count: index % 5 === 0 ? 2 : 1,
    created_at: iso(120 - index * 3),
    updated_at: iso(index),
  };
});

/* -------------------------------------------------------------------------- */
/*  Darslar (lessons) va davomat                                               */
/* -------------------------------------------------------------------------- */

export interface DemoLesson {
  id: string;
  tenant_id: string;
  group_id: string;
  room_id: string | null;
  room_name: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: "scheduled" | "held" | "cancelled";
  group_name: string;
  teacher_name: string;
  students_count: number;
  created_at: string;
  updated_at: string;
}

export interface DemoAttendanceRow {
  id: string;
  tenant_id: string;
  lesson_id: string;
  enrollment_id: string;
  /** O'quvchi kabineti uchun — davomat to'g'ridan-to'g'ri o'quvchiga ham bog'lanadi. */
  student_id: string;
  status: string;
  marked_by: string | null;
  note: string | null;
  student_name: string;
  group_name: string;
  lesson_date: string;
  created_at: string;
  updated_at: string;
}

const LESSON_TOPICS = [
  "Kirish va takrorlash",
  "Yangi mavzu",
  "Grammatika amaliyoti",
  "Lug'at va talaffuz",
  "Test va tahlil",
  "Nazorat ishi",
  "Suhbat va munozara",
];

/** Guruh jadvali qancha kun orqaga qarab to'ldiriladi (va bir hafta oldinga). */
const LESSON_PAST_DAYS = 28;
const LESSON_FUTURE_DAYS = 7;
const LESSON_DURATION_MIN = 90;
/**
 * Kun millisekundda. `demo-data` oxiridagi `DAY_IN_MS` dan **oldin** kerak
 * bo'ladi (modul yuklanishida TDZ xatosi bermasligi uchun alohida).
 */
const MS_PER_DAY = 86_400_000;

const groupRoster = (groupId: string) =>
  demoEnrollments.filter(
    (row) =>
      row.group_id === groupId && row.status !== "left" && row.status !== "completed",
  );

/**
 * Har bir faol guruh uchun jadval asosida darslar yaratiladi.
 *
 * Muhim: darslar **guruhgа** bog'lanadi, shuning uchun davomat ham dars
 * bo'yicha yuritiladi (ilgari har bir o'quvchiga bitta yozuv tushardi va bu
 * "bugungi darsga davomat olish" oqimini umuman imkonsiz qilardi).
 */
function buildLessons(): DemoLesson[] {
  const lessons: DemoLesson[] = [];
  let sequence = 0;

  for (const group of demoGroups) {
    if (group.status === "completed") continue;

    const schedule = group.schedule ?? [];
    if (schedule.length === 0) continue;

    const rosterCount = groupRoster(group.id).length;

    for (let offset = -LESSON_FUTURE_DAYS; offset <= LESSON_PAST_DAYS; offset += 1) {
      const day = new Date(now.getTime() - offset * MS_PER_DAY);
      const slot = schedule.find((item) => Number(item.day_of_week) === day.getDay());
      if (!slot) continue;

      const [hours, minutes] = normalizeTime(slot.start_time, "10:00").split(":").map(Number);
      const start = new Date(day);
      start.setHours(hours, minutes, 0, 0);
      const startsAt = start.toISOString();

      if (group.start_date && startsAt < String(group.start_date)) continue;
      if (group.end_date && startsAt > String(group.end_date)) continue;

      const duration = durationMinutes(slot.start_time, slot.end_time) || LESSON_DURATION_MIN;

      sequence += 1;
      const isPast = start.getTime() < now.getTime();
      lessons.push({
        id: `lesson-${String(sequence).padStart(5, "0")}`,
        tenant_id: TENANT_ID,
        group_id: group.id,
        room_id: group.room_id ?? null,
        room_name: String(group.room_name ?? "—"),
        title: LESSON_TOPICS[sequence % LESSON_TOPICS.length],
        starts_at: startsAt,
        ends_at: new Date(start.getTime() + duration * 60_000).toISOString(),
        status: isPast ? "held" : "scheduled",
        group_name: String(group.name),
        teacher_name: String(group.teacher_name ?? "—"),
        students_count: rosterCount,
        created_at: startsAt,
        updated_at: startsAt,
      });
    }
  }

  /*
   * Har bir guruhning **eng oxirgi o'tgan darsi** "belgilanmagan" holatda
   * qoldiriladi — shunda "Davomat" sahifasida darhol belgilash mumkin bo'ladi.
   */
  const latestPast = new Map<string, DemoLesson>();
  for (const lesson of lessons) {
    if (lesson.status !== "held") continue;
    const current = latestPast.get(lesson.group_id);
    if (!current || lesson.starts_at > current.starts_at) {
      latestPast.set(lesson.group_id, lesson);
    }
  }
  for (const lesson of latestPast.values()) lesson.status = "scheduled";

  return lessons;
}

export const demoLessons: DemoLesson[] = buildLessons();

const ATTENDANCE_CYCLE = [
  "PRESENT",
  "PRESENT",
  "PRESENT",
  "PRESENT",
  "LATE",
  "ABSENT",
  "EXCUSED",
];

/**
 * Davomat yozuvlari — faqat o'tilgan (`held`) darslar uchun. Bugungi/kelgusi
 * darslar bo'sh qoladi va o'qituvchi tomonidan to'ldiriladi.
 */
export const demoAttendance: DemoAttendanceRow[] = (() => {
  const rows: DemoAttendanceRow[] = [];
  const students = demoStudents;
  let sequence = 0;

  for (const lesson of demoLessons) {
    if (lesson.status === "scheduled") continue;

    groupRoster(lesson.group_id).forEach((enrollment, rosterIndex) => {
      sequence += 1;
      const student = students.find((item) => item.id === enrollment.student_id);
      rows.push({
        id: `attendance-${String(sequence).padStart(5, "0")}`,
        tenant_id: TENANT_ID,
        lesson_id: lesson.id,
        enrollment_id: enrollment.id,
        student_id: enrollment.student_id,
        status: ATTENDANCE_CYCLE[(sequence + rosterIndex * 3) % ATTENDANCE_CYCLE.length],
        marked_by: demoUser.id,
        note: null,
        student_name: student ? `${student.first_name} ${student.last_name}` : "O'quvchi",
        group_name: lesson.group_name,
        lesson_date: lesson.starts_at,
        created_at: lesson.starts_at,
        updated_at: lesson.starts_at,
      });
    });
  }

  return rows;
})();

/* -------------------------------------------------------------------------- */
/*  Sozlamalar — markaz profili va dam olish kunlari taqvimi                    */
/* -------------------------------------------------------------------------- */

/**
 * Markaz (tenant) o'z profili — `GET/PATCH /settings/center/`.
 * Yagona yozuv: filiallar, xonalar va boshqa kataloglar alohida bo'limlarda.
 */
export const demoCenterSettings = {
  id: TENANT_ID,
  tenant_id: TENANT_ID,
  name: "Yolup Learning Center",
  legal_name: 'MChJ "Yolup Learning"',
  phone: "+998 71 200 10 10",
  email: "info@yolup.uz",
  address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 12",
  work_hours_from: "08:00",
  work_hours_to: "21:00",
  language: "uz",
  currency: "UZS",
  updated_at: iso(2),
};

/**
 * Dam olish kunlari — `[nomi, boshlanish, tugash, filial indeksi, izoh]`.
 * Filial indeksi `-1` bo'lsa — butun markaz uchun.
 */
const DAYS_OFF_ROWS: Array<[string, string, string, number, string]> = [
  ["Yangi yil bayrami", "2026-01-01", "2026-01-02", -1, "Dam olish kuni"],
  ["Xotin-qizlar kuni", "2026-03-08", "2026-03-08", -1, ""],
  ["Navro'z bayrami", "2026-03-21", "2026-03-23", -1, "Uch kunlik bayram"],
  ["Xotira va qadrlash kuni", "2026-05-09", "2026-05-09", -1, ""],
  ["Mustaqillik kuni", "2026-09-01", "2026-09-01", -1, ""],
  ["O'qituvchi va murabbiylar kuni", "2026-10-01", "2026-10-01", -1, "Bayram tadbiri"],
  [
    "Sanitariya kuni",
    "2026-11-05",
    "2026-11-06",
    1,
    "Faqat shu filialda tozalash ishlari",
  ],
  ["Konstitutsiya kuni", "2026-12-08", "2026-12-08", -1, ""],
];

export const demoDaysOff = DAYS_OFF_ROWS.map(([name, from, to, branchIndex, note], index) => ({
  id: `day-off-${String(index + 1).padStart(4, "0")}`,
  tenant_id: TENANT_ID,
  name,
  date_from: from,
  date_to: to,
  branch_id: branchIndex === -1 ? null : demoBranches[branchIndex].id,
  note: note.length > 0 ? note : null,
  created_at: iso(90 - index * 5),
  updated_at: iso(index),
}));

/* -------------------------------------------------------------------------- */
/*  Moliya — to'lov turlari, hisob-fakturalar, qarzlar                         */
/* -------------------------------------------------------------------------- */

const DAY_IN_MS = 86_400_000;

/**
 * To'lov turlari — kassa katalogi (`/finance/payment-methods/`).
 *
 * `kind` — buxgalteriya guruhi; kassa hisobotlari shu bo'yicha yig'iladi:
 * `cash` naqd, `card` plastik, `online` onlayn to'lov, `transfer` bank.
 */
const PAYMENT_METHOD_ROWS: Array<[string, string, string, number]> = [
  ["cash", "Naqd pul", "cash", 1],
  ["card", "Plastik karta", "card", 2],
  ["click", "Click", "online", 3],
  ["payme", "Payme", "online", 4],
  ["uzum", "Uzum Bank", "online", 5],
  ["transfer", "Bank o'tkazmasi", "transfer", 6],
];

export const demoPaymentMethods = PAYMENT_METHOD_ROWS.map(
  ([code, name, kind, sortOrder], index) => ({
    id: `payment-method-${String(index + 1).padStart(4, "0")}`,
    tenant_id: TENANT_ID,
    code,
    name,
    kind,
    sort_order: sortOrder,
    is_active: true,
    created_at: iso(200 - index * 4),
    updated_at: iso(index),
  }),
);

/**
 * Billing davrlari — joriy oydan orqaga qarab 6 oy (`YYYY-MM`, eskisidan boshi).
 * Hisob-fakturalar shu davrlar uchun oldindan yaratilgan.
 */
const BILLING_PERIODS: string[] = Array.from({ length: 6 }, (_, index) => {
  const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}).reverse();

/** Ba'zi o'quvchilarga qo'yilgan chegirma (foiz) — billing'da aks etadi. */
const CHARGE_DISCOUNT_PERCENT: Record<string, number> = {
  "student-0007": 15,
  "student-0010": 10,
};

/** Bitta hisob-faktura yozuvi (demo fixture ko'rinishi). */
interface DemoCharge {
  id: string;
  tenant_id: string;
  branch_id: string;
  student_id: string;
  group_id: string;
  period: string;
  amount_tiyin: number;
  discount_tiyin: number;
  due_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hisob-fakturalar (billing) — har bir o'quvchi uchun oylik to'lov.
 *
 * O'quvchining guruhi narxi asos qilib olinadi; chegirma bo'lsa `discount_tiyin`
 * ga yoziladi. Muddati — davrning 5-kuni.
 */
export const demoCharges: DemoCharge[] = (() => {
  const rows: DemoCharge[] = [];
  let sequence = 0;

  for (const student of demoStudents) {
    if (!isBillable(student.status)) continue;

    const group = demoGroups.find((item) => item.name === student.group_name);
    if (!group) continue;

    const discountPercent = CHARGE_DISCOUNT_PERCENT[student.id] ?? 0;

    BILLING_PERIODS.forEach((period, periodIndex) => {
      sequence += 1;
      // Joriy oyning muddati hali kelmagan (25-kun) — shunda "qarz" va
      // "muddati o'tgan" ko'rsatkichlari farq qiladi.
      const isCurrent = periodIndex === BILLING_PERIODS.length - 1;
      rows.push({
        id: `charge-${String(sequence).padStart(5, "0")}`,
        tenant_id: TENANT_ID,
        branch_id: group.branch_id,
        student_id: student.id,
        group_id: group.id,
        period,
        amount_tiyin: group.price_tiyin,
        discount_tiyin: Math.round((group.price_tiyin * discountPercent) / 100),
        due_date: `${period}-${isCurrent ? "25" : "05"}`,
        created_by: demoUser.id,
        created_at: `${period}-01T06:00:00.000Z`,
        updated_at: `${period}-01T06:00:00.000Z`,
      });
    });
  }

  return rows;
})();

/**
 * To'lovlar hisob-fakturalarga eng eskisidan boshlab (FIFO) taqsimlanadi.
 * Shu tarzda har bir hisob-fakturaning `paid_tiyin` qiymati haqiqiy
 * to'lovlardan hosil bo'ladi va qarzlar ro'yxati bilan mos tushadi.
 */
export const demoChargesWithPayments = demoCharges.map((charge) => ({
  ...charge,
  paid_tiyin: 0,
}));

for (const student of demoStudents) {
  let pool = demoPayments
    .filter((payment) => payment.student_id === student.id)
    .reduce((sum, payment) => sum + payment.amount_tiyin, 0);

  if (pool <= 0) continue;

  const own = demoChargesWithPayments
    .filter((charge) => charge.student_id === student.id)
    .sort((a, b) => a.period.localeCompare(b.period));

  for (const charge of own) {
    if (pool <= 0) break;
    const total = charge.amount_tiyin - charge.discount_tiyin;
    const applied = Math.min(pool, total);
    charge.paid_tiyin = applied;
    pool -= applied;
  }
}

/**
 * O'quvchi balansi hisob-faktura va to'lovlardan **qayta hisoblanadi**:
 * musbat qiymat — avans, manfiy — qarz (`demoStudents` dagi boshlang'ich
 * qiymat shu yerda ustidan yoziladi). Natijada O'quvchilar sahifasi va Moliya
 * bo'limidagi qarzlar bitta manbadan oziqlanadi.
 */
for (const student of demoStudents) {
  const own = demoChargesWithPayments.filter(
    (charge) => charge.student_id === student.id,
  );
  const charged = own.reduce(
    (sum, charge) => sum + charge.amount_tiyin - charge.discount_tiyin,
    0,
  );
  const paid = own.reduce((sum, charge) => sum + charge.paid_tiyin, 0);
  student.balance_tiyin = paid - charged;
}

/** Billing davrining tugash sanasi — `status` va kechikish shundan kelib chiqadi. */
export { BILLING_PERIODS, DAY_IN_MS };

/* -------------------------------------------------------------------------- */
/*  Demo kirish hisoblari (rollarni sinash uchun)                              */
/* -------------------------------------------------------------------------- */

const STUDENT_USER_ID = "user-student-0001";
const PARENT_USER_ID = "user-parent-0001";

/**
 * O'quvchi kabineti uchun foydalanuvchi.
 *
 * `student_id` — kabinet qaysi o'quvchi ma'lumotlarini ko'rsatishini
 * belgilaydi. Haqiqiy backend'da bu bog'lanish `user.student` orqali keladi;
 * mock'da esa demo o'quvchiga to'g'ridan-to'g'ri ishora qilinadi.
 */
export const demoStudentUser = {
  id: STUDENT_USER_ID,
  tenant_id: TENANT_ID,
  branch_id: BRANCH_ID,
  role: "student" as const,
  first_name: demoStudents[0].first_name,
  last_name: demoStudents[0].last_name,
  middle_name: null,
  phone: demoStudents[0].phone,
  email: "student@yolup.uz",
  avatar_url: null,
  is_active: true,
  is_email_verified: true,
  is_phone_verified: true,
  last_login_at: iso(0),
  created_at: iso(60),
  updated_at: iso(0),
  permissions: [],
  student_id: demoStudents[0].id,
};

/** Ota-ona kabineti uchun foydalanuvchi — farzandlari ro'yxati bilan. */
export const demoParentUser = {
  id: PARENT_USER_ID,
  tenant_id: TENANT_ID,
  branch_id: BRANCH_ID,
  role: "parent" as const,
  first_name: "Gulnora",
  last_name: demoStudents[0].last_name,
  middle_name: null,
  phone: "+998 90 111 22 33",
  email: "parent@yolup.uz",
  avatar_url: null,
  is_active: true,
  is_email_verified: true,
  is_phone_verified: true,
  last_login_at: iso(0),
  created_at: iso(60),
  updated_at: iso(0),
  permissions: [],
  linked_student_ids: [demoStudents[0].id, demoStudents[1].id],
};

/**
 * Demo kirish hisoblari — login sahifasida tugma sifatida ko'rsatiladi.
 *
 * Mock parolni tekshirmaydi (`demo123` — shartli), lekin **identifikatorga
 * qarab rolni aniqlaydi**: shu sabab bilan o'qituvchi/o'quvchi kabinetlarini
 * sinash mumkin. Token ichida foydalanuvchi ID'si yoziladi, shuning uchun
 * sahifa yangilanganda ham sessiya to'g'ri tiklanadi.
 */
export const demoAuthAccounts = [
  { identifier: "admin", label: "Direktor", role: "ceo" as const, userId: demoUser.id },
  {
    identifier: "nodira.ahmedova",
    label: "Administrator",
    role: "admin" as const,
    userId: "user-0001",
  },
  {
    identifier: "dilnoza.yusupova",
    label: "O'qituvchi",
    role: "teacher" as const,
    userId: "user-0006",
  },
  { identifier: "student", label: "O'quvchi", role: "student" as const, userId: STUDENT_USER_ID },
  { identifier: "parent", label: "Ota-ona", role: "parent" as const, userId: PARENT_USER_ID },
];

/** Identifikator (email yoki login) bo'yicha demo foydalanuvchini topadi. */
export function resolveDemoUser(identifier: string): Record<string, any> | null {
  const value = identifier.trim().toLowerCase();
  if (!value) return null;

  /* Avval hisoblar ro'yxatidan (alias yoki email). */
  const account = demoAuthAccounts.find(
    (item) =>
      item.identifier === value ||
      item.identifier === value.split("@")[0] ||
      (item.role === "ceo" && (value === "ceo" || value === "admin@yolup.uz")),
  );
  if (account) {
    if (account.userId === demoUser.id) return demoUser;
    if (account.userId === STUDENT_USER_ID) return demoStudentUser;
    if (account.userId === PARENT_USER_ID) return demoParentUser;
    const staff = demoUsers.find((user) => user.id === account.userId);
    if (staff) return { ...staff, permissions: [] };
  }

  /* Xodimning emaili bo'yicha ham topiladi (masalan `sardor.bekmurodov@yolup.uz`). */
  const local = value.split("@")[0];
  const staff = demoUsers.find(
    (user) => `${user.first_name}.${user.last_name}`.toLowerCase() === local,
  );
  if (staff) return { ...staff, permissions: [] };

  /* Noma'lum login — demo rejimida CEO sifatida kiradi (orqaga moslik). */
  return demoUser;
}
