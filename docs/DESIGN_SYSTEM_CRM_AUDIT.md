# CRM dizayn tizimi va C-Panel auditi

**Holat:** tahlil va taklif, implementatsiya boshlanmagan.  
**Qo‘llanish:** YolUp CRM va alohida operator C-Panel.  
**Manbalar:** `web/src/shared/styles/design-tokens.css`, `mobile/src/shared/ui/ds-tokens.json`, `crm/src/index.css`, `crm/src/shared/ui/`, `crm/src/pages/operator/`.

## 1. Xulosa

CRM’da qayta ishlatiladigan UI asosi va Tailwind v3 mavjud, lekin u web/mobile dizayn tilidan mustaqil palitra va shriftlardan foydalanadi. C-Panel operator shell va routingdan tashqarida, vaqtinchalik bir sahifali ko‘rinishda ishlaydi. Yangi dizayn tizimini noldan boshlash shart emas: avval mavjud CRM komponentlarini inventarizatsiya qilib, web/mobile bilan umumiy semantik tokenlarga moslashtirish, keyin operator shell va sahifalarini ular ustiga qurish tavsiya etiladi.

## 2. Mavjud holat

- Web: asosiy rang `#4567F5`, ink `#24264D`, canvas `#F7F8FA`; Onest asosiy, Unbounded sarlavha shrifti. `web/src/shared/styles/design-tokens.css` semantik tokenlarni belgilaydi.
- Mobile: `ds-tokens.json` web tokenlaridan generatsiya qilinganini ko‘rsatadi; mobile mavzusi tokenlar va foydalanuvchi tanlagan accent bilan ishlaydi.
- CRM: `src/index.css`dagi alohida tokenlar (`--action: #0059E6`, `--text: #0A0F2D`, `--bg: #F4F6FB`); Inter va Manrope shriftlari; light/dark mavjud. `tailwind.config.ts` semantik nomlarni shu o‘zgaruvchilarga bog‘laydi. Bu farqni bir kunda butun CRM bo‘yicha almashtirish regres­siyaga olib kelishi mumkin.
- Tailwind CSS v3.4 va Radix paketlari bor. Shared UI’da shadcn uslubidagi o‘zimizga tegishli komponentlar bor, lekin `components.json` topilmadi; barcha komponentlarni standart shadcn generatsiyasi bilan boshqarilmoqda deb hisoblab bo‘lmaydi. Paket o‘rnatilgani uning shared wrapperi yoki ishlaydigan patterni mavjudligini anglatmaydi.
- `pages`, `modules`, `widgets` ichida xom HTML boshqaruvlari va lokal uslublar mavjud. `window.prompt` va `window.confirm` aynan operatorda ishlatilgan. Ayrim hardcoded ranglar va `bg-surface-2/60` kabi opacity shakllari mavjud; CSS variable asosidagi Tailwind opacity natijasi build va brauzerda alohida tekshirilishi kerak.
- `DataTable` umumiy komponenti bor, ammo hozir saralashdagi `aria-sort` va bosiladigan qatorlarning klaviatura bilan ishlashi kodda ko‘rinmaydi. Bu audit statik tahlil bo‘lib, yakuniy accessibility tekshiruvining o‘rnini bosmaydi.

## 3. Shared komponentlar inventari

| Holat | Komponentlar / qaror |
|---|---|
| Mavjud, qayta ishlatish va tekshirish | Button, Input, Textarea, native Select, Label/FormField, Switch, Card, Chip/StatusBadge, DataTable, Pagination, ListToolbar, SearchInput, Tabs, DropdownMenu, Progress, Avatar, Skeleton, EmptyState, PageHeader, StatCard, Kbd, Sheet, Dialog/ConfirmModal; Sonner toast. |
| Bor, lekin yetukligi tekshirilishi kerak | Dialog/sheet focus va close holatlari; DataTable keyboard/sort semantics va kichik ekran; form error/description bog‘lanishi; dark theme va kontrast; tanlash, loading, disabled va invalid holatlar. |
| Yo‘q yoki umumiy wrapper topilmadi | Tooltip wrapper, Checkbox, RadioGroup, Popover, Calendar/DatePicker/DateRangePicker, searchable Combobox, field-level async error pattern, error/retry state va confirmation bilan destructive action pattern. Zarur komponentlar haqiqiy ekran ehtiyojidan kelib chiqib qo‘shiladi. |

`Input type=date` brauzerning native date pickerini ishlatishi mumkin; bu umumiy DatePicker komponenti bor degani emas. Yangi date picker tanlashda klaviatura, locale (`uz`/`ru`), vaqt zonasi, sana formati, portal va mobil ishlashini tekshirish kerak. Tooltip faqat qo‘shimcha yordam uchun; muhim ma’lumot faqat hover orqali berilmaydi.

## 4. Dizayn yo‘nalishi — taklif

**Yagona brand, ikki ish muhiti:** web/mobile’dagi rang va semantik nomlar manba bo‘ladi; C-Panel va markaz CRM’da rolga mos navigatsiya va ish jarayoni bo‘ladi. C-Panel operatorga tegishli, markaz CRM tenant foydalanuvchisiga tegishli — mavjud backend ruxsatlari UI’da ham aks etadi.

| Semantik rol | Light uchun boshlang‘ich qiymat | Maqsad |
|---|---|---|
| `canvas` | `#F7F8FA` | Sahifa foni |
| `surface` | `#FFFFFF` | Karta, jadval, modal |
| `ink` | `#24264D` | Asosiy matn va sidebar |
| `ink-secondary` | `#626775` | Izoh va ikkilamchi matn |
| `border` | `#DCE0E6` | Ajratuvchi chiziqlar |
| `action` | `#4567F5` | Asosiy harakat / focus |
| `action-hover` | `#3A56E0` | Hover holati |
| `success` / `warning` / `danger` | `#2C9A78` / `#E09E1F` / `#E5484D` | Holatlar; matn ranglari alohida semantik tokenlarda |

