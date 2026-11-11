# SOFF CRM — To'liq Funksionallik Tahlili va Sahifalar Ro'yxati

> **Hujjat turi:** Texnik audit + funksiya xaritasi  
> **Tahlil qilingan kod:** `soffcrm/web/crm-front/*` (Next.js 15, Pages Router, React 18, MUI 5, CASL)  
> **Muallif roli:** Senior Software Engineer  
> **Sana:** 2026-10-16  
> **Eslatma:** Backend (Django) kodi repoda yo'q. Barcha xulosalar frontend kodi, navigation konfiguratsiyasi va API chaqiruvlaridan chiqaran.

---

## 1. Texnik Stack (Xuddi qanday qurilgan)

| Qatlam | Texnologiya | Izoh |
|---|---|---|
| Framework | Next.js 15 (Pages Router) | SSR amalda yo'q, faqat client-side |
| React | React 18 | |
| UI Kutubxonasi | MUI 5 (Material UI) | `sx` prop orqali ko'p inline stil |
| State Management | Zustand (UI store'lar), TanStack Query (server state) | |
| Forma Validatsiyasi | Formik (120+ fayl) va React Hook Form (4 fayl) | Ikki xil forma kutubxonasi |
| Ruxsatlar (ACL) | CASL (`can/manage/all`) | Barcha asosiy rollarga `manage all` beriladi |
| HTTP Klient | Axios | 421 ta hardcode URL string |
| Diagramma | 3 ta chart kutubxonasi (ApexCharts, Recharts, va boshqalar) | Bitta bo'lishi kerak |
| Sana | date-fns / dayjs | Ikki xil sana kutubxonasi |
| i18n | react-i18next | `uz` asosiy til, lekin 629 ta kalit yo'q |
| Icon | Iconify (3 ta ikona to'plami) | |
| Test | Vitest + Jest (~2.4% coverage) | Pul oqimlari uchun E2E test yo'q |

---

## 2. Barcha Sahifalar (Routes) va Uchunga Nima Bor

Sahifalar quyidagi guruhlarga bo'linadi. Har bir sahifada nima funksionallik borligi batafsil ko'rsatilgan.

### 2.1. Auth va Tizim Sahifalari

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/login` | Kirish sahifasi | Login forma, majburiy parol almashtirish |
| `/` (index) | Redirect | Avtomatik login yoki dashboard'ga yo'naltirish |
| `/change-password` | Parolni o'zgartirish | Eski/yangi parol tekshiruvi |
| `/401` | Ruxsat yo'qlik sahifasi | Aks etkazilganda ko'rsatiladi |
| `/404` | Topilmadi sahifasi | URL noto'g'ri bo'lganida |
| `/500` | Server xatosi | Kutilmagan backend xatosi |

### 2.2. Dashboard (Bosh Sahifa)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/dashboard` | Asosiy dashboard | 12 ta KPI, bugungi darslar jadvali, pul xulosasi, tugmalar |

### 2.3. Lids (Mijozlar / Savdo Pipeline)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/lids` | Lidlar Kanban sahifasi | Drag-drop kanban, ustunlar, bulk guruhga qo'shish, ustunga SMS, Excel eksport, 7 ta modal, 10 ta amal |
| `/lids/stats` | Lid manbalari statistikasi | Manbalar + soni, CASL o'rniga hardcode rol tekshiruvi |
| `/lids/leads-table-view` | Lidlar jadval ko'rinishi | O'lik kod, lekin `pages/` ichida turgani uchun ochiq |
| `/lids/view-toggle` | Ko'rinishni o'zgartirish | O'lik route |
| `/lids/group-recruiting` | Guruh yig'ish (recruiting) | Kutish ro'yxati → aktivlashtirish → haqiqiy guruh + o'quvchilarga aylanadi. Menyuda 3 joyda kommentga olingan |
| `/lids/group-recruiting/[id]` | Guruh yig'ish tafsilati | Bitta murojaat/group uchun tafsilot |

**Lid modeli:**
- Majburiy maydonlar: `department`, `source`, `first_name`, `phone`
- Ixtiyoriy: `extra_phones[]`, `birth_date`, `age`, `teacher`, `lesson_time`, `lesson_day_type` (toq/juft/custom), `status`, `temperature`, `body`
- Statuslar: `new`, `connected`, `not_connected`, `test_period`, `enrolled`, `rejected`
- Muammo: "bosqich" tushunchasi 3 ta — bo'lim (dropdown) → ustun (kanban column) → `status`. Bular bir-biridan mustaqil.

### 2.4. Guruhlar (Academic Groups)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/groups` | Guruhlar ro'yxati | Ro'yxat, yaratish (xona/o'qituvchi to'qnashuvi tekshiruvi bilan), drawer 1 395 qator |
| `/groups/view/[tab]` | Guruh sahifasi | ~9 tab + ~8 amal: davomat, baho, izohlar, imtihon, chegirma, ball, tarix. Desktop (1 193 qator) va mobil (870 qator) alohida. 2 ta Excel eksportchi |

**Group modeli:**
- Maydonlar: kurs, o'qituvchi(lar), xona, filial, sanalar, vaqt, `day_of_week[]`, narx, rang, baholash sxemasi
- Bir nechta o'qituvchi: `main` / `assistant` / `co_teacher`, har birida o'z ish haqi turi
- Kunlik jadval (`day_schedules[]`): har kun uchun alohida vaqt va xona
- Statuslar: `new` → `trial` → `active` → `frozen` → `archive`

### 2.5. O'quvchilar (Students)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/students` | O'quvchilar ro'yxati | Ro'yxat, 12.9k qator, nisbatan modulli |
| `/students/view/[tab]` | O'quvchi profil tarkibi | Guruhlar, ota-onalar, izohlar, to'lovlar |

**O'quvchi modeli:**
- A'zolik hayot sikli: `new`(sinov) → `active` ⇄ `frozen` (sabab majburiy) → `left` (sabab katalogi) → `graduated` (natija: ielts/cefr/university/work)
- Transfer (oldindan ko'rish bilan), qayta tiklash, balansni a'zoliklar o'rtasida ko'chirish

### 2.6. O'quvchi Profili (Student Profile)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/student-profile` | O'quvchi profil sahifasi | Asosiy profil ma'lumotlari |
| `/student-profile/tests` | O'quvchi testlari | Onlayn testlar (Soffia — tashqi servis) |
| `/student-profile/tests/take/[id]` | Testni yechish | Test o'tish interfeysi |
| `/student-profile/exams` | O'quvchi imtihonlari | Guruh imtihonlari + umumiy/mock imtihonlar |
| `/student-profile/group/detail` | Guruh tafsilati | O'quvchi a'zo bo'lgan guruhlar |

### 2.7. O'quvchi Portal (Student Portal)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/student/materials` | Darsliklar | Kurs materiallari |
| `/student/materials/[id]` | Darslik tafsilati | Bitta darslik ochilishi |
| `/student/courses` | Kurslar | O'quvchi uchun kurslar |
| `/student/courses/[id]` | Kurs tafsilati | Kurs ichki ma'lumotlari |
| `/student-payments` | O'quvchi to'lovlari | To'lov tarixi |
| `/student-points` | O'quvchi ballari | Eski student-points (coin bilan nusxalanadi, BLOAT) |

### 2.8. O'qituvchi (Teacher / Mentor)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/mentors` | O'qituvchilar ro'yxati | Xodimlar ro'yxati |
| `/mentors/[id]` | O'qituvchi profili | Bitta o'qituvchi tafsiloti |
| `/teacher-tasks` | Uy vazifalari (tasks) | Vazifalar ro'yxati |
| `/teacher-tasks/[id]` | Vazifa tafsilati | Bitta vazifa ochilishi |
| `/teacher-tasks/[id]/[student_id]` | Vazifa o'quvchi bo'yicha | O'quvchi uchun vazifa |
| `/teacher/profile` | O'qituvchi profili | 3 ta bir-birini takrorlaydigan implementatsiya |
| `/teacher/profile/tests` | O'qituvchi testlari | Test yaratish |
| `/teacher/profile/tests/create` | Test yaratish forma | Yangi imtihon/test yaratish |
| `/teacher/profile/tests/edit/[id]` | Testni tahrirlash | Imtihon tahrirlash |
| `/teacher/profile/board` | Whiteboard | Excalidraw, faqat localStorage'da saqlanadi, BLOAT |
| `/teacher/board` | O'qituvchi bosh sahifasi | Dublikat implementatsiya |
| `/teacher/exams` | Imtihonlar | Uch xil joy, deyarli bir xil 1 000 qatorli formalar |

### 2.9. Support Teacher (Support O'quvchi)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/support-students` | Support o'quvchilar | Faqat SUPPORT roli uchun o'quvchilar |
| `/support-students/[id]` | Support o'quvchi tafsilati | Bitta o'quvchi |
| `/support-groups` | Support guruhlar | Faqat SUPPORT roli uchun guruhlar |
| `/support-meetings` | Uchrashuvlar | `meetings.tsx` 3 804 qator, `fix_meetings.py` skripti bilan tuzatilgan |
| `/support-lesson` | Support dars | Darslar ro'yxati |
| `/support-exams` | Support imtihonlar | Orphan sahifa |

### 2.10. Moliya (Finance)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/finance` | Moliya dashboard | P&L, to'lov turi bo'yicha, xarajatlar |
| `/finance/salary` | Ish haqi | O'qituvchi bo'yicha: `percentage` / `fixed` / `per_lesson` / `per_student` |
| `/finance/salary-detail/[slug]` | Ish haqi tafsilati | Xodim/detail sahifasi |
| `/finance/salary-confirm` | Ish haqi tasdiqlashi | Klientda `final_salary` hisoblab PATCH qiladi, o'lik kod, BLOAT |
| `/finance/costs` | Xarajatlar | Xarajat kiritish |
| `/finance/costs/[slug]` | Xarajat tafsilati | Bitta xarajat ochilishi |
| `/finance/bonus` | Bonus | Bir xil shakldagi 3 ta alohida model |
| `/finance/penalty` | Jarima | Bir xil shakldagi 3 ta alohida model |
| `/finance/advance` | Avans | Bir xil shakldagi 3 ta alohida model |
| `/finance/investment` | Investitsiya | Oddiy jurnal, MVP'da kerak emas |
| `/finance/marketing` | Marketing xarajatlari | Manbaga bog'lanmagan → CAC/ROI hisoblab bo'lmaydi |
| `/crm-payments` | To'lov qabul qilish | `GlobalPaymentModal`, 682 qator, oylarga taqsimlash klientda `dayjs()` bilan |
| `/crm-check-settings` | Chek sozlamalari | 865 qator, 17 ta toggle |

**Billing rejimlari:**
- `by_coming_date` — har oy boshida yechiladi
- `by_added_at` — qo'shilgan kundan boshlab har oy
- `by_lesson_price` — har bir dars uchun
- `payment_split`, `first_payment_from_group_start` flaglari

**Qarz (Debt):**
- Har kuni backend cron yechadi
- `student.balance` umumiy balans, guruh bo'yicha qarz alohida endpoint — ikki xil haqiqat manbai

### 2.11. Hisobotlar (Reports)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/reports/payment` | To'lov hisoboti | Kassir jurnali (barcha to'lovlar ro'yxati) |
| `/reports/student-payment` | O'quvchi to'lovlari | Talaba bo'yicha to'lovlar |
| `/reports/left-student-reports` | Ketgan o'quvchilar | 4.6k qator, 5 marta kichikroq qilib qayta yozilishi kerak |
| `/reports/graduates-reports` | Bitiruvchilar hisoboti | 5.5k qator |
| `/reports/graduates` | Bitiruvchilar | Faqat "bitirdi + natija" statusi |
| `/reports/employee-attendance-reports` | Xodim davomati | Bitta komponent 2 909 qator, eng katta fayl |
| `/reports/employee-attendance` | Xodim davomati | O'lik, menyuda yo'q |
| `/reports/attendances` | Davomat hisoboti | Davomat statistikasi |
| `/reports/coins` | Coin hisoboti | Gamifikatsiya hisoboti |
| `/reports/coins/[id]` | Coin tafsilati | Bitta coin ochilishi |
| `/reports/lid-statements` | Lid hisobotlari | Voronka, manbalar, sotuvchilar reytingi |
| `/reports/students-reports` | O'quvchi hisoboti | O'quvchi statistikasi |
| `/reports/statistics` | Markaz statistikasi | Umumiy KPI'lar |

### 2.12. Imtihonlar (Exams)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/exams` | Imtihonlar ro'yxati | Bitta Exam modeli kerak, lekin 3 ta joy |
| `/exams/view/[id]` | Imtihon tafsilati | Bitta imtihon ochilishi |

### 2.13. Sozlamalar (Settings)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/settings` | Asosiy sozlamalar | Bitta sahifa bo'lishi kerak, lekin 4 xil joyga sochilgan |
| `/settings/sms` | SMS sozlamalari | SMS shablonlari + qo'lda yuborish |
| `/settings/roles` | Rollar | **3 ta** implementatsiya, ~12k qator |
| `/settings/forms` | Formalar | Ommaviy forma builder |
| `/settings/forms/[id]` | Forma tahrirlash | Bitta forma ochilishi |
| `/settings/forms/create` | Forma yaratish | Yangi forma |
| `/settings/forms/create/view` | Forma preview | Forma ko'rinishi |
| `/settings/office/courses` | Kurslar | Kurs + syllabus (mavzular, resurslar) |
| `/settings/office/rooms` | Xonalar | Toza, CORE |
| `/settings/office/free-days` | Dam olish kunleri | Umumiy + guruh |
| `/settings/office/schools` | Maktablar katalogi | 🟡 |
| `/settings/office/coins` | Coin sozlamalari | Gamifikatsiya |
| `/settings/office/archive` | Arxiv | Mock data / bo'sh stub |
| `/settings/office/lefted-students` | Ketganlar | Stub |
| `/settings/ceo/all-settings` | Barcha sozlamalar (CEO) | |
| `/settings/ceo/users` | Xodimlar (CEO) | |
| `/settings/ceo/users/view/[tab]` | Xodim tafsilati | |
| `/settings/ceo/sms-settings` | SMS sozlamalari (CEO) | |
| `/settings/ceo/roles` | Rollar (CEO) | Faqat CEO role uchun |
| `/settings/ceo/grading-schema-create` | Baholash sxemasi | CEFR, DTM, IELTS, 1–5, ABCF, 100 ball |
| `/settings/ceo/billing` | Billing sozlamalari | `<div>Billing</div>`, BLOAT |
| `/settings/logs/sms-history` | SMS tarixi | Yuborilgan SMS logi |
| `/settings/logs/payment-history` | To'lov tarixi | |
| `/settings/logs/logins` | Kirishlar logi | |
| `/settings/logs/bot-notification` | Bot bildirishnomalar | |
| `/settings/integrations/click-integration` | Click to'lov integ. | Faqat Click |
| `/settings/integrations/amocrm` | amoCRM integ. | Parallel CRM rejimi, `?is_amocrm` |
| `/settings/face-id` | Face ID | Bitta fayl 1 554 qator, ADD-ON |
| `/settings/my-zvonki-employees` | Moi Zvonki | Telefoniyaga bog'langan xodimlar |

### 2.14. C-panel (SOFF Ichki Operator Paneli)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/c-panel` | C-panel dashboard | SOFF ichki panel |
| `/c-panel/settings` | C-panel sozlamalari | |
| `/c-panel/payments` | To'lovlar (c-panel) | TO'lovlarni tasdiqlash |
| `/c-panel/sms-payments` | SMS to'lovlar | |
| `/c-panel/notifications` | Bildirishnomalar | |
| `/c-panel/notifications/create` | Bildirishnoma yaratish | |
| `/c-panel/leads-analytics` | Lid analitika | |
| `/c-panel/ai-expenses` | AI xarajatlari | |
| `/c-panel/ai-chat-history` | AI chat tarixi | |
| `/c-panel/customer-success/churn` | Churn taxta | |
| `/c-panel/customer-success/new-customers` | Yangi mijozlar | |
| `/c-panel/customer-success/reactivation` | Qaytgan mijozlar | |
| `/c-panel/customer-success/month-check` | Oylik tekshiruv | |
| `/c-panel/customer-success/winback` | Winback | |
| `/c-panel/feedbacks` | Fikr-munozaratlar | |
| `/c-panel/feature-announcements` | Feature announcements | |
| `/c-panel/company/create` | Tenant yaratish | |
| `/c-panel/company/create-user` | Tenant xodimi yaratish | |
| `/c-panel/company/[slug]` | Tenant tafsilati | |
| `/c-panel/company/[slug]/edit` | Tenant tahrirlash | |

### 2.15. C-panel-leads (SOFF O'z Savdo CRM'i)

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/c-panel-leads` | C-panel lidlar | 7.2k qator, BLOAT, ichki savdo CRM |
| `/c-panel-leads/[id]` | Lid tafsilati | |
| `/c-panel-leads/notifications` | Bildirishnomalar | |

### 2.16. Boshqa Sahifalar

| Route | Nima qiladi | Funksionallik |
|---|---|---|
| `/calls` | Qo'ng'iroqlar | Kirishlar logi |
| `/notifications` | Bildirishnomalar | 2 ta dropdown + manager |
| `/moderation` | Moderatsiya | Admin amallarini tasdiqlash |
| `/storage` | Fayl ombori | 2 070 qator, ADD-ON |
| `/soff-ai-chatbot` | AI chat | SSE stream, kodi yaxshi |
| `/soffBotIcon` | Bot ikonka | |
| `/employee-attendance` | Xodim davomati | O'lik, menyuda yo'q |
| `/employee-attendance/view/[date]` | Davomat kun bo'yicha | |
| `/video-tutorials` | Video darsliklar | Kichik |
| `/forms/r/[token]` | Ommaviy forma | Lid formasi token orqali |
| `/local-feedbacks` | Local feedback | Har sahifada feedback, BLOAT |
| `/role-automation` | Rol avtomatizatsiyasi | ~10.4k qator, BLOAT |
| `/mentor-sellers` | Mentor sotuvchilar | O'qituvchi ish haqi |

### 2.17. API Endpoints (Frontendda)

| Route | Nima qiladi |
|---|---|
| `/api/log-error` | Xatolarni loglash |
| `/api/health` | Sog'lik tekshiruvi |
| `/api/csp-report` | CSP xatolari |

---

## 3. Rolalar va Ruxsatlar (ACL)

Fayl: `src/app-layer/config/acl.ts`

### 3.1. Rol ro'yxati
```
ADMIN, CEO, TEACHER, SUPPORT, STUDENT, CASHER, MARKETOLOG, BOSHQA, WATCHER
```

### 3.2. Ruxsat lojikasi
- Agar foydalanuvchi `coreRoles` ro'yxatida bo'lsa (ADMIN, CEO, TEACHER, SUPPORT, STUDENT, CASHER, MARKETOLOG, BOSHQA) — u `"manage all"` oladi (hammasiga ruxsat).
- Aks holda — faqat `read` ruxsati beriladi, permissions ro'yxatidan keyinchalik.
- **Muammo:** Har bir asosiy rolla frontendda `manage all` berilgan. Cheklov faqat menyuni yashirish orqali qilinadi. Bu xavfsiz emas.

### 3.3. Menyu bo'lishi rollarga qarab

| Rol | Menyu |
|---|---|
| **CEO** | To'liq menyu (7 bo'lim + barcha sozlamalar) |
| **Admin** | To'liq menyu (subject: `all`) |
| **Casher** | Faqat `/finance` |
| **Watcher** | Hammasi read-only (settings yo'q) |
| **Marketolog** | Lidlar, lead hisobotlari, sozlamalar (forms, amocrm, faceid) |
| **Teacher** | Dashboard, teacher-tasks, exams, tests, board, mentor-sellers |
| **Support** | Dashboard, support-students, support-groups, support-meetings |
| **Student** | Profil, to'lovlar, ballar, materiallar, kurslar, support-lesson |

### 3.4. Navigation (Menyu) fayli
`src/navigation/vertical/index.ts` — TeacherNavigation, SupportNavigation, StudentNavigation, CPanelNavigation va umumiy Navigation.

---

## 4. Funksionallik Bo'yicha Tafsilotlar (Domen Bo'yicha)

### 4.1. Lidlar / Savdo / Marketing

| Funksiya | Holat | Muammolar |
|---|---|---|
| Lidlar Kanban | Drag-drop, ustunlar, bulk guruhga qo'shish, SMS, Excel | `leads-kanban.tsx` 1 138 qator, har bir ustun uchun alohida so'rov |
| Lid kartasi (modal) | Ma'lumot, izohlar, SMS tarihi, lid tarixi, qo'ng'iroqlar | `leads-dragon-modal.tsx` 1 171 qator, bir xil mutate 6 marta nusxalangan |
| Lid yaratish/tahrirlash | Forma, dublikat telefon tekshiruvi, sabab katalogi | `skip_error=true` bilan dublikat baribir saqlanadi |
| Jadval ko'rinishi | O'lik kod | Buzuq route sifatida ochiq |
| Lid manbalari | Manbalar + soni | CASL o'rniga hardcode rol |
| Guruh yig'ish | Kutish ro'yxati → aktivlashtirish | Menyuda 3 joyda kommentga olingan, toq/juft hafta bugi |
| Ommaviy formalar | Savollar, dizayn, pixel → lid | 2 avlod yonma-yon, 3 xil update endpoint |
| Telefoniya (Moi Zvonki) | Click-to-call, yozuvlar | Rus provayderi |
| amoCRM integ. | Parallel CRM rejimi | Har bir komponent `is_amocrm` bo'yicha shoxlanadi |
| Marketing xarajatlari | Alohida model | Manbaga bog'lanmagan |
| Marketplace | Coin evaziga o'quvchi do'koni | Savdo emas, gamifikatsiya |

### 4.2. O'quv Jarayoni (Academic Core)

| Funksiya | Holat | Muammolar |
|---|---|---|
| Guruhlar ro'yxati + yaratish | Drawer 1 395 qator | Onboarding logikasi aralashgan |
| Guruh sahifasi | ~9 tab + ~8 amal | Desktop/mobil alohida yozilgan |
| A'zolik hayot sikli | Toza va testlangan | CORE |
| Davomat jadvali | Bulk "hammasi keldi" yo'q | `late` alohida boolean |
| Kunlik baholar | Qayta yozilgan | IMPORTANT |
| Baholash sxemalari | Default sxemalar frontenddan backendga | IMPORTANT |
| O'quvchilar ro'yxati + profil | 12.9k qator | Nisbatan modulli |
| Guruh imtihonlari | Uch xil joy, 1 000 qatorli formalar | Bitta model kerak |
| Onlayn testlar (Soffia) | Tashqi servis | ADD-ON |
| Kurs + syllabus | — | Kurs CORE, mavzular IMPORTANT |
| Xonalar | Toza | CORE |
| Dam olish kunleri | — | Billing va davomatga ta'sir qiladi |
| O'qituvchi bosh sahifasi | 3 ta dublikat | Bitta kerak |
| Uy vazifalari | Inline logika | IMPORTANT |
| Whiteboard (Excalidraw) | Faqat localStorage | BLOAT |
| Support teacher | ~5k qator | ADD-ON |
| Coin (yangi) | Toza | ADD-ON |
| Student points (eski) | Coin bilan nusxalanadi | BLOAT |
| Bitiruvchilar dashboardi | 5.5k qator | ADD-ON (core'da faqat status) |
| Ketgan o'quvchilar hisoboti | 4.6k qator | IMPORTANT |

### 4.3. Moliya

| Funksiya | Holat | Muammolar |
|---|---|---|
| To'lov qabul qilish | `GlobalPaymentModal` 682 qator | Oylarga taqsimlash klientda |
| Balans / qarz | 2 ta haqiqat manbai | Eskiqar balans ko'rinishi |
| Billing rejimlari | Markaz o'zi sozlay olmaydi | CORE |
| Shaxsiy chegirma | Foiz klientda hisoblanadi | CORE |
| Qaytarish / balans o'tkazish | Backend asl summa bilan solishtirmaydi | IMPORTANT |
| To'lov turlari | Naqd/karta/click | CORE |
| Xarajatlar | Copy-paste kod | CORE |
| Moliya dashboardi | P&L | CORE |
| Ish haqi | ~3.6k qator UI | fixed + foiz |
| Bonus / Jarima / Avans | 3 ta bir xil sahifa | Bitta entity kerak |
| `salary-confirm.tsx` | Klientda `final_salary` PATCH | BLOAT |
| Kassir jurnali | Barcha to'lovlar | CORE |
| Chek sozlamalari | 865 qator, 17 toggle | ~5 ta sozlama kerak |
| Click integ. | Faqat Click, Payme ko'rinadi lekin Click'ga ketadi | Ota-ona uchun muhim |
| To'lovlar audit logi | Yo'q | Firibgarlikka qarshi kerak |
| CEO moderatsiyasi | Javob shakliga qarab | Admin firibgarligi |
| Obuna to'lov | 5 ta bir xil modal, `max:100` bug | Bitta sahifa kerak |
| Obuna bloki | `localStorage` — clientda chetlab o'tsa bo'ladi | Backendda majburiy |
| `settings/ceo/billing.tsx` | `<div>Billing</div>` | BLOAT |

**Eski tizimda yo'q, lekin kerak:** Kassa smenasi (ochish/yopish, kassir qoldig'i).

### 4.4. Kommunikatsiya

| Funksiya | Holat |
|---|---|
| SMS shablonlari + qo'lda yuborish | CORE |
| Avto-SMS triggerlari | CORE (15 placeholder) |
| Yuborilgan SMS logi | IMPORTANT |
| Telegram | Faqat xodim bog'lash (ota-ona boti kerak) |
| In-app bildirishnomalar | 2 ta dropdown + manager |
| Kirishlar logi | ADD-ON |

### 4.5. Platforma, Rollar, Admin

| Funksiya | Holat |
|---|---|
| Login + majburiy parol almashtirish | Yaxshi yozilgan, testlangan |
| Rollar | 10+ rol, lekin frontendda `manage all` |
| Rol boshqaruvi UI | 3 ta implementatsiya, ~12k qator |
| Filiallar | `localStorage` dan o'qiladi, `window.location.reload()` |
| Multi-tenancy | Subdomen = tenant, 5+ joyda aniqlash |
| Dashboard | 12 KPI, dars jadvali, pul xulosasi |
| Xonalar bandligi (FIK) | 1 810 qator |
| Xodimlar | CORE |
| Face ID | 1 554 qator, ADD-ON |
| Xodim davomati | 2 909 qator, ADD-ON |
| Soffia AI chat | SSE stream, kodi yaxshi |
| Storage | 2 070 qator, ADD-ON |
| Video darsliklar | Kichik |

### 4.6. Onboarding / Engagement

| Funksiya | Holat |
|---|---|
| Yangi onboarding | Checklist + spotlight, 3 890 qator |
| Eski 15 modalli wizard | BLOAT |
| Joyride | BLOAT |
| CrmSurvey + feedback | Har sahifada, BLOAT |
| Global overlay'lar | 25+ doim yuklangan |

### 4.7. SOFF Ichki Operator Paneli (c-panel)

| Funksiya | Holat |
|---|---|
| Tenant CRUD, tariflar, to'lovlar tasdiqlashi | Ichki uchun CORE |
| c-panel-leads | 7.2k qator, BLOAT |
| Customer success doskalari | Churn, winback… |
| AI xarajatlari | ADD-ON |

### 4.8. Mobil Ilovalar

| Ilova | Stek | Holat |
|---|---|---|
| O'quvchi | React Native CLI 0.78 | Eng toza tuzilma, ParentQRModal (ota-ona ilovasi yo'q) |
| CEO | Expo 54 | Web admin mobil nusxasi, `test.*` domenlar |
| Support teacher | Expo 54 | Faqat SUPPORT roli, `fix_meetings.py` |

---

## 5. Qayta Yazilmaydigan Narsalar (BLOAT Ro'yxati)

Taxminan **40–50 ming qator** kod Quyidagilar YolUp'ga o'tkazilmaydi:

- `role-automation` (~10.4k qator)
- Dublikat `settings/roles`, `views/apps/permissions`
- amoCRM "parallel board" rejimi
- Eski formalar (`application-form`), `FormsUpdateModal`
- Lid table-view / view-toggle (o'lik route'lar)
- Whiteboard (Excalidraw, localStorage)
- Eski `student-points` (coin bilan almashtiriladi)
- `salary-confirm.tsx`, `settings/ceo/billing.tsx`, `settings/index.tsx` stublari
- `settings/office/archive`, `lefted-students` stublari
- `support-exams`, orphan `/employee-attendance`, `soffBotIcon`
- 3 ta o'qituvchi bosh sahifasidan 2 tasi
- Eski 15 modalli wizard, Joyride, CrmSurvey
- Vuexy template qoldiqlari
- Dublikat gorizontal navigatsiya
- `c-panel-leads` (tenant bundle ichidan)
- Investitsiya moduli
- Mobil: `fix_meetings.py`, `.tmp` fayllar, mock data, `test.*` domenlar

---

## 6. Eski Tizimning Asosiy Kasalliklari (YolUp'da takrorlanmaslik kerak)

### 6.1. Mahsulot / UX

| Kasallik | Misol | Qoida |
|---|---|---|
| Bir funksiya — ko'p joy | 3 xil imtihon joyi, 4 xil SMS oynasi | Bitta joyda yashaydi |
| Bir xil tushunchaga ko'p nom | `new`/"trial"/"not_activated" | Yagona lug'at |
| Sozlamalar sochilgan | Sidebar + tablar + dropdown | Bitta Sozlamalar sahifasi |
| Modal ichida modal | 7 modal, 10 amal | Drawer + inline tahrirlash |
| Toq/juft hafta "magic" | Bugungi kunga bog'liq | Aniq hafta kunlari tanlovi |
| Muhim funksiya yashirin | Guruh yig'ish menyuda yo'q | Ko'rinadigan va bog'langan |
| Desktop va mobil alohida | 1 193 + 870 qator | Bitta kod (responsive) |

### 6.2. Biznes Logika

- Pul hisob-kitobi klientda (oylarga taqsimlash, ish haqi tasdiqlashi, chegirma)
- Obuna bloki `localStorage` da
- Ikki xil balans manbai
- Decimal yo'qoladi (`AmountInput`)
- "so'm" hardcode qilingan
- Muhim sozlamalarni faqat SOFF o'rnatadi
- Backend javob shakli barqaror emas

### 6.3. Texnik

| Muammo | Raqam |
|---|---|
| Bir vazifa uchun ko'p kutubxona | UI: MUI + Bootstrap + rsuite + Tailwind Play CDN |
| Chart: 3 ta, ikona: 3 ta, forma: 2 ta | |
| Arxitektura | FSD "migratsiya"si faqat papka nomi o'zgartirildi |
| API chaqiruvlari | 421 ta hardcode URL, 2 ta endpoint fayli |
| Lint | Qoidalar o'chirilgan, build'da tekshirilmaydi |
| SSR | Amalda yo'q |
| Monitoring | Sentry yo'q, xatolar Telegram'ga |
| Hujjatlar | `CLAUDE.md` eskirgan |

### 6.4. Xavfsizlik (Zudlik bilan qilish kerak)

1. `session_forwarder.session` git'da — jonli Telegram sessiyasi
2. `TELEGRAM_BOT_TOKEN` git tarixida
3. `docs/soffcrm_pentest_report_v1.0.docx` repoda
4. `images.remotePatterns: *`
5. `ReactQueryDevtools` production'da
6. Obuna bloki va pul taqsimoti klientda
7. Mobil `test.*` hostlari
8. Deploy `root` orqali

---

## 7. Tavsiya etilgan Yangi Arxitektura (YolUp)

### 7.1. Core + Add-on ajratish

**CORE (doim yoqiladi):** Lidlar, o'quvchilar, guruhlar, davomat, baholar, to'lovlar, xarajatlar, ish haqi, xabarlar, dashboard, xodimlar, rollar, filiallar.

**ADD-ON (alohida yoqiladi):** Coins + Marketplace, onlayn testlar, mock imtihonlar, support teacher, Face ID, telefoniya, AI, storage, integratsiyalar.

### 7.2. Moliya modeli (eng muhim)

- Pul = butun son (tiyin), `bigint`
- Ledger jurnali, balans hisoblanadi (saqlanmaydi)
- Charge generatsiyasi faqat backendda
- To'lov taqsimoti backendda (FIFO)
- Kassa smenasi
- `ApprovalRequest` → CEO tasdiqlaydi

### 7.3. Texnik arxitektura

- Bitta monorepo (`pnpm + Turborepo`)
- Contract-first: OpenAPI → generatsiya
- Multi-tenancy: bitta schema + `tenant_id` + RLS
- Auth: httpOnly cookie (web), SecureStore (mobil)
- `no-explicit-any: error`, fayl ≤300 qator, komponent ≤150 qator
- Testlar: Vitest + MSW + Playwright E2E (10 ta pul yo'li)

---

## 8. Xulosa

SOFF CRM’da **~146 ta route**, **~237 000 qator kod**, **~2 762 ta `any`**, **395 xil rang**, **4 ta styling tizimi**, **3 ta chart kutubxonasi**, **2 ta forma kutubxonasi**, **3 ta i18n** bor. Funksionallik ko’p lekin “mukammal” emas. Pul logikasi klientda hisoblanadi, ruxsatlar amalda ishlamaydi, texnik qadr katta.

YolUp uchun asosiy qarar: **eski kodni ko‘chirmay, noldan yozamiz**; faqat domen bilimi olinadi. Core + Add-on arxitekturasi, pul = faqat backend, ota-ona — birinchi darajali foydalanuvchi, bitta monorepo va bitta dizayn tizimi.
