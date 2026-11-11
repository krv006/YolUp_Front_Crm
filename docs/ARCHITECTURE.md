# YolUp CRM — Frontend Architecture & Rules

**Stack:** React 19 · TypeScript (strict) · Vite · TanStack Router · TanStack Query · Zustand · Tailwind v3 + CSS tokenlar · Radix primitives · react-hook-form + Zod · axios (mock adapter).
**Ilova ildizi:** `crm/` · **Alias:** `@/*` → `src/*` · **Dizayn manbasi:** Open Design prototipi (`tokens.css` / `app.css`) — UI prototipga 1:1 mos bo'lishi kerak.

> **Muhim:** hozircha backend yo'q. Butun ilova **mock API** ustida ishlaydi (`VITE_USE_MOCK_API=true`). Mock — bu kelajakdagi shartnoma: har bir mock endpoint = `docs/BACKEND_API_SPEC.md` dagi bitta qator. Mutatsiyalar sessiya davomida saqlanadi, sahifa yangilanganda demo holatiga qaytadi.

---

## 1. Qatlamlar (kim nimaga javobgar)

```
Route (TanStack Router)
      │
      ▼
┌─────────────── PAGE ───────────────┐   src/pages/<route>/index.tsx
│  ekran: layout + holat + kompozitsiya│   (faqat yig'adi, biznes-logika yozmaydi)
└───────┬───────────────────┬─────────┘
        │                   │
        ▼                   ▼
   WIDGET                 MODULE                 src/widgets/ · src/modules/<domen>/
   (shell bloklari)       (domen: api+model+ui)   o'z PUBLIC API'si: index.ts
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────── CORE ───────────────┐   src/core/
│ auth · permission · navigation ·   │   kesimlararo (cross-cutting) mantiq
│ status · providers                 │
└───────────────┬────────────────────┘
                ▼
┌────────────── SHARED ──────────────┐   src/shared/
│ ui primitives · api client + mock ·│   hech kimga bog'liq emas, hamma shundan
│ lib · model · config · constants   │   foydalanadi
└────────────────────────────────────┘
```