Tipografiya: asosiy UI, shakl va jadvalda Onest; Unbounded faqat qisqa, yirik sarlavhalarda sinab ko‘riladi. Latin, o‘zbekcha va kirill gliflari hamda raqamlar ko‘rinishi tekshirilsin. Rang va shriftlar vizual taklif; WCAG kontrasti, focus, disabled va dark mode alohida o‘lchanadi, avtomatik qabul qilinmaydi.

O‘lchamlar uchun boshlang‘ich yo‘nalish: 4/8/12/16/24/32 px bo‘shliq shkalasi; input/button 40–44 px; 8–12 px radius; jadval qatori taxminan 52–56 px; desktop sidebar 240–256 px. Uzun sahifalarda jadval va forma o‘qilishi, kichik ekranlarda gorizontal scroll va drawer ochilishi tekshiriladi. Bularni komponent prototipida sinab, so‘ng aniq token sifatida qotirish kerak.

## 5. C-Panel: taklif etiladigan axborot arxitekturasi

Hozir `App` operator uchun `<OperatorPanel>`ni to‘g‘ridan-to‘g‘ri qaytaradi; ichki `mode` holati URL bilan bog‘liq emas. Alohida `/tenants` route fayli bor, lekin operatorning joriy render yo‘li undan foydalanmaydi. Shuning uchun refresh/deep link/back-forward va operatorga mos shellni qayta loyihalash zarur.

Taklif: `/cpanel` operator shell, `/cpanel/tenants` ro‘yxat, `/cpanel/tenants/:id` tafsilot, `/cpanel/audit` jurnal. Create/edit va subscription formalarini URL bilan boshqariladigan sheet yoki aniq sahifa ko‘rinishida ochish; block/unblock uchun tasdiq dialog; parolni tiklash uchun maxsus parol formasi (native prompt emas). Operator va tenant rollari uchun route guardlar va API ruxsatlari qayta tekshirilsin.

**Markazlar ro‘yxati:** sahifa sarlavhasi va bitta primary action; qidiruv + backend qo‘llaydigan filtrlar; jadval (nom/slug, tarif, obuna holati, limit, muddat, blok holati, amallar); sahifalash; loading, empty, error/retry holatlari. Telefon/kontrakt/region kabi rasmda ko‘ringan barcha ustunlar backendda bor deb qabul qilinmasin.

**Tafsilot:** umumiy ma’lumot, obuna/limit, direktorlar, foydalanish, operator jurnali. Backenddagi usage va audit pagination/filtr shartlarini alohida tekshirish. Block tasdig‘ida barcha sessiyalar tugashi va unblockdan keyin qayta login talab qilinishi tushuntiriladi. Parol maydoni `type=password`, vaqtinchalik parol siyosati va server xatolari bilan ishlaydi.

**Auth:** bitta asosiy kirish sahifasi; loading, noto‘g‘ri ma’lumot, bloklangan tenant, tarmoq xatosi; parolni ko‘rsatish/yashirish. Backend hali self-service resetni ta’minlamasa uni ishlaydigan havola sifatida ko‘rsatmaslik. `must_change_password` oqimi saqlanadi.

## 6. Ketma-ket ish rejasi

1. UI auditni brauzerda tasdiqlash: desktop/mobile, light/dark, keyboard, focus, screen reader, kontrast, loading/empty/error, 200% zoom. Operator va tenant rollari bilan tekshirish.
2. Token xaritasi va migratsiya: web/mobile tokenlarini semantik mapping orqali CRM’ga kiritish; deprecated aliaslarni vaqtincha saqlash; palette, typography, radius va focus ringni komponent namunalarida tasdiqlash. Qayta foydalaniladigan ranglarni `shared` darajasida qoldirish.
3. Komponent katalogi: mavjud komponentlarga variant va state jadvali; Tooltip, Checkbox, Radio, Popover, Calendar/DatePicker va Comboboxni faqat zarur bo‘lsa qo‘shish. Ko‘rgazmali dev sahifa yoki Storybookni tanlash; test rejasi va accessibility mezonlarini yozish.
4. Operator shell va routing: guard, deep link, refresh, history; C-Panel navigatsiyasi; tenant shell’dan ajratilgan ishlash muhiti.
5. C-Panel ekranlari: real backend kontraktiga mos ro‘yxat, tafsilot, create/edit, obuna, direktor, usage, audit, confirm va parol modallari; regressiya sinovlari.
6. Auth, so‘ng CRM dashboard/list/detail screens: ekranlarni bosqichma-bosqich yangi tokenlar va shared komponentlarga ko‘chirish; mavjud biznes oqimlari va API xatti-harakatlarini saqlash.
7. Backendga yangi talab aniqlansa, implementatsiyadan oldin alohida Markdown handoff: muammo, endpoint, request/response, ruxsat, validatsiya, tenant scope, xato va acceptance testlar. Backend o‘zgartirishlarini backend jamoasi bajaradi.

## 7. Vizual konsept haqida

Generatsiya qilingan rasm — uslub va kompozitsiyani muhokama qilish uchun konsept, tasdiqlangan dizayn yoki API shartnomasi emas. Undagi nomlar, statistika, menyular, kontrakt/to‘lovlar, filtr va ustunlar tasviriy namunalar. Backend operatoriga mavjud bo‘lmagan tenant ichki ma’lumotlarini ko‘rsatish huquqini bermaydi; implementatsiya haqiqiy ruxsatlar va kontraktga asoslanadi.
