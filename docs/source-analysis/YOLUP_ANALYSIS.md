# YolUp — Eski CRM (SOFF CRM) to'liq auditi va ideal CRM rejasi

> **Hujjat turi:** Texnik audit + Product strategiya
> **Sana:** 2026-10-13
> **Tahlil qilingan kod:** `soffcrm/web/*` (web CRM, lead forma, landing) va `soffcrm/apps/*` (3 ta mobil ilova)
> **Muallif roli:** Senior Software Engineer → Product Owner'ga hisobot
> **Eslatma:** Backend (Django) kodi repoda yo'q. Backend haqidagi xulosalar frontend yuborayotgan/qabul qilayotgan ma'lumotlardan va `docs/*.md` audit hujjatlaridan chiqarilgan.

---

## Mundarija

1. [Rahbariyat uchun qisqa xulosa](#1-rahbariyat-uchun-qisqa-xulosa)
2. [Eski ekotizim xaritasi va raqamlar](#2-eski-ekotizim-xaritasi-va-raqamlar)
3. [Funksiyalar auditi (domen bo'yicha)](#3-funksiyalar-auditi-domen-boyicha)
4. [Qayta yozilmaydigan narsalar (BLOAT ro'yxati)](#4-qayta-yozilmaydigan-narsalar-bloat-royxati)
5. [Eski tizimning asosiy kasalliklari](#5-eski-tizimning-asosiy-kasalliklari)
6. [Bozordagi bo'shliqlar — YolUp qayerda yutadi](#6-bozordagi-boshliqlar--yolup-qayerda-yutadi)
7. [YolUp mahsulot tamoyillari: Core va Add-on ajratish](#7-yolup-mahsulot-tamoyillari-core-va-add-on-ajratish)
8. [YolUp domen modeli](#8-yolup-domen-modeli)
9. [Axborot arxitekturasi: menyu, rollar, sozlamalar](#9-axborot-arxitekturasi-menyu-rollar-sozlamalar)
10. [Scope: MVP → v1.x → Add-on'lar](#10-scope-mvp--v1x--add-onlar)
11. [Texnik arxitektura (YolUp)](#11-texnik-arxitektura-yolup)
12. [Dizayn tizimi va UX tamoyillari](#12-dizayn-tizimi-va-ux-tamoyillari)
13. [Mobil strategiya](#13-mobil-strategiya)
14. [Roadmap (bosqichlar)](#14-roadmap-bosqichlar)
15. [Muvaffaqiyat metrikalari](#15-muvaffaqiyat-metrikalari)
16. [Risklar](#16-risklar)
17. [Eski loyihada ZUDLIK bilan qilinishi kerak bo'lgan xavfsizlik ishlari](#17-eski-loyihada-zudlik-bilan-qilinishi-kerak-bolgan-xavfsizlik-ishlari)

---

## 1. Rahbariyat uchun qisqa xulosa

**Eski tizim nima qiladi:** SOFF CRM o'quv markaz faoliyatining deyarli hammasini qamrab oladi: lidlar, guruhlar, o'quvchilar, davomat, imtihonlar, to'lovlar, xarajatlar, ish haqi, SMS, Face ID, AI chat, gamifikatsiya (coin), marketplace, support teacher, onlayn testlar va SaaS operator paneli. Funksionallik ko'p. Muammo — **sifat va fokus**.

**Asosiy tashxis — 5 ta gap:**

1. **Funksiya ko'p, lekin bitta ham "mukammal" emas.** 146 ta route, CEO menyusida 10 ta bo'lim va ~34 ta havola bor, sozlamalar 4 xil joyga sochilgan. Bir xil ish 2–3 marta yozilgan: 3 xil onboarding, 3 xil rol boshqaruvi, 2 xil coin tizimi, 3 xil imtihon joyi, 4 xil SMS oynasi.
2. **Pul logikasi xavfli.** To'lovni oylarga taqsimlash, obuna bloki va ish haqini tasdiqlash qisman frontendda hisoblanadi. Loyihaning o'z audit hujjati: *"Can this system handle real money? NO."* (`docs/STUDENT_DEBT_AUDIT.md`).
3. **Ruxsatlar amalda ishlamaydi.** Har bir asosiy rol (ADMIN, CEO, TEACHER…) frontendda `manage all` oladi. Cheklov faqat menyuni yashirish orqali qilinadi (`app-layer/config/acl.ts`).
4. **Texnik qarz juda katta.** 237 ming qator kod, ~2 760 ta `any`, 4 ta styling tizimi, 3 ta chart kutubxonasi, 395 xil rang, testlar ~2.4%. Mobil ilovalar 3 xil stekda yozilgan va API klientni 4–5 marta qaytadan yozgan.
5. **Eng katta bozor imkoniyati boy berilgan.** **Ota-ona ilovasi yo'q.** Landing sahifa "o'quvchi va ota-onalar uchun shaxsiy kabinet"ni sotadi, lekin bu qurilmagan. O'zbekistonda pulni ota-ona to'laydi.

**YolUp uchun asosiy qarorlar:**

| # | Qaror | Nega |
|---|---|---|
| 1 | **Eski kodni ko'chirmaymiz, noldan yozamiz.** Eski tizimdan faqat *domen bilimi* (biznes qoidalar, statuslar, edge-case'lar) olinadi | Migratsiya narxi yangi yozishdan qimmat; buni eski loyihaning o'zi isbotlagan (Redux → React Query migratsiyasi oylar oldi, 41k qator migratsiya hujjati yozildi) |
| 2 | **Core + Add-on arxitekturasi.** Asosiy funksiyalar doim yoqiq. Qo'shimchalar alohida modul bo'ladi: menyuda, sozlamada va kodda ajratilgan | Siz aytgan "asosiy va qo'shimcha funksiyalarni aralashtirmaslik" talabining texnik yechimi |
| 3 | **Pul = faqat backend.** Ledger (buxgalteriya jurnali) modeli, butun sonli tiyin, idempotent to'lovlar | Moliyaviy xatolar mijozni darhol yo'qotadi |
| 4 | **Ota-ona — birinchi darajali foydalanuvchi.** Telegram bot + mobil ilova, onlayn to'lov | Raqobatchilardan "birdan o'tib ketish" nuqtasi shu |
| 5 | **Bitta monorepo, bitta dizayn tizimi, bitta API kontrakt** (OpenAPI → generatsiya) — web va mobil uchun umumiy | Eski tizimdagi 5 xil API klient va 3 xil i18n muammosini ildizidan yo'q qiladi |
| 6 | **MVP menyusi ≤ 7 bo'lim, bitta Sozlamalar sahifasi** | UX — asosiy raqobat ustunligi |

---

## 2. Eski ekotizim xaritasi va raqamlar

### 2.1 Loyihalar

| Loyiha | Stek | Hajmi (TS/TSX qator) | Vazifasi |
|---|---|---|---|
| `web/crm-front` | Next.js 15 (Pages Router), React 18, MUI 5, React Query, CASL | **~237 000** (1 826 fayl, 146 route) | Asosiy CRM (barcha rollar + SOFF operator paneli) |
| `web/soffcrm-form` | Vite 5, React 18, MUI 6 | ~2 600 | Ommaviy lid formasi |
| `web/soffcrm-landing` | Next.js 14, Tailwind | ~6 000 | Marketing sayt, narxlar |
| `apps/soff-crm-student` | React Native CLI 0.78 | ~24 500 | O'quvchi ilovasi |
| `apps/SoffCRMCeoAPP` | Expo 54 | ~28–42 000 | Rahbar (CEO) ilovasi |
| `apps/support_teacher_soff_crm` | Expo 54 | ~27 500 | Faqat support teacher ilovasi (oddiy o'qituvchi uchun ilova **yo'q**) |
| Backend | Django REST, multi-tenant (subdomen = tenant) | — (repoda yo'q) | `*.soffhub.uz` / `*.api-soffcrm.uz` |

### 2.2 Web CRM — asosiy raqamlar

| Ko'rsatkich | Qiymat | Izoh |
|---|---|---|
| Kod hajmi | 236 762 qator | `src/features` — 155k qator (66%) |
| Route'lar | 146 | Bir qismi o'lik yoki stub |
| `any` ishlatilishi | ~2 762 | Type xavfsizligi yo'q |
| 1 000 qatordan katta fayllar | 16 | Eng kattasi — 2 909 qator (`employee-attendance-reports`) |
| Test fayllari | 44 (~2.4%) | Pul oqimlari uchun E2E test yo'q |
| Inline `sx` / `style` | 8 720 / 1 076 | Dizayn tizimi chetlab o'tilgan |
| Hex rang literallari | 3 241 (395 xil) | Token tizimi yo'q |
| Hardcode o'zbekcha matn | ~727 qator / 279 fayl | i18n to'liq emas |
| i18n: `uz` (asosiy til!) da yo'q kalitlar | 629 | ru — 315, en — 427, kaa — 730 |
| Ishlatilmaydigan dependency'lar | ~12 | `moment`, `@dnd-kit/*`, `react-big-calendar`… |
| Bundle (o'z auditidan) | ~1.6–2.1 MB gzip | Performance balli 34/100 |

### 2.3 Narx siyosati (landing'dan, UZS)

| Tarif | O'quvchi | 1 oy | 3 oy | 6 oy | 12 oy |
|---|---|---|---|---|---|
| Basic | 0–100 | 300k | 750k | 1.32M | 2.4M |
| Standard | 101–300 | 500k | 1.25M | 2.2M | 4.0M |
| Professional | 301–600 | 800k | 1.8M | 3.24M | 6.0M |
| Enterprise | 601–1000 | 1.0M | 2.4M | 4.5M | 8.5M |
| Premium | 1000+ | kelishuv | | | |

Qo'shimcha pulli paketlar: SMS, Face ID, Storage. To'lov **bank chekini yuklash** orqali, SOFF xodimi qo'lda tasdiqlaydi.

---

## 3. Funksiyalar auditi (domen bo'yicha)

**Verdikt shkalasi:**
- 🟢 **CORE** — MVP'da bo'lishi shart, usiz CRM sotilmaydi
- 🔵 **IMPORTANT** — v1.x (MVP'dan keyingi birinchi relizlar)
- 🟡 **ADD-ON** — keyinroq, alohida yoqiladigan modul (ko'pincha pulli)
- 🔴 **BLOAT** — qayta yozilmaydi

### 3.1 Lidlar / Savdo / Marketing

**Eski lid modeli:**
- **Majburiy maydonlar:** `department`, `source`, `first_name`, `phone`.
- **Ixtiyoriy maydonlar:** `extra_phones[]`, `birth_date`, `age`, `teacher`, `lesson_time`, `lesson_day_type` (toq/juft/custom), `status`, `temperature`, `body` (izoh).
- **Statuslar:** `new`, `connected`, `not_connected`, `test_period`, `enrolled`, `rejected`.
- **Asosiy muammo — "bosqich" tushunchasi 3 ta:** bo'lim (dropdown) → ustun (kanban column) → `status`. Bular bir-biridan mustaqil, shuning uchun foydalanuvchi chalkashadi.

| Funksiya | Nima qiladi | Muammolar | Verdikt |
|---|---|---|---|
| Lidlar Kanban (`/lids`) | Drag-drop, ustunlar, bulk "guruhga qo'shish", ustunga SMS, Excel | `leads-kanban.tsx` 1 138 qator; har bir ustun uchun alohida so'rov; sahifada 7 ta modal, menyuda 10 ta amal | 🟢 CORE (bitta bosqich tushunchasi bilan) |
| Lid kartasi (modal) | Ma'lumot, izohlar + eslatma, SMS tarixi, lid tarixi, qo'ng'iroqlar | `leads-dragon-modal.tsx` 1 171 qator; bir xil mutate blok 6 marta nusxalangan | 🟢 CORE |
| Lid yaratish/tahrirlash, yo'qotish sababi | Forma, dublikat telefon tekshiruvi, sabab katalogi | `skip_error=true` bilan dublikat baribir saqlanadi | 🟢 CORE |
| Jadval (list) ko'rinishi | — | O'lik kod, lekin `pages/` ichida turgani uchun buzuq route sifatida ochiq | 🔴 eski kodi BLOAT, lekin **list view YolUp'da 🟢 CORE** (katta hajmda kanban noqulay) |
| Lid manbalari (`/lids/stats`) | Manbalar + soni | CASL o'rniga hardcode rol tekshiruvi | 🟢 CORE (sozlamalarga ko'chiriladi) |
| Guruh yig'ish (`group-recruiting`) | Kutish ro'yxati → "aktivlashtirish" bosilganda haqiqiy guruh + o'quvchilarga aylanadi | Menyuda 3 joyda kommentga olingan, yashirin; toq/juft yorliqlari almashib qolgan (bug) | 🔵 IMPORTANT. **Bu kuchli g'oya**, YolUp'da birinchi darajali funksiya bo'ladi |
| Lid hisobotlari | Voronka, manbalar, sotuvchilar reytingi, yo'qotilganlar | Filial tanlanmaguncha hech narsa ko'rsatmaydi | 🔵 IMPORTANT (voronka + manba + menejer konversiyasi) |
| Ommaviy formalar (builder) | Savollar, dizayn, pixel → lid | 2 avlod yonma-yon, 3 xil update endpoint, o'lik modallar | 🟢 CORE (oddiy forma → lid). Dizayn muharriri 🟡 |
| Telefoniya (Moi Zvonki) | Click-to-call, yozuvlar, lidga bog'lash | Toza kod, lekin rus provayderi | 🟡 ADD-ON (provayderdan mustaqil abstraksiya) |
| amoCRM integratsiyasi | **CRM ichida butun parallel CRM rejimi** (`?is_amocrm`) | Har bir komponent `is_amocrm` bo'yicha shoxlanadi; buzuq menyu havolasi | 🔴 BLOAT. Kerak bo'lsa keyin bir tomonlama import/webhook |
| Marketing xarajatlari | Alohida model | Manbaga bog'lanmagan → CAC/ROI hisoblab bo'lmaydi | 🔵 Xarajat + "manba" bog'lanishi sifatida qayta loyihalanadi |
| Lidlardan SMS | — | 4 xil implementatsiya | 🔵 bitta SMS composer |
| Marketplace | Coin evaziga o'quvchi do'koni | Savdo emas, gamifikatsiya | 🟡 ADD-ON |

### 3.2 O'quv jarayoni (Academic core)

**Eski modellar:**
- **Group:**
  - Maydonlar: kurs, o'qituvchi(lar), xona, filial, sanalar, vaqt, `day_of_week[]`, narx, rang, baholash sxemasi.
  - Bir nechta o'qituvchi: `main` / `assistant` / `co_teacher`, har birida o'z ish haqi turi bor.
  - Kunlik jadval (`day_schedules[]`): har kun uchun alohida vaqt va xona.
  - Statuslar: `new` → `trial` → `active` → `frozen` → `archive`.
- **GroupStudent (a'zolik) hayot sikli:** `new`(sinov) → `active` ⇄ `frozen` (sabab majburiy) → `left` (sabab katalogi) → `graduated` (natija: ielts/cefr/university/work). Shuningdek boshqa guruhga transfer (oldindan ko'rish bilan), qayta tiklash va balansni a'zoliklar o'rtasida ko'chirish mumkin.
- **Attendance:** `is_available: true|false|null` + alohida `late: bool` + izoh. Har bir katak uchun alohida PATCH so'rovi.
- **Grading schema:** darajalar (CEFR, DTM, IELTS, 1–5, ABCF, 100 ball).
- **Course:** narx, davomiylik, darslar soni, mavzular (syllabus) + resurslar.

| Funksiya | Muammolar | Verdikt |
|---|---|---|
| Guruhlar ro'yxati + yaratish (xona/o'qituvchi to'qnashuvi tekshiruvi bilan) | Drawer 1 395 qator, ichiga onboarding logikasi aralashgan | 🟢 CORE |
| Guruh sahifasi (davomat, baho, izohlar, imtihon, chegirma, ball, tarix) | ~9 tab + ~8 amal; desktop (1 193) va mobil (870) alohida yozilgan; 2 ta Excel eksportchi | 🟢 CORE (soddalashtiriladi) |
| A'zolik hayot sikli (aktivlashtirish, muzlatish, ketish, transfer, bitirish) | Toza va testlangan | 🟢 CORE — billing va churn shunga tayanadi |
| Davomat jadvali | Bulk "hammasi keldi" yo'q; `late` alohida boolean; vaqt bloki o'qituvchini jimgina to'xtatib qo'yadi | 🟢 CORE (bulk-first qilib qayta yoziladi) |
| Kunlik baholar | Baho yorlig'i logikasi qayta yozilgan | 🔵 IMPORTANT |
| Baholash sxemalari | Default sxemalar frontenddan backendga yuboriladi | 🔵 IMPORTANT (shablon tanlash) |
| O'quvchilar ro'yxati + profil (guruhlar, ota-onalar, izohlar, to'lovlar) | 12.9k qator, nisbatan modulli | 🟢 CORE |
| Guruh imtihonlari + umumiy/mock imtihonlar | Uch xil joy, deyarli bir xil 1 000 qatorli formalar | 🔵 bitta Exam modeli; mock imtihonlar 🟡 ADD-ON |
| Onlayn testlar (Soffia — tashqi servis) | Tashqi tizim, identifikatorlar ko'zgu qilingan | 🟡 ADD-ON |
| Kurs + syllabus (mavzular, resurslar) | — | Kurs 🟢, mavzular 🔵 |
| Xonalar | Toza | 🟢 CORE |
| Dam olish kunlari (umumiy + guruh) | — | 🔵 IMPORTANT (billing va davomatga ta'sir qiladi) |
| Maktablar katalogi | — | 🟡 |
| O'qituvchi bosh sahifasi | **3 ta** bir-birini takrorlaydigan implementatsiya | 🟢 bitta "Bugun / Mening guruhlarim" ekrani |
| Uy vazifalari (teacher tasks) | Sahifalarda inline logika | 🔵 IMPORTANT |
| Whiteboard (Excalidraw) | Faqat localStorage'da saqlanadi, o'quvchiga ko'rinmaydi | 🔴 BLOAT |
| Support teacher (slot band qilish) | ~5k qator; mobil ilovada bitta faylning o'zi 3 804 qator | 🟡 ADD-ON |
| Coin (yangi) | Toza, hujjatlashtirilgan | 🟡 ADD-ON (retention uchun foydali) |
| Student points (eski) | Coin'ning dublikati | 🔴 BLOAT |
| Bitiruvchilar dashboardi | 5.5k qator | 🟡 (core'da faqat "bitirdi + natija" statusi qoladi) |
| Ketgan o'quvchilar hisoboti | 4.6k qator | 🔵 IMPORTANT (5 marta kichikroq qilib qayta yoziladi) |
| O'quvchi portali (web) | Dublikat sahifalar | 🔵 (mobil/Telegram'ga o'tadi) |
| Arxiv / ketganlar sozlamalari | Mock data / bo'sh stub | 🔴 BLOAT |

### 3.3 Moliya

**Eski model:**
- **Billing rejimlari** (SOFF c-panel'da o'rnatadi, markaz o'zi tanlay olmaydi):
  - `by_coming_date` — har oy boshida yechiladi.
  - `by_added_at` — qo'shilgan kundan boshlab har oy.
  - `by_lesson_price` — har bir dars uchun.
  - Qo'shimcha flaglar: `payment_split`, `first_payment_from_group_start`.
- **Qarz:** har kuni backend cron yechadi. `student.balance` umumiy balans, guruh bo'yicha qarz esa alohida endpoint'dan keladi — **ikki xil haqiqat manbai**.
- **Chegirma** ("personal payment"): guruh bo'yicha o'quvchiga qat'iy narx yoki foiz, N oyga.
- **Ish haqi:**
  - O'qituvchi bo'yicha: `percentage` / `fixed` / `per_lesson` / `per_student`.
  - Guruh bo'yicha override bor.
  - Oylik hisob backendda bo'ladi: `frozen` → `approved`.
- **Bonus / Jarima / Avans:** bir xil shakldagi 3 ta alohida model va 3 ta alohida sahifa.

| Funksiya | Muammolar | Verdikt |
|---|---|---|
| To'lov qabul qilish (`GlobalPaymentModal`) + chek | 682 qator; eski forma oylarga taqsimlashni klientda `dayjs()` bilan hisoblagan; API hali ham `extra_payments` qabul qiladi | 🟢 CORE — mahsulotning yuragi |
| Balans / qarz / qarzdorlar filtri | 2 ta haqiqat manbai; to'lovdan keyin 3 ta alohida refetch → eskirgan balans ko'rinishi mumkin | 🟢 CORE |
| Billing rejimlari | Markaz o'zi sozlay olmaydi | 🟢 oylik + qo'shilgan kundan; har dars uchun 🔵 |
| Shaxsiy chegirma | Foiz klientda hisoblanadi | 🟢 CORE (O'zbekistonda chegirma juda ko'p ishlatiladi) |
| Qaytarish / balans o'tkazish | Backend qaytarishni asl summa bilan solishtirmasligi mumkin | 🔵 IMPORTANT |
| To'lov turlari (naqd/karta/click) | — | 🟢 CORE |
| Xarajatlar + kategoriyalar | Kod copy-paste, xatolar jimgina yutiladi | 🟢 CORE |
| Moliya dashboardi (P&L, to'lov turi bo'yicha) | Payment report bilan ustma-ust tushadi | 🟢 (bitta sodda P&L) |
| Ish haqi hisoblash (oy → xodim → guruh → o'quvchi) | ~3.6k qator UI; logika backendda (yaxshi) | 🟢 fixed + foiz; dars/o'quvchi bo'yicha 🔵 |
| Bonus / Jarima / Avans | 3 ta deyarli bir xil sahifa | 🔵 bitta "Tuzatish" (±) entity |
| `salary-confirm.tsx` | Klientda `final_salary` hisoblab PATCH qiladi; o'lik kod | 🔴 BLOAT |
| Investitsiya | Oddiy jurnal | 🔴/🟡 |
| Kassir jurnali (barcha to'lovlar ro'yxati) | — | 🟢 CORE |
| Chek sozlamalari | 865 qator, 17 ta toggle | 🔵 (~5 ta sozlama) |
| Click integratsiyasi + o'quvchi onlayn to'lovi | Faqat Click; o'quvchi portalida Payme ko'rinadi, lekin hammasi Click'ga ketadi | 🔵 → YolUp'da **🟢** (ota-ona uchun asosiy ustunlik) |
| To'lovlar audit logi | — | 🔵 (firibgarlikka qarshi) |
| CEO moderatsiyasi (admin amallarini tasdiqlash) | Javob shakliga qarab aniqlanadi | 🔵 IMPORTANT — admin firibgarligi real og'riq |
| SOFF'ga obuna to'lovi | 5 ta deyarli bir xil modal; `601–1000` tarifida `max:100` bug; bank chekini yuklash | 🟢 (bitta "Obuna" sahifasi + onlayn to'lov) |
| Obuna bloki | `localStorage.payment_page` orqali — **klientda chetlab o'tsa bo'ladi** | 🟢 backendda majburiy qilib qayta yoziladi |
| `settings/ceo/billing.tsx` | `<div>Billing</div>` | 🔴 BLOAT |

**Eski tizimda yo'q, lekin kerak:** **Kassa smenasi** (ochish/yopish, kassir qoldig'i). Hozir to'lovlar faqat "to'lov turi bo'yicha" guruhlanadi.

### 3.4 Kommunikatsiya

| Funksiya | Verdikt |
|---|---|
| SMS shablonlari + qo'lda yuborish | 🟢 CORE (ota-onaga asosiy kanal) |
| Avto-SMS triggerlari (to'lov, qarz, kelmadi, imtihon, guruh boshlanishi, ~15 placeholder) | 🟢 CORE — shablonlar bilan **bitta** "Xabarlar" ekraniga birlashtiriladi |
| Yuborilgan SMS logi | 🔵 |
| Telegram (hozir faqat xodim bog'lash) | 🔵 → YolUp'da **ota-ona Telegram boti 🟢 CORE** |
| In-app bildirishnomalar (2 ta dropdown + manager) | 🔵 bitta tizim |
| Kirishlar logi | 🟡 |

### 3.5 Platforma, rollar, admin

| Funksiya | Holat | Verdikt |
|---|---|---|
| Login + majburiy parol almashtirish | Yaxshi yozilgan, testlangan | 🟢 CORE |
| Rollar: ceo, admin, teacher, support, student, casher, marketolog, watcher, boshqa + custom | Asosiy rollarda frontend ruxsati = `manage all`; WATCHER `coreRoles`da yo'q | 🟢 ~5–6 qat'iy rol + oddiy ruxsat matritsasi |
| Rol boshqaruvi UI | **3 ta** implementatsiya, ~12k qator; `role-automation` (10.4k qator) butun ilovaning mock nusxasini yaratadi | 🔴 BLOAT (2 tasi); custom rollar 🔵 |
| Filiallar (`X-Branch-Id`) | localStorage'dan o'qiladi, almashtirganda `window.location.reload()`; ba'zi joylarda query param | 🟢 CORE (reload'siz, server sessiyasidan) |
| Multi-tenancy (subdomen) | Aniqlash logikasi 5+ joyda | 🟢 konsepsiya (§11.4'da qayta loyihalangan) |
| Dashboard (12 KPI, dars jadvali, pul xulosasi) | Yaxshi tanlangan KPI'lar | 🟢 CORE |
| Xonalar bandligi analitikasi (FIK) | 1 810 qator | 🔵 — **real farqlovchi**, soddalashtiriladi |
| Xodimlar | — | 🟢 CORE |
| Face ID qurilmalar | Bitta fayl 1 554 qator | 🟡 ADD-ON (pulli) |
| Xodim davomati hisobotlari | Bitta komponent 2 909 qator | 🟡 ADD-ON |
| `/employee-attendance` | O'lik, menyuda yo'q | 🔴 |
| Soffia AI chat (SSE stream) | Kodi yaxshi | 🟡 ADD-ON (marketing ustunligi, lekin yaxshi hisobotlardan keyin) |
| Storage (fayllar + limit) | 2 070 qator | 🟡 ADD-ON |
| Video darsliklar, "Yangiliklar" | Kichik | 🟡 arzon, qoldirish mumkin |

### 3.6 Onboarding / engagement

`UserLayout` ichida **25 dan ortiq global overlay** doim yuklangan.

| Funksiya | Verdikt |
|---|---|
| Yangi onboarding (checklist + spotlight, 3 890 qator) | 🔵 **bitta** sodda checklist |
| Eski 15 modalli wizard | 🔴 |
| Joyride turlari | 🔴 |
| CrmSurvey + har sahifada feedback + local-feedbacks | 🔴 (bitta "Fikr bildirish" tugmasi yetarli) |

### 3.7 SOFF ichki operator paneli (c-panel)

| Funksiya | Verdikt |
|---|---|
| Tenant (markaz) CRUD, tariflar, to'lovlarni tasdiqlash, factory reset | 🟢 ichki uchun CORE → **alohida admin ilova** |
| `c-panel-leads` (SOFF'ning o'z savdo CRM'i, 7.2k qator) | 🔴 tenant bundle'dan olib tashlanadi. Ichki savdo uchun YolUp'ning o'z lid modulidan foydalaniladi ("dogfooding") |
| Customer success doskalari (churn, winback…) | 🟡 keyinroq |
| AI xarajatlari, feature announcement'lar | 🟡 / 🔵 |

### 3.8 Mobil ilovalar

| Ilova | Asosiy topilmalar | Verdikt |
|---|---|---|
| O'quvchi (RN CLI) | Eng toza tuzilma; ParentQRModal "ota-ona ilovasi bilan skanerlang" deydi, lekin **bunday ilova yo'q** | Funksiyalari ota-ona/o'quvchi ilovasiga ko'chiriladi |
| CEO (Expo) | Web admin'ning mobil nusxasi (~80 endpoint), production test host'ga bog'liq, kodda AI agent izohlari qolgan | Faqat read-mostly dashboard + push qoldiriladi |
| Support teacher (Expo) | Faqat SUPPORT roli; `meetings.tsx` 3 804 qator; buzilgan JSX'ni tuzatadigan `fix_meetings.py` skripti | **Barcha o'qituvchilar** uchun ilovaga aylantiriladi |
| Umumiy | 2 xil stek, 3 xil i18n, 5 xil API klient, prod'da hardcode `test.*` domenlari | Bitta Expo ilova, rolga qarab shell |

---

## 4. Qayta yozilmaydigan narsalar (BLOAT ro'yxati)

Bularning hech biri YolUp'ga **o'tkazilmaydi** (taxminan **40–50 ming qator** kod):

- `role-automation` (~10.4k qator), dublikat `settings/roles`, `views/apps/permissions`
- amoCRM "parallel board" rejimi
- Eski formalar (application-form), `FormsUpdateModal`, lid table-view/view-toggle (o'lik route'lar)
- Whiteboard (Excalidraw, localStorage)
- Eski `student-points` (coin bilan almashtiriladi)
- `salary-confirm.tsx`, `settings/ceo/billing.tsx`, `settings/index.tsx` stublari
- `settings/office/archive`, `lefted-students` stublari
- `support-exams`, orphan `/employee-attendance`, `soffBotIcon`
- 3 ta o'qituvchi bosh sahifasidan 2 tasi
- Eski 15 modalli wizard, Joyride, CrmSurvey, har sahifadagi feedback
- Vuexy template qoldiqlari (`users/view/[tab]`, `mentors/ui/view/*`)
- Dublikat gorizontal navigatsiya
- `c-panel-leads` (tenant bundle ichidan)
- Investitsiya moduli (MVP'da)
- Mobil: `fix_meetings.py`, `.tmp` fayllar, mock data, test-domen URL'lari, AI-guideline `.md` to'plami

---

## 5. Eski tizimning asosiy kasalliklari

Bu bo'lim YolUp'da **takrorlamaslik** kerak bo'lgan xatolar ro'yxati.

### 5.1 Mahsulot / UX

| Kasallik | Misol | YolUp'dagi qoida |
|---|---|---|
| Bir funksiya — ko'p joy | 3 xil imtihon joyi, 4 xil SMS oynasi, 3 xil "lidni guruhga qo'shish" usuli | Har bir amal **bitta** joyda yashaydi |
| Bir xil tushunchaga ko'p nom | `new`/"trial"/"not_activated"; "Ballar" vs "Coins"; `normal` vs `warm` | Yagona lug'at (§8.3) |
| Sozlamalar sochilgan | Sidebar (17 havola) + tablar (14 switch) + user dropdown + menyuda yo'q route'lar | Bitta Sozlamalar sahifasi, bo'limlar bilan |
| Modal ichida modal | Lidlar sahifasida 7 modal, 10 amal | Drawer/side-panel + inline tahrirlash |
| Toq/juft hafta kunlari "magic" | Default kunlar bugungi kunga bog'liq | Aniq hafta kunlari tanlovi + shablon |
| Muhim funksiya yashirin | Guruh yig'ish (recruiting) menyuda yo'q | Workflow'lar ko'rinadigan va bir-biriga bog'langan |
| Desktop va mobil alohida kod | Guruh sahifasi 1 193 + 870 qator | Responsive komponentlar, bitta kod |

### 5.2 Biznes logika

- **Pul hisob-kitobi klientda:**
  - to'lovni oylarga taqsimlash;
  - ish haqini tasdiqlash (butun qator PATCH qilinadi);
  - chegirma foizi;
  - tarif chegaralari (`max:100` bug).
- **Obuna bloki localStorage'da.** Foydalanuvchi uni chetlab o'tishi mumkin.
- **Ikki xil balans manbai** (umumiy vs guruh bo'yicha).
- **Decimal yo'qoladi** (`AmountInput` raqam bo'lmagan hamma narsani o'chiradi). "so'm" hardcode qilingan, formatlash funksiyalari bir-biriga mos emas.
- **Muhim sozlamalarni faqat SOFF o'rnatadi** (billing va ish haqi rejimi), markaz o'zi sozlay olmaydi.
- **Backend javob shakli barqaror emas:** `res.data.tokens ?? res.data`, statuslar ba'zan o'zbekcha matn bo'lib keladi, maxsus HTTP 430, xato **matni** bo'yicha shoxlanish ("Xotira to'ldi").

### 5.3 Texnik

| Muammo | Raqam |
|---|---|
| Bir vazifa uchun ko'p kutubxona | UI: MUI + Bootstrap (CDN) + rsuite + **Tailwind Play CDN** (brauzerda kompilyatsiya!); chart: 3 ta; ikona: 3 ta; forma: formik (120 fayl) vs RHF (4 fayl) |
| Arxitektura | FSD "migratsiya"si asosan papka nomini o'zgartirish bo'lib qolgan: `entities` deyarli bo'sh, 261 ta chuqur cross-feature import, 22 ta import sikli; HTTP klient UI feature store'larini import qiladi |
| API chaqiruvlari | 421 ta hardcode URL string, 2 ta endpoint fayli; 161 ta inline query key |
| Lint | Recommended qoidalar o'chirilgan, build'da lint e'tiborga olinmaydi |
| SSR | Amalda yo'q; `getServerSideProps` faqat `params.slug`ni uzatish uchun ishlatilgan |
| Monitoring | Sentry yo'q. Har bir HTTP xato PII bilan birga Telegram'ga ketadi; filtr kommentga olingan |
| Hujjatlar | `CLAUDE.md` eskirgan; 41.5k qatorli migratsiya hujjatlari; mobil ilovalarda AI agentlar uchun yozilgan `.md` lar |
| Mobil | 2 stek, 3 i18n, MMKV'da shifrlanmagan token, prod'da `test.*` host |

### 5.4 Xavfsizlik

- Token localStorage'da + 11 ta `dangerouslySetInnerHTML` + CSP'da `unsafe-inline` + SRI'siz CDN skriptlar. Natijada bitta XSS barcha sessiyalarni o'g'irlashga yetadi.
- `images.remotePatterns: *` (ochiq image proxy).
- Google OAuth token URL'da.
- `ReactQueryDevtools` production'da.
- Deploy `root` orqali SSH bilan; prod va test bitta serverda.
- **Repoda sirlar:** batafsil §17.

---

## 6. Bozordagi bo'shliqlar — YolUp qayerda yutadi

Raqobatchilardan "birdan o'tib ketish" uchun funksiya soni emas, **quyidagi 7 ta ustunlik** kerak:

1. **Ota-ona tajribasi (eng katta ustunlik).**
   - Telegram bot (o'rnatishsiz, O'zbekistonda hamma Telegram'da) + mobil ilova.
   - Ota-ona ko'radigan narsalar: bugungi dars, davomat (kelmasa darhol xabar), baholar, uy vazifasi, qarz/balans, to'lov tarixi.
   - **Bir tugma bilan onlayn to'lov** (Click / Payme / Uzum).
   - Bitta ota-ona hisobida bir nechta farzand.
2. **Pul aniqligi.** Ledger asosidagi hisob: har bir so'm izohlangan, qarz hech qachon "sakramaydi". Kassa smenasi, audit log, CEO tasdig'i.
3. **Tezlik va qulaylik.**
   - Davomat **3 soniyada**: "Hammasi keldi" → istisnolarni belgilash.
   - To'lov **10 soniyada**: global qidiruv (`Ctrl+K`) → o'quvchi → summa → chek.
4. **Sozlash erkinligi.** Billing va ish haqi rejimlarini markaz o'zi tanlaydi (SOFF xodimisiz).
5. **O'zi ro'yxatdan o'tish (self-serve).** 10 daqiqada ishga tushish, Excel'dan import, onlayn obuna to'lovi. Bank chekini yuklash va qo'lda tasdiqlash bo'lmaydi.
6. **Kuchli analitika, kam ekranda.**
   - Bitta "Biznes salomatligi" dashboardi: tushum, yig'ilish darajasi, qarzdorlik, churn, lid konversiyasi, xona bandligi.
   - Eski tizimda xona bandligi (FIK) bor edi. Bu kam raqobatchida bor narsa, uni saqlab, sodda qilamiz.
7. **Ko'p filial va ko'p til.** uz (lotin) / ru / en / kaa from day 1; global bozor uchun valyuta va vaqt mintaqasi sozlamasi.

---

## 7. YolUp mahsulot tamoyillari: Core va Add-on ajratish

Siz aytgan asosiy talab: **"qo'shimcha va asosiy funksiyalarni UI'da va logikada aralashtirmaslik"**. Buning yechimi — **modulli platforma**.

### 7.1 Qoidalar

1. **Core** — har bir markazda doim yoqiq. O'chirib bo'lmaydi.
2. **Add-on** — alohida modul. U:
   - menyuda o'z bo'limiga ega (yoki mavjud ekranga **extension slot** orqali tab/kartochka qo'shadi);
   - Sozlamalarda o'z bo'limiga ega;
   - o'z ruxsatlariga (permission) ega;
   - o'z jadvallari va API namespace'iga ega (`/api/v1/addons/coins/...`);
   - o'chirilganda UI'dan **to'liq yo'qoladi**, core ishlashda davom etadi.
3. **Bog'liqlik bir tomonlama:** add-on core'ni import qiladi, **core hech qachon add-on'ni import qilmaydi**. Bu lint qoidasi bilan majburiy qilinadi (depcruise/steiger, `error` darajasida).
4. **Add-on core bilan voqealar (domain events) orqali gaplashadi:**
   - Core voqea chiqaradi: `attendance.marked`, `payment.received`, `student.enrolled`.
   - Add-on unga obuna bo'ladi. Masalan, Coins add-on `attendance.marked` bo'lganda o'quvchiga ball beradi.
   - Core kodida coin haqida bitta ham qator yo'q.
5. **Extension slot'lar** (UI): `student.profile.tabs`, `group.detail.tabs`, `dashboard.widgets`, `settings.sections`, `nav.items`. Add-on faqat shu nuqtalarga ulanadi.
6. **Har bir add-on — biznes qaror.** Bepul (retention uchun) yoki pulli (daromad uchun). Bu tarif tizimiga to'g'ridan-to'g'ri bog'lanadi.

### 7.2 Bo'linish

```
CORE (doim yoqiq)                          ADD-ONS (yoqiladigan)
───────────────────────────────            ─────────────────────────────────
• Lidlar (pipeline, forma, manba)          • Coins + Marketplace (gamifikatsiya)
• O'quvchilar + Ota-onalar                 • Onlayn testlar
• Guruhlar + Jadval + Xonalar              • Mock imtihonlar (pulli, arizalar bilan)
• Davomat                                  • Support teacher (slot band qilish)
• Baholar + Imtihon (bitta model)          • Face ID + Xodim davomati
• To'lovlar + Qarz + Chegirma + Chek       • Telefoniya (provayderdan mustaqil)
• Xarajatlar + P&L + Kassa                 • AI yordamchi
• Ish haqi                                 • Fayl ombori (Storage)
• Xabarlar (SMS + Telegram + Push)         • Bitiruvchilar vitrinasi
• Dashboard + asosiy hisobotlar            • Uy vazifalari (v1.x'da core'ga o'tishi mumkin)
• Xodimlar, rollar, filiallar              • Integratsiyalar (amoCRM import, 1C, ...)
• Ota-ona/O'quvchi portali (bot + app)
```

---

## 8. YolUp domen modeli

### 8.1 Asosiy entity'lar

```
Tenant (Markaz) ─┬─ Branch (Filial)
                 ├─ User (Xodim) ── Role[] (filial bo'yicha)
                 ├─ Course ── CourseTopic[]
                 ├─ Room
                 ├─ Group ── GroupTeacher[] (role, pay_rule)
                 │        └─ Schedule (weekly slots: day, start, end, room)
                 │        └─ Lesson[] (generatsiya qilinadi; ko'chirish/bekor qilish)
                 ├─ Student ── Guardian[] (Ota-ona; bir ota-ona → ko'p farzand)
                 │          └─ Enrollment[] (Student × Group, hayot sikli)
                 ├─ Attendance (Lesson × Enrollment)
                 ├─ Assessment (Exam/Quiz) ── Score[]
                 ├─ Lead ── Activity[] (izoh, qo'ng'iroq, SMS, vazifa)
                 ├─ Ledger: Charge, Payment, Discount, Refund, Adjustment
                 ├─ Expense ── ExpenseCategory
                 ├─ Payroll (oy) ── PayrollLine[] ── Adjustment(±)
                 ├─ CashShift (Kassa smenasi)
                 ├─ MessageTemplate, MessageLog, AutomationRule
                 └─ AuditLog, ApprovalRequest
```

### 8.2 Hayot sikllari (state machine — backendda majburiy)

**Lead:**
```
NEW → CONTACTED → TRIAL_SCHEDULED → TRIAL_ATTENDED → WON (Student'ga aylanadi)
  └────────────┴──────────────┴──────────────→ LOST (sabab majburiy)
```
- Bosqichlar markaz tomonidan sozlanadi, lekin har biri 5 ta tizim kategoriyasidan biriga bog'lanadi: `open`, `trial`, `won`, `lost`, `waiting`. Shuning uchun hisobotlar har doim ishlaydi.
- **"Bosqich" tushunchasi — bitta.** Bo'lim / ustun / status uchligi yo'q.

**Enrollment (o'quvchi × guruh):**
```
TRIAL → ACTIVE ⇄ FROZEN(sabab, sana) → LEFT(sabab) | COMPLETED(natija)
```
- Billing faqat `ACTIVE` holatida yechiladi.
- Muzlatishda yechish to'xtaydi.
- Barcha o'tishlar `effective_date` bilan va audit logga yoziladi.

**Group:** `PLANNED` (lidlar yig'ilmoqda) → `ACTIVE` → `COMPLETED` | `ARCHIVED`.
- `PLANNED` = eski "group-recruiting" g'oyasi, endi birinchi darajali holat.
- Lidni to'g'ridan-to'g'ri rejalashtirilgan guruhga qo'shish mumkin. Guruh aktivlashtirilganda lidlar avtomatik o'quvchiga aylanadi.

**Attendance:** `PRESENT | LATE | ABSENT | EXCUSED`.
- Bitta enum: "late" alohida boolean emas.
- Bulk saqlanadi: bitta so'rov = bitta dars.

**Payroll:** `DRAFT → LOCKED → PAID`. `LOCKED` dan keyin faqat ±Adjustment orqali o'zgaradi.

### 8.3 Moliya modeli (eng muhim qism)

- **Pul = butun son (tiyin), `bigint`.** Float yo'q. Valyuta tenant sozlamasida.
- **Ledger (jurnal):**
  - Balans saqlanmaydi, **hisoblanadi**: `Σ(payments) − Σ(charges) + Σ(adjustments)`. Tezlik uchun materialized balance bo'ladi, u faqat ledger orqali yangilanadi.
  - Yozuvlar o'zgartirilmaydi. Tuzatish = teskari yozuv (reversal).
- **Charge (yechim) generatsiyasi** faqat backendda, rejim bo'yicha:
  - `MONTHLY_CALENDAR` — har oy boshida.
  - `MONTHLY_FROM_ENROLLMENT` — qo'shilgan kundan.
  - `PER_LESSON` — o'tgan dars bo'yicha.
  - Proratsiya, dam olish kunlari va muzlatish hisobga olinadi.
- **To'lov taqsimoti** faqat backendda (FIFO: eng eski qarz birinchi). Klient faqat `{student_id, amount, method, group_id?}` yuboradi va **Idempotency-Key** qo'shadi.
- Chegirma = qoida (foiz yoki qat'iy summa, N oy yoki muddatsiz). Charge generatsiyasida qo'llanadi.
- **Kassa smenasi:** kassir ochadi → to'lovlar smenaga bog'lanadi → yopishda kutilgan va haqiqiy summa solishtiriladi.
- **Moderatsiya:** to'lovni o'chirish, qaytarish, chegirma va orqa sana bilan yozish → `ApprovalRequest` → CEO tasdiqlaydi.
- **Yagona lug'at:** Qarz = manfiy balans. "To'lov kuni yaqin" = keyingi charge ≤ N kun ichida. Bu atamalar hamma joyda bir xil.

---

## 9. Axborot arxitekturasi: menyu, rollar, sozlamalar

### 9.1 Asosiy menyu (CEO/Admin) — 7 bo'lim

| # | Bo'lim | Ichida |
|---|---|---|
| 1 | **Bosh sahifa** | KPI, bugungi darslar, vazifalar/eslatmalar, tasdiq kutayotganlar |
| 2 | **Lidlar** | Kanban / ro'yxat, rejalashtirilgan guruhlar, formalar |
| 3 | **O'quvchilar** | Ro'yxat (qarz filtri bilan), profil, ota-onalar |
| 4 | **Guruhlar** | Ro'yxat, jadval (kalendar: xona × vaqt), guruh sahifasi |
| 5 | **Moliya** | Kassa/to'lovlar jurnali, xarajatlar, ish haqi, P&L |
| 6 | **Hisobotlar** | Moliya, o'quv, lidlar, churn, xona bandligi |
| 7 | **Sozlamalar** | Bitta sahifa, bo'limlar bilan (quyida) |

Add-on'lar yoqilganda o'z bo'limini qo'shadi (masalan "Coins"). Xodimlar ro'yxati Sozlamalar ichida turadi.

**Global:**
- `Ctrl+K` qidiruv: o'quvchi, lid, guruh va amallar ("to'lov qabul qilish").
- "+" tez yaratish tugmasi.
- Filial almashtirgich (sahifa qayta yuklanmaydi).
- Bildirishnomalar.

### 9.2 Sozlamalar (bitta sahifa)

```
Markaz        — nom, logo, filiallar, ish vaqti, valyuta, til, vaqt mintaqasi
O'quv         — kurslar, xonalar, dam olish kunlari, baholash sxemalari
Moliya        — billing rejimi, to'lov turlari, chek, chegirma qoidalari, ish haqi qoidalari
Lidlar        — bosqichlar, manbalar, yo'qotish sabablari, formalar
Xabarlar      — shablonlar + avtomatik triggerlar (bitta ekran), Telegram bot
Jamoa         — xodimlar, rollar va ruxsatlar
Xavfsizlik    — moderatsiya qoidalari, audit log, kirishlar
Obuna         — tarif, add-on'lar do'koni, hisob-fakturalar, onlayn to'lov
Integratsiyalar — Click/Payme/Uzum, SMS provayder, telefoniya
```

### 9.3 Rollar

| Rol | Asosiy ekranlar |
|---|---|
| **Owner (CEO)** | Hammasi + obuna + rollar |
| **Admin / Menejer** | Lidlar, o'quvchilar, guruhlar, to'lov qabul qilish (moliya hisobotlarisiz) |
| **Kassir** | Kassa, to'lovlar, xarajat kiritish |
| **O'qituvchi** | Bugun, mening guruhlarim, davomat, baholar, uy vazifalari, o'z ish haqi |
| **Marketolog** | Lidlar, formalar, lid hisobotlari |
| **Kuzatuvchi** | Hammasi read-only |
| **Ota-ona / O'quvchi** | Faqat portal (bot / ilova) |

- Ruxsatlar **backendda majburiy** (har bir endpoint). Frontend faqat UI'ni yashiradi.
- Ruxsatlar "resurs × amal" ko'rinishida bo'ladi (`payments.create`, `payments.refund`, `reports.finance.view`).
- Rollar shu ruxsatlarning nomlangan to'plami. Custom rol — v1.x.

---

## 10. Scope: MVP → v1.x → Add-on'lar

### 10.1 MVP (Web) — "Markaz kundalik ishini to'liq yuritadi"

1. Ro'yxatdan o'tish (self-serve), onboarding checklist, Excel'dan import (o'quvchilar, guruhlar).
2. Filiallar, xodimlar, 6 ta qat'iy rol, backend ruxsatlari.
3. Kurslar, xonalar, dam olish kunlari.
4. Guruhlar: haftalik jadval (har kun alohida vaqt/xona), ko'p o'qituvchi, xona/o'qituvchi to'qnashuvi tekshiruvi, jadval kalendari.
5. O'quvchilar + ota-onalar + Enrollment hayot sikli (sinov, aktiv, muzlatish, ketish + sabab, transfer).
6. Davomat (bulk, 4 status), dars mavzusi.
7. Baholar: bitta Assessment modeli (kunlik baho + imtihon), baholash sxemasi shablonlari.
8. Moliya:
   - ledger;
   - 2 ta billing rejimi (oylik kalendar, qo'shilgan kundan);
   - chegirma;
   - to'lov qabul qilish + PDF/termal chek;
   - qaytarish;
   - to'lov turlari;
   - kassa jurnali;
   - xarajatlar;
   - P&L.
9. Ish haqi: qat'iy + foiz, ± tuzatishlar (bonus/jarima/avans), DRAFT → LOCKED → PAID.
10. Lidlar: sozlanadigan pipeline, kanban + ro'yxat, manbalar, yo'qotish sababi, eslatmalar, ommaviy forma, "rejalashtirilgan guruh"ga qo'shish → o'quvchiga aylantirish.
11. Xabarlar: SMS shablonlari + avto-triggerlar (qarz, kelmadi, to'lov qabul qilindi), SMS logi.
12. Dashboard + 4 ta asosiy hisobot (tushum/yig'ilish, qarzdorlar, davomat, lid voronkasi).
13. Audit log (moliyaviy amallar).
14. Obuna: tarif, onlayn to'lov, backendda majburiy blok.
15. SOFF/YolUp ichki admin ilovasi (alohida): tenantlar, tariflar, to'lovlar.

### 10.2 v1.x

- **Ota-ona Telegram boti** (MVP'dan keyin birinchi bo'lib): davomat xabari, qarz, to'lov havolasi, baholar.
- Onlayn to'lov: Click + Payme + Uzum (ota-ona va o'quvchi uchun).
- `PER_LESSON` billing; dars va o'quvchi bo'yicha ish haqi.
- Kassa smenasi, CEO moderatsiyasi (ApprovalRequest).
- Custom rollar.
- Uy vazifalari.
- Churn hisoboti (sabablar bo'yicha), xona bandligi hisoboti, menejer konversiyasi.
- Marketing xarajati ↔ lid manbasi (CAC).

### 10.3 Add-on'lar (keyinroq, alohida yoqiladi)

Coins + Marketplace, Onlayn testlar, Mock imtihonlar, Support teacher, Face ID + xodim davomati, Telefoniya, AI yordamchi, Storage, Bitiruvchilar vitrinasi, amoCRM import.

---

## 11. Texnik arxitektura (YolUp)

### 11.1 Monorepo

```
yolup/
├─ apps/
│  ├─ web/            # CRM (React SPA — Vite yoki Next App Router)
│  ├─ mobile/         # Expo — Ota-ona/O'quvchi, O'qituvchi, Owner (rol bo'yicha shell)
│  ├─ admin/          # YolUp ichki operator paneli
│  ├─ site/           # Landing + ommaviy lid formalari (SSR/SSG)
│  └─ api/            # Backend
├─ packages/
│  ├─ api-client/     # OpenAPI'dan generatsiya: tiplar, zod, TanStack Query hook'lar
│  ├─ domain/         # Sof biznes qoidalar (formatlash, statuslar, label'lar)
│  ├─ ui/             # Web dizayn tizimi
│  ├─ ui-native/      # Mobil komponentlar (umumiy token'lar)
│  ├─ tokens/         # Rang, spacing, radius, tipografiya → CSS vars + TS + RN
│  ├─ i18n/           # uz, ru, en, kaa — tiplangan kalitlar
│  └─ config/         # eslint, tsconfig, prettier
└─ addons/            # coins/, tests/, face-id/ ... (har biri o'z api + ui bilan)
```
Asboblar: **pnpm + Turborepo**.

### 11.2 Stek tavsiyasi

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Web | React 19 + TypeScript strict + **Vite SPA** (CRM uchun SSR shart emas); TanStack Router yoki React Router | Tez, sodda; SSR faqat `site/` uchun (Next.js) |
| UI | **Radix/shadcn + Tailwind (build-time)** + o'z token'larimiz | To'liq dizayn nazorati; MUI "template" ko'rinishidan qochish |
| Server state | TanStack Query (faqat generatsiya qilingan hook'lar) | |
| UI state | Zustand (minimal), URL state — router | |
| Forma | react-hook-form + zod (OpenAPI'dan) | Web va mobilda bir xil validatsiya |
| Jadval | TanStack Table + virtualizatsiya | Katta ro'yxatlar |
| Chart | **Bitta** kutubxona (Recharts yoki ECharts) | |
| Sana | **Bitta** kutubxona (date-fns yoki dayjs) + tenant vaqt mintaqasi | |
| Mobil | Expo (SDK oxirgi), expo-router, SecureStore, offline cache | |
| Backend | Jamoa Python bilsa: **Django 5 + DRF + drf-spectacular**. Agar TS-only bo'lsa: **NestJS**. Ikkalasida: PostgreSQL, Redis, Celery/BullMQ | Eski jamoa Django biladi; domen bilimi saqlanadi |
| Fon vazifalar | Charge generatsiyasi, avto-SMS, ish haqi hisobi — navbat (queue) orqali, idempotent | |

**Qoida:** har bir vazifa uchun **bitta** kutubxona. Har bir tanlov ADR (Architecture Decision Record) bilan yoziladi. `knip` CI'da ishlatilmaydigan dependency'larni bloklaydi.

### 11.3 API kontrakt

- **Contract-first:** backend OpenAPI 3.1 chiqaradi → `packages/api-client` generatsiya qilinadi (orval / hey-api). Qo'lda URL yozish **taqiqlanadi**.
- Versiya URL'da: `/api/v1/...`. Breaking change'lar `oasdiff` bilan CI'da ushlanadi.
- Yagona xato formati: `{code, message, details, request_id}`. Klient `code` bo'yicha i18n xabar ko'rsatadi; **matn bo'yicha shoxlanish yo'q**.
- Barcha yozish so'rovlarida `Idempotency-Key`.
- Ro'yxatlar: cursor pagination + `updated_since` (mobil sinxronizatsiya uchun).

### 11.4 Multi-tenancy

- **Bitta API host** (`api.yolup.uz`). Tenant JWT claim'dan olinadi, backendda tekshiriladi.
- Subdomen (`markaz.yolup.uz`) faqat brending va login sahifasi uchun.
- Ma'lumotlar bazasi: **umumiy schema + `tenant_id` + PostgreSQL Row-Level Security**. Minglab markazga oson masshtablanadi, migratsiya bitta. Katta enterprise mijoz uchun keyinchalik alohida DB variant.
- Natija: bitta mobil build, bitta CSP origin, tenantlar orasida almashish (bir xodim 2 markazda), yagona monitoring.

### 11.5 Auth

- **Web:** httpOnly + Secure + SameSite cookie (refresh) + qisqa muddatli access token xotirada. **localStorage'da hech narsa yo'q.**
- **Mobil:** SecureStore/Keychain.
- Ota-ona: telefon + OTP (SMS/Telegram). Xodimlar: telefon + parol, owner/admin uchun ixtiyoriy 2FA.
- Filial va rol server sessiyasidan olinadi.

### 11.6 Sifat darvozalari (CI'da majburiy)

- `typescript-eslint strict-type-checked`, `no-explicit-any: error`, `@ts-nocheck` taqiqlangan.
- Arxitektura chegaralari (depcruise/steiger) `error` darajasida, jumladan **core → addon importi taqiqlangan**.
- `max-lines`: fayl ≤ 300, komponent ≤ 150 qator.
- Hex rang literallari va inline `style` lint bilan taqiqlangan, faqat token'lar ishlatiladi.
- i18n: JSX'da literal string taqiqlangan; 4 til kalitlari to'liq mosligi CI'da tekshiriladi.
- Testlar:
  - Vitest — domain va hook'lar.
  - MSW — OpenAPI'dan generatsiya.
  - **Playwright E2E — 10 ta "pul yo'li"**: login, to'lov, qaytarish, davomat, enrollment, muzlatish, ish haqi, lid → o'quvchi, obuna bloki, filial almashtirish.
  - Backend'da billing engine uchun property-based testlar.
- Bundle budjeti (`size-limit`), Renovate, `npm audit`/OSV, `gitleaks`.

### 11.7 Kuzatuv (observability)

- Sentry (source map'lar private), release teglari, `request_id` korrelyatsiyasi, PII maskalangan session replay.
- Telegram faqat **alert** kanali, log ombori emas.
- Mahsulot analitikasi (PostHog): funnel'lar, feature usage. Shu ma'lumot qaysi add-on kerakligini isbotlaydi.

### 11.8 Infra

- Konteynerlar, har bir PR uchun preview muhit, prod va staging alohida.
- Root bo'lmagan deploy foydalanuvchisi, sirlar vault'da.
- Enforced nonce-based CSP, CDN skriptlar yo'q.
- Kunlik DB backup + tiklash testi (moliyaviy ma'lumot!).

---

## 12. Dizayn tizimi va UX tamoyillari

### 12.1 Dizayn tizimi

- **Token'lar birinchi.** Rang (semantik: `bg/surface/text/primary/success/warning/danger`), spacing (4px grid), radius, soya, tipografiya shkalasi. Light va dark mode from day 1.
- **Komponent kutubxonasi** Storybook'da + visual regression (Chromatic/Loki). Hech bir ekran kutubxonadan tashqarida komponent yaratmaydi.
- **Bitta shrift** (masalan, Inter yoki Manrope — kirill va o'zbek lotin harflari bilan), self-hosted.
- **Brend:** eski SOFF `#666CFF` (Materio template rangi) **ishlatilmaydi**. YolUp o'z identikasiga ega bo'ladi.
- **Pul formatlash** bitta funksiya: `formatMoney(amount, currency, locale)`.

### 12.2 UX tamoyillari

1. **Kundalik vazifa ≤ 3 klik.** To'lov, davomat, lid qo'shish va eslatma uchun "tez amal" + klaviatura yorliqlari.
2. **Modal o'rniga side-panel.** Kontekst yo'qolmaydi. Modal faqat tasdiqlash uchun.
3. **Inline tahrirlash** jadvallarda (status, mas'ul, sana).
4. **Bo'sh holatlar o'rgatadi:** har bir bo'sh ro'yxatda keyingi qadam tugmasi bo'ladi.
5. **Optimistic UI + aniq sinxron holati.** Pul summalarida hech qachon "eskirgan" raqam ko'rsatilmaydi: skeleton yoki aniq "yangilanmoqda".
6. **Har bir ekran 3 o'lchamda:** desktop, planshet, telefon. Kod bitta (responsive).
7. **Til va terminologiya:** bitta glossariy. UI matnini ishlab chiquvchi emas, product/UX yozuvchi yozadi va tasdiqlaydi.
8. **Global qidiruv + command palette** (`Ctrl+K`) — power-user'lar uchun.
9. **Accessibility:** WCAG AA kontrast, klaviatura navigatsiyasi.
10. **Global overlay'lar ≤ 2** (bildirishnoma + onboarding checklist). Eskida 25+ edi.

---

## 13. Mobil strategiya

**Bitta Expo ilova, rolga qarab 3 ta shell.** Kod, dizayn, auth, i18n va API klient umumiy (`packages/*`).

| Shell | v1 CORE | Keyinroq | Qilinmaydi |
|---|---|---|---|
| **Ota-ona / O'quvchi** (birinchi) | Ko'p farzand almashtirgich (QR yoki OTP bilan bog'lash); bugungi jadval; davomat tarixi + kelmasa push; balans/qarz/to'lov tarixi + chek; **onlayn to'lov**; baholar va imtihon natijalari; uy vazifasi holati; e'lonlar | Coins, support teacher band qilish | Ilova ichida darslik o'quvchi, PDF/Office viewer, kurs katalogi |
| **O'qituvchi** (barcha o'qituvchilar) | Bugungi darslar; davomat (**offline-first**); tez baholash; uy vazifasini tekshirish; o'quvchi haqida izoh; o'z ish haqi | Imtihon natijasini kiritish | Imtihon/sxema yaratish (web'da), 3 800 qatorli uchrashuv rejalashtiruvchi |
| **Owner** | Read-mostly dashboard: tushum, yig'ilish, qarzdorlar, yangi lidlar, churn, davomat %; filial almashtirgich; push alertlar; tasdiqlash (moderatsiya) | | Filial/kurs/xona CRUD, tarif sotib olish, xarajat kiritish, 6 tabli hisobotlar |

**Umumiy:** tenant aniqlash, SecureStore, push (FCM/APNs yoki OneSignal), offline o'qish uchun persist qilingan query cache, o'qituvchi davomati uchun outbox (idempotent mutatsiyalar), majburiy yangilanish tekshiruvi.

**Ota-ona uchun birinchi kanal — Telegram bot** (o'rnatish shart emas). Mobil ilova bot bilan bir xil backend endpoint'lardan foydalanadi.

---

## 14. Roadmap (bosqichlar)

Muddatlar jamoa hajmiga bog'liq. Quyida **ketma-ketlik** va har bosqich oxiridagi **chiqish mezoni** keltirilgan.

| Bosqich | Mazmun | Chiqish mezoni |
|---|---|---|
| **0. Poydevor** | Monorepo, CI darvozalari, token'lar + UI kutubxona (Storybook), OpenAPI pipeline, auth, multi-tenancy + RLS, audit log, Sentry | Bo'sh, lekin deploy qilinadigan "skelet"; lint/test/budjet darvozalari yashil |
| **1. O'quv yadrosi** | Filial, xodim, rol, kurs, xona, guruh + jadval, o'quvchi + ota-ona, enrollment hayot sikli, davomat | Markaz bir haftalik darslarni to'liq yurita oladi |
| **2. Pul yadrosi** | Ledger, billing engine (2 rejim), chegirma, to'lov + chek, qaytarish, xarajat, P&L, ish haqi | Billing engine property-testlardan o'tgan; 10 ta pul yo'li E2E yashil |
| **3. Savdo + xabarlar** | Lid pipeline, forma, rejalashtirilgan guruh, SMS shablon + triggerlar, dashboard, 4 hisobot | Lid → to'lov to'liq oqim ishlaydi |
| **4. Pilot (beta)** | 3–5 ta haqiqiy markaz, eski SOFF'dan import vositasi, onboarding checklist, obuna | Pilot markazlar 1 oy davomida eski tizimsiz ishlaydi |
| **5. Ota-ona** | Telegram bot, onlayn to'lov (Click/Payme/Uzum), mobil ilova (ota-ona + o'qituvchi shell) | Ota-onalarning X% i bot/ilova orqali to'laydi |
| **6. v1.x** | Kassa smenasi, moderatsiya, custom rollar, uy vazifasi, churn/xona hisobotlari, owner shell | |
| **7. Add-on'lar** | Analitika qaysi birini talab qilsa (coins, testlar, Face ID, AI…) | Har bir add-on o'chirilganda core testlari o'zgarishsiz yashil |

**Eski SOFF mijozlarini ko'chirish:** eski backend API'dan YolUp formatiga import vositasi (o'quvchilar, guruhlar, ochiq qarzlar boshlang'ich balans sifatida, ota-onalar). Uni 4-bosqichda tayyorlash kerak. Bu tayyor mijozlar bazasi — katta ustunlik.

---

## 15. Muvaffaqiyat metrikalari

| Metrika | Maqsad |
|---|---|
| Yangi markaz: ro'yxatdan o'tishdan birinchi to'lov qabul qilishgacha | < 30 daqiqa (self-serve) |
| Bitta guruh davomatini belgilash | < 10 soniya |
| To'lov qabul qilish (qidiruvdan chekkacha) | < 15 soniya |
| Moliyaviy nomuvofiqlik (support tiketlari) | 0 |
| Ota-onalarning bot/ilovaga ulanish darajasi | > 60% |
| Onlayn to'lovlar ulushi | 6 oyda > 30% |
| Web initial JS | < 300 KB gzip (eskida ~1.6–2.1 MB) |
| LCP (4G) | < 2.0 s |
| Oylik churn (markazlar) | < 3% |
| Haftalik faol xodimlar / jami xodimlar | > 70% |
| i18n qamrovi (4 til) | 100%, CI'da |
| Pul yo'llari E2E qamrovi | 100% |

---

## 16. Risklar

| Risk | Ehtimol | Ta'sir | Yumshatish |
|---|---|---|---|
| Scope o'sib ketadi ("eskida bor edi") | Yuqori | Yuqori | Ushbu hujjatdagi CORE/ADD-ON ro'yxati — rasmiy kelishuv. Yangi funksiya faqat pilot ma'lumoti bilan qo'shiladi |
| Billing engine'da xato | O'rta | Juda yuqori | Ledger, property-based testlar, pilotda eski tizim bilan parallel solishtirish |
| Backend jamoasi sig'imi | O'rta | Yuqori | Contract-first: frontend MSW mock bilan parallel ishlaydi |
| Eski mijozlarni ko'chirish qiyinligi | O'rta | O'rta | Import vositasi + boshlang'ich balanslar; har bir markazga ko'chirish hisoboti |
| Dizayn tizimi kechikadi va ekranlar "o'z-o'zidan" yoziladi | O'rta | Yuqori | 0-bosqich chiqish mezoniga kiritilgan; lint hex/inline style'ni bloklaydi |
| AI-generatsiya qilingan nazoratsiz kod (eskida `fix_meetings.py`, AI izohlari) | Yuqori | O'rta | Majburiy code review, fayl hajmi limiti, AI uchun bitta qisqa va dolzarb `CLAUDE.md` |
| Payme/Click/Uzum integratsiyasi va litsenziya talablari | O'rta | O'rta | Erta boshlash; to'lov provayderi abstraksiyasi |

---

## 17. Eski loyihada ZUDLIK bilan qilinishi kerak bo'lgan xavfsizlik ishlari

YolUp'dan **mustaqil** ravishda, eski SOFF CRM hali ishlab turganda quyidagilarni **darhol** qilish kerak:

1. **`web/crm-front/session_forwarder.session`** git'da turibdi. Bu Telethon SQLite fayli, ya'ni **jonli Telegram foydalanuvchi akkaunti sessiyasi**. Telegram'da sessiyani bekor qiling va faylni git tarixidan butunlay o'chiring.
2. **`TELEGRAM_BOT_TOKEN`** git tarixida qolgan (`48d3474df` va undan oldingi commitlar). BotFather orqali tokenni almashtiring.
3. **`docs/soffcrm_pentest_report_v1.0.docx`** repoda turibdi. Repoga kirish huquqi bor har kim zaifliklar ro'yxatini ko'radi. Faylni olib tashlang.
4. `next.config.js` dagi `images.remotePatterns: *` ni cheklang (ochiq image proxy).
5. `ReactQueryDevtools` ni production build'dan olib tashlang.
6. Obuna blokini va pul taqsimotini backendda majburiy qiling: `extra_payments` ni klientdan qabul qilmaslik, ish haqi PATCH'ini cheklash.
7. Mobil ilovalardagi production `test.*` host'larini almashtiring.
8. Deploy'ni `root` dan alohida foydalanuvchiga o'tkazing, prod va test serverlarini ajrating.

---

### Ilova: tahlil metodikasi

- Ekotizimdagi 6 ta loyihaning barcha route'lari, feature papkalari, tiplari va API chaqiruvlari o'qib chiqildi.
- 6 ta mustaqil domen auditi o'tkazildi: savdo, o'quv, moliya, platforma, texnik arxitektura, mobil + landing.
- Loyihaning o'z audit hujjatlari (`docs/STUDENT_DEBT_AUDIT.md`, `project-analysis.md`, `onboarding-analysis.md`, `performance-audit.md`) bilan solishtirildi.
- Barcha raqamlar `grep`/`wc` bilan sanalgan; taxminiy qiymatlar "~" bilan belgilangan.
- **Cheklov:** backend kodi tahlil qilinmadi. Billing cron, RLS va ruxsatlar bo'yicha xulosalar backend'ni ko'rgandan keyin tasdiqlanishi kerak.