**Bog'lanish yo'nalishi bir tomonlama:** `pages → widgets/modules → core → shared`.
Teskari import **taqiqlanadi** (shared hech qachon module/page'ni import qilmaydi).

| Qatlam | Vazifasi (role) | Misol |
| --- | --- | --- |
| `app/` | Bootstrap: router, layoutlar, auth qobig'i | `app/router/index.ts`, `app/layouts/DashboardLayout.tsx` |
| `pages/` | Marshrut ekrani: sarlavha, filtr holati, sheet/modal ochish, modul komponentlarini yig'ish | `pages/courses/index.tsx` |
| `widgets/` | Bir nechta sahifada ishlatiladigan yirik bloklar | `app-header/TopBar`, `app-sidebar/Sidebar`, `app-tabs/TabStrip`, `command-palette`, `kpi-card`, `quick-actions` |
| `modules/` | **Domen birligi**: tip + validatsiya + API + UI komponentlar | `modules/courses/**` |
| `core/` | Kesimlararo mantiq: autentifikatsiya, ruxsatlar, navigatsiya, statuslar, provayderlar | `core/permission`, `core/status` |
| `shared/` | Qayta ishlatiladigan asos: UI primitivlar, HTTP klient, yordamchilar, global store'lar, mock | `shared/ui/*`, `shared/api/*`, `shared/lib/*` |

---

## 2. Papka tuzilishi

```
src/
├── main.tsx                 # React root (providers + router)
├── index.css                # DIZAYN TOKENLARI (yagona haqiqat manbasi) + Tailwind qatlamlari
│
├── app/
│   ├── index.tsx            # Auth qobig'i: token bor/yo'q → login yoki dashboard
│   ├── router/index.ts      # Barcha marshrutlar (createRoute) + route daraxti
│   └── layouts/             # AuthLayout, DashboardLayout (sidebar + topbar + tabstrip)
│
├── pages/<route>/index.tsx  # Har bir marshrut uchun bitta papka, default export
│                             # (masalan pages/cabinet/ — rol bo'yicha: o'qituvchi/o'quvchi/ota-ona)
│
├── widgets/<blok>/          # TopBar, Sidebar, TabStrip, CommandPalette, KpiCard, QuickActionSheets
│
├── modules/<domen>/         # 20+ domen moduli (quyida anatomiya)
│   ├── api/                 # <domen>-api.ts (HTTP) + <domen>-queries.ts (TanStack Query)
│   ├── model/               # types.ts (API shakli) + schemas.ts (Zod + payload konverter) + labels.ts
│   ├── ui/                  # form / table / card / detail / panel komponentlari
│   └── index.ts             # PUBLIC API — faqat shu yerdan import qilinadi
│
├── core/
│   ├── auth/                # api + model (auth-store, schemas, types) + ui (login-form)
│   ├── permission/          # model (permissions jadvali) + lib (can, usePermission) + ui (PermissionGate)
│   ├── navigation/          # model (nav-items: NavLink | NavGroup, PAGE_LABELS)
│   ├── status/              # model (status-types) + ui (StatusBadge)
│   ├── providers/           # QueryClient, Theme, Toast, Router
│   └── index.ts
│
└── shared/
    ├── api/                 # axios.ts (instance + interceptor), http.ts, endpoints.ts, types.ts, mock/
    ├── ui/                  # 27 ta primitiv (button, card, sheet, modal, data-table, list-toolbar, …)
    ├── lib/                 # cn, format, payload, lookup, toast, storage, token-storage, use-debounced-value
    ├── model/               # useListState (ro'yxat holati), shell.store, theme.store
    ├── config/              # env.ts (Zod bilan tekshiriladi), routes.ts
    ├── constants/           # STORAGE_KEYS va boshqalar
    └── types/
```

---

## 3. `core` — kesimlararo mantiq

### 3.1 `core/auth`
- `model/auth-store.ts` — Zustand: `user`, `setTokens`, `signOut` (`user` — `/auth/me/` dan).
- `api/auth-queries.ts` — `useLogin`, `useSession` (`/auth/me/`).
- `model/schemas.ts` — login formasi uchun Zod.
- `ui/login-form.tsx` — `#identifier`, `#password`, `Kirish` + **demo hisob chiplari** (mock rejimida rol shu yerdan tanlanadi: Direktor / Administrator / O'qituvchi / O'quvchi / Ota-ona).
- `User` — `student_id` (o'quvchi kabineti), `linked_student_ids` (ota-ona kabineti) maydonlari shu rolda to'ldiriladi.
- **Qoida:** komponentda token bilan ishlanmaydi — faqat store + `shared/lib/token-storage.ts`.

### 3.2 `core/permission` — rollar
- Rollar: **`ceo`, `admin`, `teacher`, `parent`, `student`** (`USER_ROLES`, `ROLE_LABELS`).
- `model/permissions.ts` — `ROLE_PERMISSIONS: Record<UserRole, Permission[]>`; ruxsat formati `resource.action` (`students.create`, `rooms.view`, `schools.view`, `lead-stages.delete`, …).
- `lib/can.ts` — `can(role, permission)`, `hasRole(role, allowed)`; `lib/use-permission.ts` — hook.
- `ui/permission-gate.tsx` — shartli render.
- **Qoida:** komponentda rolni to'g'ridan-to'g'ri taqqoslash **taqiqlanadi** (`role === "admin"` yozilmaydi) — hamma tekshiruv `can()` / `usePermission()` orqali. UI faqat **yashiradi**; haqiqiy nazorat backendda. Yangi endpoint qo'shilsa — ruxsat nomi ham shu jadvalga qo'shiladi, sidebar/menyu `permission` maydoni bilan filtrlanadi.
- **Marshrut darajasidagi qo'riqchi** (`app/index.tsx`): havolani yashirish yetarli emas — manzil qo'lda kiritilishi mumkin. `teacher` faqat `/cabinet`, `/groups`, `/students`, `/attendance` ga; `student`/`parent` faqat `/cabinet` ga kiritiladi, qolgan manzillar `replace` bilan kabinetga qaytariladi. Mock ham yozish so'rovlarida `assertManager()` bilan `403` qaytaradi.

### 3.3 `core/navigation`
- `model/nav-items.ts` — `NAV_ITEMS: (NavLink | NavGroup)[]`, `PAGE_LABELS` (tabstrip nomlari), `filterNavItems`, `isNavGroup`, `navItemKey`.
- **`NavGroup` — faqat guruhlovchi**, hech qachon havola emas: butun qator (label + chevron) bitta `<button>`, o'zi `href` bermaydi (masalan **Markaz**, **Sozlamalar**).
- Yo'nalishlar shu fayldan sidebar, tabstrip va komanda paneli tomonidan ishlatiladi.

### 3.4 `core/status`
- `model/status-types.ts` — `GROUP_STATUS`, `ATTENDANCE_STATUS`, `PAYROLL_STATE`, `LEAD_STATUS`, `PAYMENT_METHOD`, … (label + tone).
- `ui/status-badge.tsx` — `StatusBadge` (dot + label; noma'lum kalit uchun `label`/`tone` override).
- **Qoida:** status hech qachon faqat rang bilan berilmaydi — matn har doim bo'ladi.

### 3.5 `core/providers`
`AppProvider` — hamma narsani o'raydi: `QueryClientProvider` (`staleTime` 2 daq, `gcTime` 10 daq, `retry` 1, `refetchOnWindowFocus: false`), `ReactQueryDevtools` (`VITE_ENABLE_QUERY_DEVTOOLS=false` bilan o'chiriladi), `sonner` `Toaster` (mavzuga moslashadi). Router va theme qobig'i `app/` da ulanadi.

---

## 4. `shared` — asos

### 4.1 `shared/api` — API klienti va mock
- `axios.ts` — instance + interceptor: `X-Tenant-Id`, `X-Branch-Id`, `Authorization` avtomatik qo'shiladi; **mock adapter shu yerda ulanadi**.
- `http.ts` — `http.get/post/put/patch/delete/list/blob/upload` va `cleanParams` (bo'sh/`null`/`"all"` qiymatlarni olib tashlaydi).
- `endpoints.ts` — **yagona URL manbasi**: har bir resurs `{ root, byId(id) }` ko'rinishida (ba'zilarida amal manzillari: `convert`, `enroll`, `close`). URL hech qachon komponentda yozilmaydi; hujjatda yo'q manzil qo'shilmaydi.
- `mock/mock-adapter.ts` — DRF'ga o'xshash mock: `paginate` (JSON bo'yicha `search` + **aniq mos kelish** filtri + `ordering`), GET/POST/PUT/PATCH/DELETE, `:id/:action/` amallari, `nextId`, `defaultsFor(resource)`, `respond`/`rejectWith`/`parseBody`.
- `mock/demo-data.ts` — demo ma'lumotlar, **ataylab qo'yilgan chekka holatlar** (nofaol yozuv, mas'ul shaxsi yo'q, qarzdor o'quvchi, bo'sh guruh, bog'lanmagan lid, …).
- **Mock DB resurslari:** `tenants, branches, rooms, students, groups, courses, users, parents, leads, schools, lead-sources, lead-stages, lead-loss-reasons, attendance, payroll, finance/payments, finance/expenses, finance/expense-categories, messaging/templates, messaging/logs, group-teachers, enrollments, lessons, finance/charges, finance/payment-methods`. Bo'sh (UI 404 bermasligi uchun): `finance/ledger`.
- **Rol simulyatsiyasi:** mock `POST /auth/login/` parolni tekshirmaydi, lekin **identifikator bo'yicha rolni** aniqlaydi (`admin`, `nodira.ahmedova`, `dilnoza.yusupova`, `student`, `parent`); foydalanuvchi ID'si token ichida (`demo-access-token:<userId>`) saqlanadi, shu sabab `/auth/me/` sahifa yangilangandan keyin ham to'g'ri rolni qaytaradi.
- **Ko'rish doirasi (mock):** `scopedForRole()` — `teacher` roli uchun `groups`, `lessons`, `students` va `attendance` faqat o'qituvchining guruhlariga cheklanadi (backend queryset filtri bilan bir xil xatti-harakat).
- **Inline (read-only) maydonlar:** mock DRF serializatorini taqlid qiladi — `withLeadRelations`, `withChargeView`, `withLessonView`, `handleEnrollmentRelations` (guruh/o'qituvchi nomi katalogdan olinadi, nusxa saqlanmaydi).

### 4.2 `shared/ui` — primitivlar
`button · card · sheet · modal(ConfirmModal) · input · textarea · select · switch(+field) · form-field · label · chip · avatar · tabs · data-table · pagination · progress · search-input · list-toolbar · stat-card · page-header · empty-state · skeleton · kbd · dropdown-menu`
- **Qoida:** sahifalar o'z HTML tugmalarini yasamaydi — primitivlar ishlatiladi. Yangi variant kerak bo'lsa, primitivga **opt-in** prop qo'shiladi (`size="sm"` kabi) — boshqa sahifalar o'zgarmasin.

### 4.3 `shared/lib` va `shared/model`
- `format.ts` — `formatMoney` (**tiyinda kiriladi**, so'mda chiqadi), `formatNumber`, `formatDate`, `formatDateTime`, `formatMonth`, `formatCompact`.
- `schedule.ts` — haftalik jadval yordamchilari: `WEEKDAY_OPTIONS` (0=Yak … 6=Shan), `normalizeTime`, `durationMinutes`, `scheduleLabel` (`"Du · Chor · Jum · 18:00–19:30"`), `parseScheduleLabel`, `scheduleSummary`. Guruh formasi, detal sahifasi va davomat shu bitta manbadan foydalanadi.
- `payload.ts` — `somToTiyin`, `tiyinToSom`, `cleanParams`.
- `toast.ts` (`toastSuccess`/`toastError`/`toastInfo`), `storage.ts`, `token-storage.ts`, `lookup.ts`, `cn.ts`, `use-debounced-value.ts`.
- `shared/model/use-list-state.ts` — **har bir ro'yxat sahifasining yagona holati**: `search`, `filters`, `page`, `pageSize`, `sort`, `params`, `resetFilters`, `activeFilterCount`, `setFilter`, `toggleSort`.
- `shell.store.ts` / `theme.store.ts` — Zustand + `persist`.

---

## 5. Modul anatomiyasi (yangi domen qo'shish)

```
modules/courses/
├── model/types.ts       # API shakli (server qaytaradigan yozuv) + ListParams
├── model/labels.ts      # enum → o'qiladigan nom (filtr/forma variantlari)
├── model/schemas.ts     # Zod sxema (forma qiymatlari) + payload konverter
├── api/course-api.ts    # list/create/get/update/remove → ENDPOINTS.courses
├── api/course-queries.ts# courseKeys + useCourseList/Detail/Create/Update/Delete
├── ui/course-form.tsx   # react-hook-form + zodResolver
├── ui/course-table.tsx  # DataTable ustunlari + EmptyState
└── index.ts             # PUBLIC API (faqat kerakli eksportlar)
```

**Sahifa (page) qolipi — barcha ro'yxat ekranlari bir xil:**

```
PageHeader → StatCard (size="sm") × 2-4 → ListToolbar → Card + <X>Table → Pagination
           → Sheet (yaratish/tahrirlash + tafsilot) → ConfirmModal (o'chirish)
```

Murakkab domenlarda qo'shimcha: alohida detal marshruti (`/groups/$groupId`), ichki panellar (`GroupTeachersPanel`), kartochka ko'rinishi (`LeadCard` / kanban).

---

## 6. Qoidalar (rules)

### Kod va importlar
1. **Modulga faqat `index.ts` orqali murojaat qilinadi** — `@/modules/courses`, `@/modules/courses/api/...` emas. Modullar bir-birini **chuqur import qilmaydi**; sahifa ikkalasini yig'adi.
2. Bitta vazifa — bitta kutubxona: sana → `date-fns`, ikona → `lucide-react`, diagramma → `recharts`, validatsiya → `zod`, forma → `react-hook-form`.
3. Server holati — **TanStack Query** (`useXList/Detail/Create/Update/Delete` + `invalidateQueries`), UI holati — Zustand yoki `useState`. Redux yo'q.
4. Fayl ≤ ~300 qator, komponent ≤ ~150 qator. Katta ekran bo'laklarga ajratiladi.
5. `tsc --noEmit` **toza** bo'lishi shart (`noUnusedLocals`/`noUnusedParameters` yoqilgan). `npm run build` = `tsc && vite build`.
6. `any` ishlatilmaydi. ESLint'da repoda eski ogohlantirishlar bor, lekin **yangi fayl yangi ogohlantirish qo'shmaydi** (mavjud naqshga mos yoziladi). `npm test` Vitest orqali mavjud; test qamrovi alohida baholanishi kerak.

### Ma'lumot (API) qoidalari
7. **Pul har doim tiyinda** (`price_tiyin`, `balance_tiyin`). Formada so'm, konversiya — `somToTiyin`/`tiyinToSom` bilan `schemas.ts` dagi `...Payload()` ichida.
8. Ro'yxat so'rovi `useListState().params` bilan yuboriladi: `search`, `page`, `page_size`, `ordering`, filtrlar **aniq mos kelish** sifatida (`branch_id`, `is_active`, `status`, `school_id`).
9. Tozalangan maydonlar API'ga `null` yuboriladi (PATCH'da `undefined` eski qiymatni o'chirmaydi).
10. Xato holatlari: `ApiError` (`status`, `message`, `fieldErrors`) `toastError` bilan ko'rsatiladi. Maydon darajasidagi server xatosi umumiy matnga aylanadi — shuning uchun **unique/band qiymat formada oldindan tekshiriladi** (masalan kurs `code`, maktab `name`).
11. **Bog'lanish yaxlitligi UI'da ham, API'da ham:** agar yozuvga bog'liq yozuvlar bo'lsa (kurs → guruhlar, maktab → lidlar, kanban ustuni → lidlar, guruh → a'zolar), o'chirish bloklanadi (disabled + izoh) va backend ham rad etishi kerak (`400/409`).
12. **Statistika butun markaz bo'yicha**, jadval ostidagi son esa **filtrlangan natija** uchun. Demo ma'lumotda har bir holat uchun namuna bo'lsin (bo'sh, nofaol, bog'langan, qarzdor).
13. **Ko'rinma (serializer) join:** bog'liq yozuv nomi (`school_name`, `source_name`, `teacher_name`, `group_name`) ro'yxatda **inline** keladi va mock'da o'qishda hisoblanadi (saqlanmaydi) — shunda nom o'zgarsa eski nusxa qolmaydi.

### UI/UX qoidalari
14. **Faqat tokenlar**: rang/bo'shliq/shadow `index.css` dagi `--var` va Tailwind sinflari bilan. Hex kod, inline `style` yo'q (dinamik rang bundan mustasno). Dark mode alohida tekshiriladi.
15. Ro'yxat sahifasidagi filtr satri — faqat **`ListToolbar`**; statistikalar — **`StatCard size="sm"`**; jadval — **`DataTable`**; yaratish/tahrirlash — **`Sheet`**; o'chirish — **`ConfirmModal`**; bo'sh holat — **`EmptyState`** (+ "Filtrlarni tozalash").
16. Yaratish/tahrirlash **bir sheet**da: `key={editing?.id ?? "new"}` bilan forma qayta quriladi.
17. Loading — skeleton, xato — toast, natija yo'q — tushunarli matn. Interaktiv elementlarda `aria-label`.
18. Qator bosiladigan jadvalda ichki tugmalar `event.stopPropagation()` bilan to'xtatiladi (aks holda qator amali ham ishga tushadi).
19. `sr-only` faqat `relative` ota-element ichida ishlatiladi (aks holda gorizontal scroll paydo bo'ladi).
20. Tailwind rang modifikatorlari (`bg-action/[0.16]`) ishlamaydi — ranglar `var(--x)` sifatida e'lon qilingan. Opacity kerak bo'lsa alohida token ochiladi.
21. Mobil: `<768px` drawer, `768–1023px` 72px rail, `≥1024px` 264px sidebar (yig'ilganda 72px). `--topbar-h: 60px`, `--tabstrip-h: 42px`.

### Javobgarlik va jarayon
22. Sidebar/menyudagi har bir band `permission` bilan bog'lanadi; C-Panel — faqat super-admin va hozircha hech qayerni bog'lamaydi (yo'nalishlar qoladi, layout keyin qayta ishlanadi).
23. **Yangi funksiya avval plan → tasdiq → keyin kod.** Mock o'zgarsa, u `docs/BACKEND_API_SPEC.md` uchun "API-delta" sifatida qayd etiladi (yangi endpoint, yangi maydon, nullable/o'zgarish).
24. Naming: `shared/ui` va modul fayllari `kebab-case` (`data-table.tsx`, `student-form.tsx`), alohida komponent fayllari `PascalCase` (`TopBar.tsx`, `DashboardLayout.tsx`), React komponenti `PascalCase`, hook `useX`, store `x.store.ts`, API `x-api.ts`, query `x-queries.ts`, tiplar `types.ts`, sxema `schemas.ts`.

---

## 7. Qabul qilingan domen qarorlari

Bu qoidalar eski CRM tahlilidan chiqarilgan va **yangi tizimda majburiy**:

| # | Qaror |
| --- | --- |
| 1 | **Kurs narxi — oylik narx** (`price_tiyin` = 1 oy uchun standart narx). "Kursning umumiy narxi" ishlatilmaydi. 1 dars narxi davomiylik va darslar sonidan hisoblanadi. |
| 2 | **Guruh o'qituvchilari** — alohida resurs (`/groups/{id}/teachers/`): rol `main` \| `assistant` \| `co_teacher` + `pay_rule` (`fixed`/`per_lesson`/`per_student` → tiyin, `percentage` → bazis punkti ×100). Guruhda **bitta `main`** bo'ladi; yangisini belgilash eskisini avtomatik tushiradi. Guruh formasida o'qituvchi tanlanmaydi — tayinlash guruh sahifasida. |
| 3 | **O'quvchi bir nechta guruhda bo'lishi mumkin.** Guruh `students_count` faol a'zoliklar asosida hisoblanadi. |
| 4 | **A'zolikni o'chirishdan oldin status** (`left`, tarix saqlanadi). `frozen`/`left` uchun **sabab majburiy** (saqlash sababsiz bloklanadi). |
| 5 | **Lid bosqichi — bitta tushuncha** (`stage`). Ustunlar sozlanadi (`/lead-stages/`), bosqich almashishi kanban drag'i va forma orqali. |
| 6 | **Lid ↔ Maktab:** `Lead.school_id` (ixtiyoriy), ro'yxatda `school_name` inline. Maktab lidlari bor bo'lsa o'chirilmaydi. |
| 7 | **Guruh yig'ish (recruiting)** — kelajakda birinchi darajali funksiya (kutish ro'yxati → haqiqiy guruh). Hozircha rejalashtirilgan. |
| 8 | **Pul faqat backendda** hisoblanadi (ledger). Frontend hech qachon balans/qarz hisoblamaydi. |
| 9 | **C-Panel** (super-admin) alohida sidebar va layout oladi — hozircha havola qilinmagan. |
| 10 | **Rolga mos qobiq:** `/` — rahbariyat paneli (`ceo`/`admin`), `/cabinet` — o'qituvchi/o'quvchi/ota-ona uchun shaxsiy kabinet. Rol `/auth/me/` dan keladi; `teacher` cheklovi backend tomonda (mock'da `scopedForRole`). |
| 11 | **3-chi tomon yo'q (MVP).** SMS/Telegram/Click-Payme/OAuth kabi tashqi bog'lanishlar UI'dan olib tashlangan — ichki vositalar yetarli. Kabinet, davomat, moliya to'liq ichkarida ishlaydi. |
| 12 | **Haftalik jadval — guruhning bir qismi.** `schedule: { day_of_week, start_time, end_time }[]` (JS `getDay()`), `schedule_label` undan hosil qilinadi. Faol guruhda kamida bitta slot; darslar shu slotlardan idempotent generatsiya qilinadi, jadval o'zgarsa belgilanmagan kelgusi darslar almashtiriladi, eng so'nggi o'tgan dars `held`/`scheduled` bo'lib qoladi. |
| 13 | **Sig'im va xona.** `capacity = 0` — cheklanmagan; a'zo qo'shishda `capacity > 0` bo'lsa bloklanadi (`Guruh to'lgan (N/M)`). `room_id` filialga tegishli bo'lishi shart, `left`/`completed` a'zolar sig'imga kirmaydi. |
| 14 | **Guruh yozuvi — faqat rahbariyat.** `ceo`/`admin` yaratadi/tahrirlaydi/o'chiradi va a'zo qo'shadi; `teacher` o'z guruhi va o'quvchilarini faqat o'qiydi; `student`/`parent` — faqat kabinet. Bu UI (tugmalar yashirin) + mock (`assertManager`) + router guard bilan uch qatlamda ta'minlanadi. |

---

## 8. Marshrutlar va ishga tushirish

**Marshrutlar:** `/login` · `/` (rahbariyat paneli) · `/cabinet` (o'qituvchi/o'quvchi/ota-ona kabineti) · `/tenants` · `/branches` · `/rooms` · `/courses` · `/students` · `/groups` (+ `/groups/$groupId`) · `/finance` (+ `/finance/payments`, `/charges`, `/debts`, `/expenses`) · `/payroll` · `/leads` · `/parents` · `/attendance` · `/reports` · `/schools` · `/days-off` · `/settings` (+ `/settings/center`, `/settings/roles`, `/settings/users`, `/settings/payment-methods`, `/settings/lead-stages`, `/settings/lead-sources`, `/settings/lead-loss-reasons`, `/settings/appearance`) — barchasi `app/router/index.ts` da (kod-asosidagi `createRoute`, generatsiya fayli yo'q).

```bash
npm install
npm run dev        # mock rejim: login sahifasidagi demo hisoblardan rol tanlanadi
npm run typecheck  # tsc --noEmit
npm run lint       # eslint . --ext ts,tsx --max-warnings 0
npm run build      # tsc && vite build
npm run format     # prettier
```

**Env (`shared/config/env.ts`, Zod bilan tekshiriladi):** `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_VERSION`, `VITE_USE_MOCK_API` (`false` → haqiqiy backend), `VITE_ENABLE_QUERY_DEVTOOLS`.

**Hujjatlar:** shu fayl (frontend arxitekturasi va qoidalar) · `docs/BACKEND_API_SPEC.md` (backend shartnomasi — mahsulot muzlatilgach yakunlanadi) · `docs/source-analysis/` (eski CRM tahlili, faqat ma'lumot uchun).
