# YolUp CRM ? Backend API Contract

**Audience:** Django backend and CRM frontend teams  
**Contract:** CRM integration v1, 11 November 2026  
**Status:** Integration baseline; outstanding decisions and frontend changes are identified below.

This contract describes the current CRM client and the required backend behavior. The historical domain notes below are useful for workflows and examples, but **their wire formats, authentication, pagination and security statements are superseded by this section**. Do not implement an endpoint solely from an old example: verify its current request and response fields against the CRM sources listed below. The mock is a prototype, not an authorization or accounting implementation.

## 1. Connection and wire format

- All endpoint paths are relative to the configured `VITE_API_URL`; the current default is `http://localhost:8000/api`. The backend may expose `/api/v1` if deployment sets `VITE_API_URL` accordingly. All paths end in `/`.
- JSON field names use `snake_case`. Send JSON with `Content-Type: application/json`; use `multipart/form-data` only for upload calls and binary for receipt downloads. IDs are opaque strings; do not require frontend-generated UUIDs.
- Return **unwrapped JSON**: an object for detail/create/update/action responses, or the object expected by the individual call. Do not wrap responses in `success`, `data` or `request_id`. A request ID may be returned as an HTTP header.
- List endpoints consumed through `http.list` return page-number pagination, including empty lists:

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

`page` is 1-based, `page_size` controls page size, `search` is a search string, `ordering` is a field name with optional `-` prefix for descending order, and endpoint-specific filters are exact matches unless documented otherwise. `count` is the filtered total before pagination. `next` and `previous` are URLs or null. Respect requested page size within a documented server limit; the UI also requests large lists for selectors.
- Successful create returns `201` and the created object; GET/PATCH returns `200` and the object; DELETE returns `204` with no body. PATCH is partial: omitted fields stay unchanged; `null` clears nullable fields. Use real booleans and integers in JSON. Dates are `YYYY-MM-DD`; timestamps are ISO 8601 with timezone. Group weekdays use JavaScript numbering: Sunday `0` through Saturday `6`.
- Errors follow the DRF shape understood by the client, for example `{"detail":"Not found."}`, `{"phone":["Already in use."]}`, or `{"non_field_errors":["Invalid input."]}`. Use 400 for validation, 401 for missing/expired authentication, 403 for forbidden, 404 for inaccessible/not found, 409 for state conflicts, 429 for rate limits, and 5xx for server failures. Do not return secrets in errors. An optional machine-readable code must not replace `detail` or field errors.
- The client does not send `Idempotency-Key`. Do not require it from this version. Support it optionally and implement transactional constraints on the server; safe retries of financial writes require a future agreed client change.

## 2. Tenant and authorization contract

YolUp is B2B and multi-tenant. Every authenticated tenant-scoped CRM request **must ultimately send** `X-Tenant-Id: <tenant-id>`; an optional `X-Branch-Id` narrows the branch context. The backend validates the bearer token, tenant membership, branch membership and authorization for every operation, and scopes every lookup, write, relation, aggregate, export and background task to that tenant. A caller-supplied tenant or branch ID is never proof of access. Reject missing or mismatched context; never fall back to another tenant. Cross-tenant IDs must not reveal data.

**Integration blocker:** `src/shared/api/axios.ts` currently adds only `Authorization`. It does **not** send tenant or branch headers, and the current refresh request uses a separate Axios call. Tenant/branch IDs have storage helpers but are not established by the login flow. Therefore a backend that strictly requires the header cannot work with the unchanged client. Login, refresh, password reset and any global operator endpoints also cannot universally require a tenant header before a tenant has been established. Define bootstrap and global operator behavior explicitly; do not silently weaken isolation. Frontend work or an explicitly designed trusted gateway is required before enforcing this header for the current CRM.

Tenant IDs are available on the authenticated user returned by `/auth/me/`. The backend must enforce role and object scope independently of UI visibility: teachers see their assigned groups and related students/lessons/attendance; students see their own records; parents see only linked students; manager access remains within the authorized tenant and branches. Operator tenant management is a separate privileged scope and must not grant ordinary CRM users global access. Reject cross-tenant foreign keys, including nested relations, even when their IDs exist.

## 3. Authentication: current client compatibility

| Operation | Request | Successful response |
| --- | --- | --- |
| `POST /auth/login/` | `{"identifier":"...","password":"..."}` | `{"access":"...","refresh":"..."}` |
| `POST /auth/refresh/` | `{"refresh":"..."}` | `{"access":"...","refresh":"..."}` |
| `GET /auth/me/` | Bearer access token | Direct user object, not `{user: ...}` |
| `POST /auth/logout/` | Bearer access token and `{}` | 200 or 204 |

`/auth/me/` must provide `id`, `tenant_id`, `role`, `first_name`, `last_name`, `phone`, `is_active`, `is_email_verified`, `is_phone_verified`, `created_at`, `updated_at`, and `permissions`; `branch_id`, `middle_name`, `email`, `avatar_url`, and `last_login_at` may be null. Include `student_id` for a student and `linked_student_ids` for a parent. Supported UI roles are `ceo`, `admin`, `teacher`, `parent`, `student`.

The current client stores both tokens in localStorage and sends refresh in the JSON body. This carries XSS risk; HTTP-only cookies and memory-only access tokens require a coordinated frontend change and cannot be claimed as the current contract. Use short-lived access tokens, protect login against brute force and hash passwords. The client sends no refresh token at logout: if server-side refresh revocation is required, associate a session identifier with the access token and revoke that session, or agree a frontend change. Never expose or recover a user's actual password. Administrative resets must be authorized, audited and require a password change or secure reset flow.

Login has no tenant selector; define unique identity resolution across tenants before launch. If an identity can belong to several tenants, a tenant-selection flow needs a frontend change. Public authentication endpoints are exempt from the tenant-header rule until context is established.

## 4. Implementation sources and scope

The actual integration surface is `src/shared/api/endpoints.ts`, the request methods in `src/modules/*/api/*-api.ts`, `src/core/auth/api/auth-queries.ts`, and the corresponding `model/types.ts` and `model/schemas.ts`. Those files define exact field names, nullable values, filters and action payloads. `src/shared/api/mock/mock-adapter.ts` and `demo-data.ts` provide examples of the shapes the screens currently consume; backend validation and security must be stronger than the mock. The frontend's fixed permission map is UI behavior, not server authorization.

Prioritize the screens actually using these calls: authentication and center settings; branches, rooms, users, students, parents and links; courses, groups, teachers, enrollments, schedules, lessons and attendance; leads and catalogs; finance; dashboard and reports. Endpoint constants alone do not prove a feature is used or complete. Features in the historical notes such as third-party SMS, public lead forms, custom roles and global C-Panel need product confirmation before being treated as MVP commitments.

For list/detail responses include the fields in the frontend types, including read-only related names and counts expected by the UI. For list relations use the same paginated shape where the frontend uses `http.list`; do not replace it with a bare array. Follow the request payloads from each form schema, including money conversion to integer tiyin. Backend must validate all fields and tenant ownership regardless of client validation. Group scheduling, capacity, enrollment history and lead conversion rules in the domain notes remain useful, subject to reconciliation with current schemas and mock.

## 5. Finance and safe delivery

Money is represented as integer tiyin; enforce bounds compatible with JavaScript safe integers for JSON numbers. The backend owns balances and must compute student balances and debt views consistently. Validate payment amounts and ownership, and atomically record payments, allocation and balance changes. Enforce database constraints for duplicate attendance, enrollments and generated lessons as applicable, and protect concurrent updates with transactions. Never rely on the mock's in-memory state as the financial source of truth.

**Open product decisions before production finance:** precise refund and reversal effects on balances and allocations; charge adjustments and deletion after payment; discount timing; rounding and allocation when amounts are partial; immutable audit records and reconciliation; duplicate submission handling without an idempotency key. The historical formula `payments ? charges` does not by itself specify refunds or reversals. Agree and test these rules before deploying real money flows.

## 6. Handoff acceptance checks

1. Configure the CRM base URL and disable mock mode; verify login, `/auth/me/`, refresh and logout against real responses.
2. Resolve the tenant-header integration blocker and identity bootstrap. Test missing, forged and cross-tenant headers, cross-tenant object IDs and branch access for reads and writes.
3. Contract-test every active screen's request, response fields, filters, paging and error shape against current TypeScript types and schemas. Test empty lists, nullable fields and related display names.
4. Test role-scoped access directly through the API, including teacher, parent and student restrictions.
5. Test transaction rollback, concurrent enrollment/attendance, finance calculations and duplicate submissions. Resolve the open finance decisions first.

---

# Historical domain notes (reference only)

The following original specification contains domain examples and proposed workflows. Its response envelopes, cursor pagination, mandatory idempotency headers, cookie authentication and legacy endpoint paths are **not the current integration contract**. Examples may contain fields that differ from current frontend types. Use sections 1?6 above and current CRM source for integration; reconcile each domain example before implementation.

# YolUp — Backend API Specification (Phase 1 MVP)

**Target:** Django backend team  
**Frontend:** React SPA at `edu_front/crm`  
**Version:** 1.0 (Phase 1 MVP)  
**Date:** 2026-10-16  
**Status:** Ready for implementation

---

## Table of Contents

1. [General Rules](#1-general-rules)
2. [Multi-Tenancy & C-Panel](#2-multi-tenancy--c-panel)
3. [Authentication & RBAC](#3-authentication--rbac)
4. [Branches & Rooms](#4-branches--rooms)
5. [Users & Relations](#5-users--relations)
6. [Groups & Schedules](#6-groups--schedules)
7. [Lead Management (CRM Pipeline)](#7-lead-management-crm-pipeline)
8. [Academic & Attendance](#8-academic--attendance)
9. [Finance & Billing](#9-finance--billing)
10. [Payroll System](#10-payroll-system)
11. [Messaging & Notifications](#11-messaging--notifications)
12. [Reports](#12-reports)
13. [Error Format & Envelope](#13-error-format--envelope)
14. [Appendix: Role-Permission Matrix](#14-appendix-role-permission-matrix)

---

<a name="1-general-rules"></a>
## 1. General Rules

### 1.1 Base URL
```
Production : https://api.yolup.uz/api/v1
Development: http://localhost:8000/api/v1
```

All paths in this document are relative to `/api/v1/`.

### 1.2 Multi-tenancy header
Every request **must** include:
- `Authorization: Bearer <access_token>`
- `X-Tenant-Id: <tenant_uuid>` — identifies the educational center
- `X-Branch-Id: <branch_uuid>` — optional, identifies the branch within tenant
- `Idempotency-Key: <uuid>` — required on all mutating requests (POST/PUT/PATCH)

The backend enforces **row-level isolation** by `tenant_id`. A user can never read/write another tenant's data.

### 1.3 Response envelope
Every successful response:
```json
{
  "success": true,
  "data": { ... },
  "request_id": "uuid"
}
```
List responses use cursor pagination:
```json
{
  "success": true,
  "data": {
    "count": 100,
    "next": "http://...?cursor=...",
    "previous": null,
    "results": [ ... ]
  },
  "request_id": "uuid"
}
```

### 1.4 Error envelope
All errors (4xx/5xx):
```json
{
  "success": false,
  "error": {
    "code": "permission_denied",
    "message": "Sizning rolingizda bu amal uchun ruxsat yo'q.",
    "details": {}
  },
  "request_id": "uuid"
}
```
Frontend matches on `error.code`, **never** on error message text. Money is always in **tiyin** (1 som = 100 tiyin) as `bigint`/`integer` — never float.

### 1.5 Roles (MVP — 5 strict + future custom)
| Role | Uzbek | Purpose |
|------|-------|---------|
| `ceo` | Bosh direktori | Full access incl. subscription, rollar, C-Panel sync |
| `admin` | Admin | Daily ops: students, groups, finance, leads |
| `teacher` | O'qituvchi | Own groups, attendance, grades, today's schedule |
| `parent` | Ota-ona | Linked students only (portal/bot) |
| `student` | O'quvchi | Own data only (portal/bot) |

Custom roles (`"resource.action"` permissions stored in DB) are **v1.x** — MVP uses the 5 strict roles only.

---

<a name="2-multi-tenancy--c-panel"></a>
## 2. Multi-Tenancy & C-Panel

C-Panel is the **internal operator app** (SOFF/YolUp operator) — separate from center CRM. It manages tenants globally.

### 2.1 Tenant CRUD

#### `POST /tenants/` — Create tenant (center)
**Permission:** `tenants.create` (C-Panel operator / super_admin)

Request:
```json
{
  "name": "O'quv Markazi No.1",
  "slug": "markaz-1",
  "phone": "+998901234567",
  "email": "info@markaz1.uz",
  "address": "Toshkent sh., Navoiy ko'chasi 15",
  "currency": "UZS",
  "timezone": "Asia/Tashkent",
  "subscription_tier": "basic",
  "max_students": 100
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "O'quv Markazi No.1",
    "slug": "markaz-1",
    "phone": "+998901234567",
    "email": "info@markaz1.uz",
    "address": "Toshkent sh., Navoiy ko'chasi 15",
    "currency": "UZS",
    "timezone": "Asia/Tashkent",
    "subscription_tier": "basic",
    "subscription_status": "trial",
    "subscription_expires_at": "2026-11-16T00:00:00Z",
    "max_students": 100,
    "is_blocked": false,
    "created_at": "2026-10-16T10:00:00Z",
    "updated_at": "2026-10-16T10:00:00Z"
  },
  "request_id": "..."
}
```

#### `GET /tenants/` — List tenants
**Permission:** `tenants.view`

Query: `?search=`, `?status=`, `?subscription_tier=`, `?is_blocked=`, `?page=`, `?page_size=`

Response: paginated list of Tenant objects.

#### `GET /tenants/{id}/` — Retrieve tenant
**Permission:** `tenants.view`

Response: single Tenant object.

#### `PATCH /tenants/{id}/` — Update tenant
**Permission:** `tenants.update`

Request (partial):
```json
{
  "name": "Yangilangan nomi",
  "subscription_tier": "standard"
}
```

#### `POST /tenants/{id}/block/` — Block tenant
**Permission:** `tenants.block`

Body: `{}`  
Effect: `is_blocked = true`, all users of tenant cannot log in (403 on auth).

#### `POST /tenants/{id}/unblock/` — Unblock tenant
**Permission:** `tenants.unblock`

Body: `{}`

#### `POST /tenants/{id}/subscription/` — Set subscription tier
**Permission:** `tenants.manage_subscription`

Request:
```json
{
  "subscription_tier": "professional",
  "max_students": 300,
  "expires_at": "2027-10-16T00:00:00Z"
}
```

### 2.2 Center self-service profile (`/settings/center/`)

The tenant owner/admin edits the center's own profile from **Sozlamalar → Markaz**
(not the C-Panel). This is a **singleton** resource — no list, no `POST`, no `DELETE`
(the tenant is created by the C-Panel).

#### `GET /settings/center/`
**Permission:** `settings.view`

Response:
```json
{
  "id": "uuid",
  "name": "Yolup Learning Center",
  "legal_name": "MChJ \"Yolup Learning\"",
  "phone": "+998 71 200 10 10",
  "email": "info@yolup.uz",
  "address": "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 12",
  "work_hours_from": "08:00",
  "work_hours_to": "21:00",
  "language": "uz",
  "currency": "UZS",
  "updated_at": "2026-10-16T09:00:00Z"
}
```

#### `PATCH /settings/center/`
**Permission:** `settings.update`

Request: any subset of the fields above.

Validation:
- `name` — required, non-empty.
- `language` — `uz | ru | en`.
- `currency` — `UZS | USD | RUB`.
- `work_hours_from` / `work_hours_to` — `HH:MM` (24h).
- Optional strings (`legal_name`, `phone`, `email`, `address`) accept `null`.

Response: the updated object (same shape as `GET`).

---

<a name="3-authentication--rbac"></a>
## 3. Authentication & RBAC

### 3.1 Login

#### `POST /auth/login/`
**Permission:** public (no auth required)

Request:
```json
{
  "identifier": "+998901234567",
  "password": "securePassword123"
}
```
`identifier` may be phone or email.

Response (200):
```json
{
  "success": true,
  "data": {
    "access": "eyJ...access_token",
    "refresh": "eyJ...refresh_token",
    "user": {
      "id": "uuid",
      "tenant_id": "uuid",
      "branch_id": "uuid",
      "role": "teacher",
      "first_name": "Ali",
      "last_name": "Valiyev",
      "phone": "+998901234567",
      "email": "ali@example.uz",
      "permissions": ["groups.view", "attendance.create", "payments.view"],
      "is_active": true
    },
    "tenant": { ...Tenant... },
    "branch": { ...Branch... } | null
  },
  "request_id": "..."
}
```

**Security:** access token short-lived (15 min), refresh token 7 days, rotation enabled. Access token in memory; refresh in httpOnly cookie (backend sets cookie) — frontend must **not** store tokens in localStorage.

### 3.2 Token Refresh

#### `POST /auth/token/refresh/`
**Permission:** public (requires valid refresh)

Request:
```json
{
  "refresh": "eyJ...refresh_token"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "access": "eyJ...new_access_token",
    "refresh": "eyJ...new_refresh_token"
  }
}
```

### 3.3 Logout

#### `POST /auth/logout/`
**Permission:** authenticated

Request: `{}`  
Blacklists refresh token.

### 3.4 Me

#### `GET /auth/me/`
**Permission:** authenticated

Response: current `UserWithRole` + `Tenant` + `Branch`.

The role drives the whole UI: `ROLE_PERMISSIONS` (frontend) maps the five
fixed roles to a permission list, the sidebar is filtered by it, and the
landing page differs per role:

| Role | Landing | Sees |
| --- | --- | --- |
| `ceo`, `admin` | `/` — centre dashboard | everything |
| `teacher` | `/cabinet` | own groups/lessons/students + attendance |
| `student` | `/cabinet` | own groups, attendance, charges, payments |
| `parent` | `/cabinet` | linked children and their attendance/finance |

`student` users also carry `student_id` (their `Student` record) and `parent`
users carry `linked_student_ids` — the cabin reads them from this endpoint, so
the backend must include both fields for those roles.

```json
{
  "id": "user-uuid",
  "role": "student",
  "first_name": "Aziz",
  "last_name": "Toshmatov",
  "permissions": [],
  "student_id": "student-uuid"
}
```

> **Mock note.** Until a backend exists, the mock `POST /auth/login/` does not
> verify the password but **resolves the role from the identifier**
> (`admin`, `nodira.ahmedova`, `dilnoza.yusupova`, `student`, `parent`) and
> encodes the user id into the access token, so `/auth/me/` restores the same
> session after a reload. The login screen exposes those five accounts as
> one-click chips.

### 3.5 Password Reset (user-initiated)

#### `POST /auth/password-reset/request/`
**Permission:** public

Request:
```json
{
  "identifier": "+998901234567"
}
```
Sends OTP via SMS/Telegram. Always returns 200 (user enumeration protection).

#### `POST /auth/password-reset/confirm/`
**Permission:** public (requires valid OTP token)

Request:
```json
{
  "token": "otp_token_here",
  "new_password": "NewSecure123!"
}
```

### 3.6 Password Override (admin view/reset) — MVP requirement

Admins can **view/reset** passwords for teachers, parents, students (not for CEO/admin).

#### `GET /auth/users/{id}/password/`
**Permission:** `users.view_password` (admin/ceo only)

Response:
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "masked_password": "••••••••",  // or actual if policy allows
    "can_reset": true
  }
}
```

#### `POST /auth/password/override/`
**Permission:** `users.override_password` (admin/ceo only)

Request:
```json
{
  "target_user_id": "uuid",
  "new_password": "NewTemp123!"
}
```
Logs an `AuditLog` entry: admin overrode password for user X.

### 3.7 Permissions registry

Permissions stored as `"resource.action"` strings. Example keys:
- `tenants.create`, `tenants.view`, `tenants.update`, `tenants.block`, `tenants.manage_subscription`
- `branches.create`, `branches.view`, `branches.update`, `branches.delete`
- `rooms.create`, `rooms.view`, `rooms.update`, `rooms.delete`
- `users.create`, `users.view`, `users.update`, `users.delete`, `users.view_password`, `users.override_password`
- `students.create`, `students.view`, `students.update`
- `parents.create`, `parents.view`, `parents.update`
- `groups.create`, `groups.view`, `groups.update`, `groups.delete`, `groups.enroll`
- `courses.create`, `courses.view`, `courses.update`
- `schedule.create`, `schedule.view`
- `lessons.create`, `lessons.view`, `lessons.update`
- `enrollments.create`, `enrollments.view`, `enrollments.update`
- `attendance.view`, `attendance.create`, `attendance.bulk`
- `assessments.create`, `assessments.view`, `scores.create`, `scores.view`
- `leads.create`, `leads.view`, `leads.update`, `leads.convert`, `lead_sources.view`, `lead_loss_reasons.view`, `lead_forms.view`
- `payments.create`, `payments.view`, `payments.refund`, `payments.receipt`
- `charges.view`, `charges.create`, `charges.update`, `charges.delete`
- `debts.view`
- `payment_methods.view`, `payment_methods.create`, `payment_methods.update`, `payment_methods.delete`
- `discounts.create`, `discounts.view`, `refunds.view`
- `expenses.create`, `expenses.view`, `expense_categories.view`
- `cash_shifts.open`, `cash_shifts.view`, `cash_shifts.close`
- `pnl.view`
- `payroll.view`, `payroll.create`, `payroll.adjustment`, `payroll.lock`, `payroll.pay`
- `message_templates.create`, `message_templates.view`, `automation_rules.create`, `automation_rules.view`, `message_logs.view`, `sms.send`
- `roles.view`, `roles.manage` (v1.x custom roles)
- `audit_logs.view`, `approval_requests.view`, `approval_requests.decide`
- `reports.view`

---

<a name="4-branches--rooms"></a>
## 4. Branches & Rooms

Used for conflict-free schedule generation (room × time-slot collision detection).

### 4.1 Branches

#### `GET /branches/`
**Permission:** `branches.view`

Query: `?search=`, `?is_active=`, `?page=`, `?page_size=`

Response: paginated Branch list.

#### `POST /branches/`
**Permission:** `branches.create`

Request:
```json
{
  "name": "Markaz filiali — Chorsu",
  "code": "CHR",
  "address": "Toshkent, Chorsu bo'bori 101",
  "phone": "+998712345678",
  "is_active": true
}
```

#### `GET /branches/{id}/`
**Permission:** `branches.view`

#### `PATCH /branches/{id}/`
**Permission:** `branches.update`

#### `DELETE /branches/{id}/`
**Permission:** `branches.delete`  
Soft-delete (sets `is_active = false`).

### 4.2 Rooms

#### `GET /rooms/`
**Permission:** `rooms.view`

Query: `?branch_id=`, `?search=`, `?is_active=`

Response: paginated Room list.

#### `POST /rooms/`
**Permission:** `rooms.create`

Request:
```json
{
  "branch_id": "uuid",
  "name": "DARS XONA 101",
  "capacity": 25,
  "is_active": true
}
```

#### `GET /rooms/{id}/` | `PATCH` | `DELETE`
**Permission:** `rooms.view` / `rooms.update` / `rooms.delete`

---

<a name="5-users--relations"></a>
## 5. Users & Relations

Staff (teachers, admins), students, and parents. Parent↔Student links support one parent ↔ many students.

### 5.1 Users (staff)

#### `GET /users/`
**Permission:** `users.view`

Query: `?role=`, `?branch_id=`, `?search=`, `?is_active=`

#### `POST /users/`
**Permission:** `users.create`

Request:
```json
{
  "branch_id": "uuid",
  "role": "teacher",
  "first_name": "Gulnoza",
  "last_name": "Karimova",
  "middle_name": "Erkinovna",
  "phone": "+998901234567",
  "email": "gulnoza@markaz.uz",
  "password": "TempPass123!"
}
```

- `password` is required on create (min 6 characters).
- `phone` must be unique **within the tenant** → `400` otherwise:
```json
{ "phone": ["Bu telefon raqam allaqachon band"] }
```

#### `GET /users/{id}/` | `PATCH` | `DELETE`
**Permission:** `users.view` / `users.update` / `users.delete`

- `phone` uniqueness is re-checked on update (ignoring the record itself).
- `password` **omitted or empty = leave unchanged** (dedicated reset flow handles
  password changes).
- Deleting your **own** account is rejected:
```json
{ "detail": "O'z hisobingizni o'chira olmaysiz" }
```

### 5.2 Students

#### `GET /students/`
**Permission:** `students.view`

Query: `?search=`, `?status=`, `?group_id=`, `?branch_id=`, `?has_debt=`, `?page=`, `?page_size=`

Response: paginated Student list with `balance_tiyin`.

#### `POST /students/`
**Permission:** `students.create`

Request:
```json
{
  "first_name": "Jasur",
  "last_name": "Rahmonov",
  "middle_name": "Otabekovich",
  "phone": "+998931234567",
  "email": "jasur@example.uz",
  "birth_date": "2010-05-12",
  "gender": "male",
  "address": "Toshkent, Chilonzor 42"
}
```

#### `GET /students/{id}/` | `PATCH`
**Permission:** `students.view` / `students.update`

### 5.3 Parents

#### `GET /parents/`
**Permission:** `parents.view`

#### `POST /parents/`
**Permission:** `parents.create`

Request:
```json
{
  "first_name": "Dilnoza",
  "last_name": "Rahmonova",
  "middle_name": "Erkinovna",
  "phone": "+998909876543",
  "email": "dilnoza@example.uz",
  "relation": "mother"
}
```

### 5.4 Parent ↔ Student links

#### `GET /parent-student-links/`
**Permission:** `parents.view`

Query: `?parent_id=`, `?student_id=`

Response:
```json
{
  "success": true,
  "data": {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": "uuid",
        "parent_id": "uuid",
        "student_id": "uuid",
        "is_primary": true,
        "created_at": "2026-10-16T10:00:00Z"
      }
    ]
  }
}
```

#### `POST /parent-student-links/`
**Permission:** `parents.manage_links`

Request:
```json
{
  "parent_id": "uuid",
  "student_id": "uuid",
  "is_primary": true
}
```

**Rule:** one parent may link to multiple students; one student may have multiple parents. `is_primary` marks the main contact for SMS.

#### `DELETE /parent-student-links/{id}/`
**Permission:** `parents.manage_links`

---

<a name="6-groups--schedules"></a>
## 6. Groups & Schedules

Course creation, group management, teacher assignment, rooms, weekly schedule slots. Conflict detection: room cannot be double-booked for same time.

### 6.1 Courses

#### `GET /courses/` — List courses
**Permission:** `courses.view`

#### `POST /courses/` — Create course
**Permission:** `courses.create`

Request:
```json
{
  "name": "Ingliz tili (B1)",
  "code": "ENG-B1",
  "description": "O'quvchilar uchun B1 darajasi",
  "price_tiyin": 45000000,
  "duration_months": 4,
  "lessons_count": 48,
  "is_active": true
}
```

### 6.2 Groups

#### `GET /groups/`
**Permission:** `groups.view`

Query: `?branch_id=`, `?course_id=`, `?teacher_id=`, `?status=`, `?search=`

Response: paginated Group list.

#### `POST /groups/`
**Permission:** `groups.create` — **faqat `ceo` va `admin`**. O'qituvchi/o'quvchi/ota-ona `403`.

Request:
```json
{
  "branch_id": "uuid",
  "course_id": "uuid",
  "name": "Ingliz B1 — Guruh A",
  "color": "#3B82F6",
  "room_id": "uuid",
  "capacity": 20,
  "price_tiyin": 45000000,
  "start_date": "2026-11-02",
  "end_date": "2027-02-28",
  "billing_mode": "monthly_calendar",
  "status": "active",
  "schedule": [
    { "day_of_week": 1, "start_time": "18:00", "end_time": "19:30" },
    { "day_of_week": 3, "start_time": "18:00", "end_time": "19:30" },
    { "day_of_week": 5, "start_time": "18:00", "end_time": "19:30" }
  ]
}
```

- `schedule[].day_of_week` — JS `getDay()` (0 = Yakshanba, 1 = Dushanba … 6 = Shanba).
- `start_time` / `end_time` — `HH:MM` (24 soat). `end_time > start_time`.
- `room_id` — ixtiyoriy, filialga tegishli xona bo'lishi shart.
- `capacity` — `0` = cheklanmagan; faol guruhga a'zo qo'shishda tekshiriladi.
- `schedule_label` **hisoblanadi** (`"Du · Chor · Jum · 18:00–19:30"`), uni klient yubormaydi.
- `status == "active"` bo'lsa kamida bitta slot majburiy; `planned/completed` uchun bo'sh bo'lishi mumkin.
- Jadvаl slotlari asosida kelgusi darslar (`/lessons/`) generatsiya qilinadi; jadval
  o'zgarsa, belgilanmagan kelgusi darslar almashtiriladi.

#### `GET /groups/{id}/` | `PATCH` | `DELETE`
**Permission:** `groups.view` / `groups.update` / `groups.delete` — yozish faqat `ceo`/`admin`.
O'qituvchi o'z guruhini faqat o'qiydi (`403` yozishda).

#### `POST /groups/{id}/enroll/`
**Permission:** `groups.update` — faqat `ceo`/`admin`.

Request:
```json
{
  "student_id": "uuid",
  "status": "trial"
}
```

Tekshiruvlar: guruh va o'quvchi mavjudligi, takroriy a'zolik yo'qligi,
`capacity` (agar `> 0`) va `students_count` sinxronizatsiyasi. To'lgan guruhda
`400 { "detail": "Guruh to'lgan (20/20) — bo'sh joy yo'q" }`.

#### `GET /groups/{id}/teachers/`
**Permission:** `groups.view`

#### `GET /groups/{id}/schedule/`
**Permission:** `schedule.view`

Returns weekly slots with room assignments.

#### `GET /groups/{id}/students/`
**Permission:** `groups.view`

Returns enrollments with student info and status.

### 6.2.1 Enrollments

#### `GET /enrollments/`
**Permission:** `enrollments.view`

Query: `?student_id=`, `?group_id=`, `?status=`

Used by the **student and parent cabins** to list "my groups". Each row is
inlined with `group_name`, `teacher_name` and `schedule_label` so the cabinet
does not need extra round-trips (names always reflect the catalogue, not a
copied snapshot).

```json
{
  "id": "enrollment-uuid",
  "student_id": "student-uuid",
  "group_id": "group-uuid",
  "status": "active",
  "joined_at": "2026-02-01T09:00:00Z",
  "group_name": "Ingliz tili — Beginner A1",
  "teacher_name": "Dilnoza Yusupova",
  "schedule_label": "Du · Chor · Jum · 11:00"
}
```

#### `POST /enrollments/`
**Permission:** `enrollments.create` — faqat `ceo`/`admin`.

`POST /groups/{id}/enroll/` bilan **bir xil qoidalar**: guruh/o'quvchi mavjudligi,
takroriy a'zolik, sig'im (`capacity > 0`) va `students_count` sinxronizatsiyasi.
Yaratishda `student_name` inline qaytadi.

Ruxsat etilgan holatlar: `trial`, `active`, `frozen`, `left`, `completed`.
Noto'g'ri holat — `400`.

#### `GET /enrollments/{id}/` | `PATCH /enrollments/{id}/` | `DELETE /enrollments/{id}/`
**Permission:** `enrollments.view` / `enrollments.update` / `enrollments.delete` — yozish faqat `ceo`/`admin`.

Patching `status` (yoki o'chirish) guruhning `students_count` ini va o'quvchining
joriy `group_name` ini qayta hisoblaydi. `left`/`completed` a'zolar sig'imga
kirmaydi va davomat ro'yxatida ko'rinmaydi.

### 6.2.2 Role scoping (server-side)

Teachers only see their own data. The backend must scope these querysets by
`request.user` when `role == "teacher"`:

| Endpoint | Scope |
| --- | --- |
| `GET /groups/`, `GET /groups/{id}/` | `teacher_id == request.user.id` |
| `GET /lessons/` | lessons whose group belongs to the teacher |
| `GET /students/` | students enrolled in the teacher's groups |
| `GET /attendance/` | attendance of the teacher's groups |

`ceo` and `admin` are unscoped. Outside the scope a detail request returns
`404` (not `403`) so resource existence is not leaked.

### 6.3 Group teachers

#### `POST /groups/{id}/teachers/`
**Permission:** `groups.update`

Request:
```json
{
  "user_id": "uuid",
  "role": "main",
  "pay_rule": "percentage",
  "pay_value_tiyin": 3000000
}
```

### 6.4 Schedule slots

#### `GET /schedule-slots/`
**Permission:** `schedule.view`

Query: `?group_id=`, `?room_id=`, `?day_of_week=`

#### `POST /schedule-slots/`
**Permission:** `schedule.create`

Request:
```json
{
  "group_id": "uuid",
  "room_id": "uuid",
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "10:30"
}
```
Backend validates: room not already booked for that day/time (conflict-free), teacher not double-booked.

#### `PATCH /schedule-slots/{id}/` | `DELETE /schedule-slots/{id}/`
**Permission:** `schedule.update` / `schedule.delete`

### 6.5 Lessons (generated from schedule)

#### `GET /lessons/`
**Permission:** `lessons.view`

Query: `?group_id=`, `?date_from=`, `?date_to=`, `?status=`

Response: list of Lesson (each with date, room, topic, status).

#### `POST /lessons/`
**Permission:** `lessons.create`

Request:
```json
{
  "group_id": "uuid",
  "room_id": "uuid",
  "title": "Dars 5 — Present Simple",
  "starts_at": "2026-11-02T09:00:00Z",
  "ends_at": "2026-11-02T10:30:00Z",
  "topic": "Present Simple tense"
}
```

#### `GET /lessons/{id}/attendance/`
**Permission:** `attendance.view`

Returns attendance records for all enrollments in that lesson.

### 6.6 Days off (holidays)

Consumed by schedule/lesson generation and shown in **Sozlamalar → Dam olish kunlari**.

#### `GET /days-off/`
**Permission:** `days_off.view`

Query: `?branch_id=`, `?page=`, `?page_size=`

A `branch_id` of `null` means the day off applies to the **whole center**;
otherwise it only affects that branch. Filters also accept `?branch_id__isnull=true`.

#### `POST /days-off/`
**Permission:** `days_off.create`

Request:
```json
{
  "name": "Navro'z bayrami",
  "date_from": "2026-03-21",
  "date_to": "2026-03-23",
  "branch_id": null,
  "note": "Uch kunlik bayram"
}
```
Validation: `date_from` required, `date_to >= date_from` → `400`
`{ "date_to": ["Tugash sanasi boshlanishdan oldin bo'lishi mumkin emas"] }`.

#### `PATCH /days-off/{id}/` | `DELETE /days-off/{id}/`
**Permission:** `days_off.update` / `days_off.delete`

---

<a name="7-lead-management-crm-pipeline"></a>
## 7. Lead Management (CRM Pipeline)

Single stage concept: `open | trial | won | lost | waiting` (replaces old branch/column/status split).

### 7.1 Leads

#### `GET /leads/`
**Permission:** `leads.view`

Query: `?stage=`, `?status=`, `?source_id=`, `?teacher_id=`, `?branch_id=`, `?search=`, `?page=`, `?page_size=`

Each lead is returned with **resolved display names** so the Kanban needs no extra
lookups: `source_name` (from the lead-sources catalogue — renaming a source updates
every lead), `school_name`, `teacher_name`, `loss_reason_name`.

#### `POST /leads/`
**Permission:** `leads.create`

Request:
```json
{
  "branch_id": "uuid",
  "source_id": "uuid",
  "first_name": "Sardor",
  "last_name": "Nazarov",
  "phone": "+998931112233",
  "extra_phones": ["+998931112234"],
  "birth_date": "2008-09-10",
  "age": 18,
  "teacher_id": "uuid",
  "lesson_time": "16:00",
  "lesson_day_type": "odd",
  "status": "new",
  "stage": "open",
  "temperature": "warm",
  "body": "Qo'shimcha ma'lumot",
  "loss_reason_id": null
}
```

#### `GET /leads/{id}/` | `PATCH /leads/{id}/`
**Permission:** `leads.view` / `leads.update`

#### `POST /leads/{id}/convert/`
**Permission:** `leads.convert`

Converts a lead into a `Student` and optionally enrolls it into a `Group`.
The mock implements the full contract, and **the UI now uses it** (Lid
kartasi → "O'quvchiga aylantirish"): a lead detail sheet opens a group picker
and the conversion creates the student, the enrollment and closes the lead.

Side effects (all in one transaction on the backend):

1. `Student` is created from the lead (`first_name`, `last_name`, `phone`,
   `birth_date`, `branch_id`, `source_id`) with `status: "trial"`.
2. If `group_id` is given, an `Enrollment` is created for that group. Group
   capacity and duplicate membership are validated (`400` on violation).
3. The lead is closed: `stage: "won"`, `status: "enrolled"`,
   `converted_to_student_id`, `converted_to_group_id`, `converted_at`.
4. A second conversion of the same lead is rejected with `400`.

Request (all fields optional — the lead's own values are the default):
```json
{
  "group_id": "uuid",
  "first_name": "Dilshod",
  "last_name": "Nazarov",
  "phone": "+998 90 500 10 30",
  "birth_date": "2010-04-12"
}
```

Response (200):
```json
{
  "id": "lead-uuid",
  "stage": "won",
  "status": "enrolled",
  "converted_to_student_id": "student-uuid",
  "converted_to_group_id": "group-uuid",
  "converted_student_name": "Dilshod Nazarov",
  "converted_group_name": "Matematika — 9-sinf",
  "student": { "...Student...", "group_name": "Matematika — 9-sinf" }
}
```

Client side, after a successful conversion the caches for `leads`, `students`,
`groups`, `enrollments` and `dashboard` are invalidated.

### 7.2 Lead sources

Catalogue of acquisition channels (Instagram, tavsiya, ko'cha…). Owned by
**Sozlamalar → Lid manbalari**; the `/leads` Kanban only reads it. Source-based
statistics are derived from this catalogue.

#### `GET /lead-sources/`
**Permission:** `lead_sources.view`

Paginated list of `{ id, name, is_active, created_at, updated_at }`.

#### `POST /lead-sources/`
**Permission:** `lead_sources.create`

Request: `{ "name": "Instagram", "is_active": true }`

`name` is required and **case-insensitively unique** within the tenant → `400`
otherwise:
```json
{ "name": ["Bu nom allaqachon mavjud"] }
```

#### `PATCH /lead-sources/{id}/` | `DELETE /lead-sources/{id}/`
**Permission:** `lead_sources.update` / `lead_sources.delete`

Uniqueness is re-checked on update (ignoring the record itself).

**Delete guard:** a source still referenced by leads must not be deleted → `400`
```json
{ "detail": "Bu manbadan 3 ta lid kelgan — avval ularni boshqa manbaga o'tkazing" }
```

### 7.3 Lead loss reasons

Reason why a lead never converted (narx qimmat, javob bermadi…). Owned by
**Sozlamalar → Yo'qotish sabablari**.

#### `GET /lead-loss-reasons/`
**Permission:** `lead_loss_reasons.view`

Paginated list of `{ id, name, is_active }`.

#### `POST /lead-loss-reasons/`
**Permission:** `lead_loss_reasons.create`

Same `name` uniqueness rule as lead sources (`400 { "name": [...] }`).

#### `PATCH /lead-loss-reasons/{id}/` | `DELETE /lead-loss-reasons/{id}/`
**Permission:** `lead_loss_reasons.update` / `lead_loss_reasons.delete`

**Delete guard:** still referenced by leads → `400`
```json
{ "detail": "Bu sabab 4 ta lidga qo'yilgan — avval ularni yangilang" }
```

### 7.4 Public lead forms

#### `GET /lead-forms/`
**Permission:** `lead_forms.view`  
List of public forms (token-based, no auth for submission).

### 7.5 Lead stages (custom Kanban columns)

The five **system stages** are a fixed enum on `lead.stage`
(`open | waiting | trial | won | lost` — Kanban labels: Ochiq, Kutilmoqda, Sinov
darsi, O'quvchiga aylandi, Rad etilgan). `/lead-stages/` holds only the **extra
columns** a center adds; they are rendered after the system columns and are fully
manageable in **Sozlamalar → Lid bosqichlari** only (the Kanban has no
add/remove-column UI).

#### `GET /lead-stages/`
**Permission:** `lead_stages.view`

Paginated list of `{ id, name, color, order, is_active, created_at, updated_at }`
ordered by `order`.

#### `POST /lead-stages/`
**Permission:** `lead_stages.create`

Request:
```json
{ "name": "Qayta qo'ng'iroq", "color": "warning", "is_active": true }
```
- `color` — one of `action | info | success | warning | danger | neutral`.
- `order` is **assigned by the backend** as `max(order) + 1` (append to the end).
- `name` is case-insensitively unique → `400 { "name": ["Bu nom allaqachon mavjud"] }`.

#### `PATCH /lead-stages/{id}/` | `DELETE /lead-stages/{id}/`
**Permission:** `lead_stages.update` / `lead_stages.delete`

`PATCH` accepts `name`, `color`, `is_active` (and `order` for future drag-reorder).

**Delete guard:** the column is not empty → `400`
```json
{ "detail": "Bu ustunda 5 ta lid bor — avval ularni boshqa ustunga ko'chiring" }
```

---

<a name="8-academic--attendance"></a>
## 8. Academic & Attendance

### 8.1 Attendance (bulk-first)

Single enum: `PRESENT | LATE | ABSENT | EXCUSED` (no separate "late" boolean).

#### `GET /attendance/`
**Permission:** `attendance.view`

Query: `?lesson_id=`, `?enrollment_id=`, `?student_id=`, `?date_from=`,
`?date_to=`, `?status=`

Every record carries `lesson_id`, `enrollment_id` and `student_id` — the raw
lesson-level row. A **student/parent cabinet** therefore reads
`/attendance/?student_id=<id>` directly (no client-side join); the teacher UI
reads `/lessons/{id}/attendance/` (the roster) instead.

Rows are inlined with `student_name`, `group_name` and `lesson_date`.
The teacher role is scoped server-side: only attendance of the teacher's own
groups is returned.

#### `POST /attendance/bulk/` — Mark attendance for a whole lesson
**Permission:** `attendance.bulk`

Request:
```json
{
  "lesson_id": "uuid",
  "items": [
    { "enrollment_id": "uuid", "status": "PRESENT", "note": null },
    { "enrollment_id": "uuid", "status": "LATE", "note": "10 min kechi" },
    { "enrollment_id": "uuid", "status": "ABSENT", "note": null },
    { "enrollment_id": "uuid", "status": "EXCUSED", "note": "Kechirib qo'llandi" }
  ]
}
```
One request = one lesson. Idempotent via `Idempotency-Key`. Returns 200 with saved records.

#### `GET /attendance/{id}/` | `PATCH /attendance/{id}/`
**Permission:** `attendance.view` / `attendance.create`

### 8.2 Assessments & Scores

#### `GET /assessments/`
**Permission:** `assessments.view`

Query: `?group_id=`, `?type=`, `?date_from=`, `?date_to=`

#### `POST /assessments/`
**Permission:** `assessments.create`

Request:
```json
{
  "group_id": "uuid",
  "title": "Kunlik baho — 2-dars",
  "type": "daily",
  "max_score": 10,
  "date": "2026-11-02",
  "schema": "1-5"
}
```

#### `GET /scores/` | `POST /scores/`
**Permission:** `scores.view` / `scores.create`

Score request:
```json
{
  "assessment_id": "uuid",
  "enrollment_id": "uuid",
  "score": 8,
  "comment": "Yaxshi ishlaydi"
}
```

---

<a name="9-finance--billing"></a>
## 9. Finance & Billing

**All money in tiyin (integer). Backend is the source of truth — client never calculates balances.**

### 9.1 Ledger (double-entry journal)

#### `GET /finance/ledger/`
**Permission:** `payments.view`

Query: `?student_id=`, `?group_id=`, `?type=`, `?date_from=`, `?date_to=`, `?page=`

Response: paginated LedgerEntry list. Balance is **computed** = Σ(payments) − Σ(charges) + Σ(adjustments).

### 9.2 Charges (hisob-fakturalar / billing)

Bir yozuv = **bitta o'quvchi + bitta davr**. `period` — `YYYY-MM` (vaqt mintaqasiga bog'lanmasligi uchun satr sifatida saqlanadi), `due_date` — o'sha davr uchun to'lov muddati.

```json
{
  "id": "uuid",
  "branch_id": "uuid",
  "student_id": "uuid",
  "group_id": "uuid",
  "period": "2026-10",
  "amount_tiyin": 65000000,
  "discount_tiyin": 0,
  "paid_tiyin": 32500000,
  "due_date": "2026-10-05",
  "student_name": "Doston Umarov",
  "group_name": "Ingliz tili — Beginner A1",
  "total_tiyin": 65000000,
  "debt_tiyin": 32500000,
  "status": "partial",
  "is_overdue": true
}
```

`paid_tiyin` **faqat** backend tomonidan to'ldiriladi — to'lovlar FIFO tartibida eng eski qarzdan boshlab taqsimlanadi. Hosilaviy maydonlar (client hisoblamaydi):
`total_tiyin = amount_tiyin − discount_tiyin`, `debt_tiyin = max(0, total_tiyin − paid_tiyin)`, `status` = `paid` | `partial` | `unpaid`, `is_overdue` = muddati o'tgan va qarz qolgan.

#### `GET /finance/charges/`
**Permission:** `charges.view`

Query: `?student_id=`, `?group_id=`, `?period=`, `?status=`, `?branch_id=`, `?search=`, `?page=`, `?ordering=`

#### `POST /finance/charges/` — oylik hisoblash (guruh bo'yicha)
**Permission:** `charges.create`

```json
{ "group_id": "uuid", "period": "2026-11", "due_day": 5 }
```

Guruhdagi **faol** o'quvchilarning har biriga yozuv yaratiladi (`amount_tiyin` — guruhning o'sha paytdagi narxi, chegirma bo'lsa `discount_tiyin`). `due_day` — 1..28 (standart 5).

Response `201`:
```json
{
  "created": 6,
  "skipped": 0,
  "period": "2026-11",
  "group_id": "uuid",
  "results": [ { "id": "uuid", "student_id": "uuid", "student_name": "…" } ]
}
```

Xatolar:
- `400 { "group_id": ["Guruh tanlanishi majburiy"] }`
- `400 { "period": ["Davr YYYY-MM ko'rinishida bo'lishi kerak"] }`
- `400 { "detail": "\"{group}\" guruhi uchun {period} davri allaqachon hisoblangan" }` — guruh + davr juftligi unikal, takroriy hisoblash rad etiladi (qayta yuborishdan himoya).
- `400 { "detail": "Bu guruhda hisoblash uchun o'quvchi yo'q" }`

#### `PATCH /finance/charges/{id}/` | `DELETE /finance/charges/{id}/`
**Permission:** `charges.update` / `charges.delete`

Tahrirlanadigan maydonlar: `amount_tiyin`, `discount_tiyin`, `due_date`.

**To'lov qilingan** (`paid_tiyin > 0`) yozuvni tahrirlash ham, o'chirish ham mumkin emas:
`400 { "detail": "Bu hisob-fakturaga to'lov qilingan — avval to'lovni qaytaring" }`

### 9.3 Payments

#### `GET /finance/payments/`
**Permission:** `payments.view`

#### `POST /finance/payments/` — Record payment
**Permission:** `payments.create`

Request:
```json
{
  "student_id": "uuid",
  "group_id": "uuid",
  "amount_tiyin": 45000000,
  "method": "click",
  "idempotency_key": "uuid-v4"
}
```
`method` — **enum emas**, `/finance/payment-methods/` katalogidagi `code` (9.9). Backend noma'lum kodni rad etadi.

Backend applies FIFO allocation to oldest debt. Returns payment + updated balance.

#### `GET /finance/payments/{id}/` | `GET /finance/payments/{id}/receipt/`
**Permission:** `payments.view` / `payments.receipt`

Receipt endpoint returns PDF URL / receipt data.

### 9.4 Discounts

#### `GET /finance/discounts/`
**Permission:** `discounts.view`

#### `POST /finance/discounts/`
**Permission:** `discounts.create`

Request:
```json
{
  "student_id": "uuid",
  "group_id": "uuid",
  "type": "percent",
  "value_percent": 20,
  "value_tiyin": null,
  "valid_from": "2026-11-01",
  "valid_until": "2026-12-31",
  "is_active": true
}
```

### 9.5 Refunds

#### `GET /finance/refunds/` | `POST /finance/refunds/`
**Permission:** `payments.refund`

Refund requires `ApprovalRequest` → CEO approval (moderation).

### 9.6 Expenses

#### `GET /finance/expenses/` | `POST /finance/expenses/`
**Permission:** `expenses.view` / `expenses.create`

Request:
```json
{
  "branch_id": "uuid",
  "category_id": "uuid",
  "amount_tiyin": 500000,
  "description": "Ofis zaxiralari",
  "date": "2026-10-16"
}
```

#### `GET /finance/expense-categories/`
**Permission:** `expense_categories.view`

### 9.7 Cash shift (kassa smenasi) — NEW vs old system

#### `GET /finance/cash-shifts/` | `POST /finance/cash-shifts/` (open)
**Permission:** `cash_shifts.open` / `cash_shifts.view`

Open request:
```json
{
  "branch_id": "uuid"
}
```

#### `POST /finance/cash-shifts/{id}/close/` (close)
**Permission:** `cash_shifts.close`

Request:
```json
{
  "actual_amount_tiyin": 12500000
}
```
Backend compares expected vs actual, records variance.

### 9.8 P&L report

#### `GET /finance/pnl/`
**Permission:** `pnl.view`

Query: `?date_from=`, `?date_to=`, `?branch_id=`

Response:
```json
{
  "success": true,
  "data": {
    "revenue_tiyin": 450000000,
    "expenses_tiyin": 12000000,
    "net_profit_tiyin": 438000000,
    "by_payment_method": [
      { "method": "cash", "amount": 20000000 },
      { "method": "click", "amount": 25000000 }
    ],
    "by_student": [ ... ]
  }
}
```

### 9.9 Payment methods (to'lov turlari) — Settings katalogi

Kassa va moliya hisobotlari shu katalog asosida yig'iladi. Tizim 6 ta boshlang'ich turni beradi (`cash`, `card`, `click`, `payme`, `uzum`, `transfer`) — ular ham oddiy yozuvlar, o'chirilishi mumkin (faqat ishlatilmayotgan bo'lsa). Katalog **Sozlamalar → Moliya** bo'limida boshqariladi.

```json
{
  "id": "uuid",
  "name": "Naqd pul",
  "code": "cash",
  "kind": "cash",
  "is_active": true,
  "sort_order": 1
}
```

`kind` ∈ `cash` | `card` | `online` | `transfer` — buxgalteriya guruhi (kassa hisobotida turlar shu bo'yicha yig'iladi); `code` — to'lovlarga yoziladigan barqaror kalit; `sort_order` — kassadagi ko'rinish tartibi.

#### `GET /finance/payment-methods/`
**Permission:** `payment_methods.view`

Query: `?is_active=true|false`, `?search=`, `?page=`, `?ordering=sort_order`

#### `POST /finance/payment-methods/`
**Permission:** `payment_methods.create`

Request: `{ "name": "Halyk Bank", "code": "halyk", "kind": "online", "is_active": true }`

Xatolar (barchasi `400`, `fieldErrors` ko'rinishida):
- `{ "name": ["Bu nom allaqachon mavjud"] }` — registrga sezgir emas
- `{ "name": ["Nomi majburiy"] }`
- `{ "code": ["Bu kod allaqachon ishlatilgan"] }`
- `{ "code": ["Kod faqat lotin harflari, raqam va pastki chiziqdan iborat bo'lsin"] }`
- `{ "kind": ["To'lov turi guruhi noto'g'ri"] }`

#### `PATCH /finance/payment-methods/{id}/` | `DELETE /finance/payment-methods/{id}/`
**Permission:** `payment_methods.update` / `payment_methods.delete`

`code` yaratilgandan keyin o'zgartirilmasligi tavsiya etiladi — eski to'lovlar shu kalit bilan saqlanadi. Ishlatilayotgan turni o'chirish:

`400 { "detail": "Bu to'lov turi {n} ta to'lovda ishlatilgan — avval ularni boshqa turga o'tkazing" }`

### 9.10 Debts (qarzdorlar)

Hisob-fakturalardan hosil qilinadigan **o'quvchi kesimidagi** agregat (yozuv emas). Moliya → "Qarzlar" sahifasi shundan oziqlanadi.

#### `GET /finance/debts/`
**Permission:** `debts.view`

Query: `?search=`, `?branch_id=`, `?only_debt=true|false`, `?overdue=true`, `?page=`, `?ordering=`

```json
{
  "count": 26,
  "results": [
    {
      "student_id": "uuid",
      "student_name": "Doston Umarov",
      "phone": "+998901234567",
      "student_status": "active",
      "branch_id": "uuid",
      "branch_name": "Chilonzor filiali",
      "group_names": "Ingliz tili — Beginner A1, IELTS tayyorlov",
      "charged_tiyin": 390000000,
      "paid_tiyin": 281400000,
      "debt_tiyin": 108600000,
      "advance_tiyin": 0,
      "overdue_tiyin": 84812500,
      "oldest_due_date": "2026-05-05",
      "last_payment_at": "2026-10-16T09:20:00.000Z"
    }
  ]
}
```

`debt_tiyin` — to'lanmagan qoldiq, `advance_tiyin` — avans (ikkalasi bir vaqtda musbat bo'lmaydi). `overdue_tiyin` — muddati o'tgan hisob-fakturalar bo'yicha qoldiq. `only_debt=true` bo'lsa faqat `debt_tiyin > 0` bo'lgan o'quvchilar qaytadi; `overdue=true` esa faqat muddati o'tgan qarzi borlar.

`group_names` bir nechta guruhni vergul bilan birlashtiradi (`null` — guruh yo'q).

**Balans qoidasi (yagona manba):** `student.balance_tiyin = Σ(payments) − Σ(charges.total_tiyin)`. Musbat — avans, manfiy — qarz. Shu sababli "O'quvchilar" sahifasidagi balans va "Qarzlar" sahifasi hech qachon qarama-qarshi son ko'rsatmaydi: backend qaysi birini ko'rsatsa ham bir xil formuladan chiqadi.

---

<a name="10-payroll-system"></a>
## 10. Payroll System

Teacher salaries: fixed or percentage-based. Lifecycle: `DRAFT → LOCKED → PAID`. Adjustments = bonuses/fines/advances in one entity.

### 10.1 Payrolls

#### `GET /payroll/`
**Permission:** `payroll.view`

Query: `?user_id=`, `?month=`, `?state=`

Response: paginated Payroll list.

#### `GET /payroll/{id}/`
**Permission:** `payroll.view`

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "month": "2026-10",
    "base_amount_tiyin": 2000000,
    "adjustments_tiyin": 300000,
    "final_amount_tiyin": 2300000,
    "state": "DRAFT",
    "created_at": "...",
    "locked_at": null,
    "paid_at": null
  }
}
```

### 10.2 Adjustments (bonus/fine/advance)

#### `POST /payroll/adjustments/`
**Permission:** `payroll.adjustment`

Request:
```json
{
  "payroll_id": "uuid",
  "type": "bonus",
  "amount_tiyin": 500000,
  "reason": "Yuqori baho olish uchun bonus"
}
```
**Belgilar:** `bonus` → `adjustments_tiyin` ga **qo'shiladi**; `fine` va `advance` →
**ayiriladi**. `final_amount_tiyin = base_amount_tiyin + Σ(bonus) − Σ(fine|advance)`.
Faqat `state == "DRAFT"` da ruxsat etiladi; `LOCKED`/`PAID` da `400`.
Javobda yangilangan `adjustments_tiyin` va `final_amount_tiyin` qaytadi.

#### `POST /payroll/{id}/lock/`
**Permission:** `payroll.lock`

Transition `DRAFT → LOCKED`. Backend recalculates final amount from group lessons × pay_rule.

#### `POST /payroll/{id}/pay/`
**Permission:** `payroll.pay`

Transition `LOCKED → PAID`.

---

<a name="11-messaging--notifications"></a>
## 11. Messaging & Notifications

SMS templates + automated trigger logs. Ota-ona (parent) is the primary SMS recipient.

### 11.1 Message templates

#### `GET /messaging/templates/`
**Permission:** `message_templates.view`

#### `POST /messaging/templates/`
**Permission:** `message_templates.create`

Request:
```json
{
  "name": "Qarz eslatmasi",
  "channel": "sms",
  "subject": null,
  "body": "Hurmatli {{parent_name}}, sizning farzandingiz {{student_name}} ning qarzi {{debt_amount}} so'm. Iltimos, to'lov qiling.",
  "is_active": true
}
```
`name` is required and case-insensitively unique → `400 { "name": ["Bu nom allaqachon mavjud"] }`;
`body` is required and non-empty → `400 { "body": ["Xabar matni majburiy"] }`.

#### `PATCH /messaging/templates/{id}/` | `DELETE /messaging/templates/{id}/`
**Permission:** `message_templates.update` / `message_templates.delete`

Same validation as `POST` (uniqueness ignores the record itself). Templates are
managed in **Sozlamalar → Xabar shablonlari**; `/messaging` only sends and shows logs.

### 11.2 Automation rules (triggers)

#### `GET /messaging/automation-rules/`
**Permission:** `automation_rules.view`

#### `POST /messaging/automation-rules/`
**Permission:** `automation_rules.create`

Request:
```json
{
  "trigger": "debt",
  "template_id": "uuid",
  "channel": "sms",
  "is_active": true
}
```
Triggers: `debt`, `missed_class`, `payment_received`, `group_start`, `trial_end`.

### 11.3 Message logs

#### `GET /messaging/logs/`
**Permission:** `message_logs.view`

Query: `?channel=`, `?status=`, `?date_from=`, `?date_to=`

### 11.4 Manual SMS send

#### `POST /messaging/sms/send/`
**Permission:** `sms.send`

Request:
```json
{
  "to": "+998901234567",
  "template_id": "uuid",
  "body": null,
  "placeholders": { "parent_name": "Dilnoza", "student_name": "Jasur", "debt_amount": "450000" }
}
```

---

<a name="12-reports"></a>
## 12. Reports

All read-only. `reports.view` permission.

| Endpoint | Description |
|----------|-------------|
| `GET /reports/finance/` | Revenue, expenses, profit, by payment method |
| `GET /reports/students/` | Student stats, enrollment, churn |
| `GET /reports/leads/` | Funnel, sources, manager conversion |
| `GET /reports/attendance/` | Attendance % by group/teacher |
| `GET /reports/payroll/` | Payroll summary by teacher/month |

Each accepts `?date_from=`, `?date_to=`, `?branch_id=`, `?page=`, `?page_size=`.

---

<a name="13-error-format--envelope"></a>
## 13. Error Format & Envelope

All errors return the unified envelope. Frontend switches on `error.code`:

| Code | HTTP | Meaning |
|------|------|---------|
| `validation_error` | 400 | Invalid request body |
| `permission_denied` | 403 | Role lacks `resource.action` |
| `not_found` | 404 | Resource missing |
| `conflict` | 409 | Room/teacher double-booking, duplicate phone |
| `rate_limited` | 429 | Too many requests |
| `idempotency_replay` | 409 | Same Idempotency-Key, different body |
| `token_expired` | 401 | Refresh needed |
| `tenant_blocked` | 403 | Tenant is blocked |
| `internal_error` | 500 | Unexpected (log only, no details to client) |

Authentication:
- Access: 15 min, Refresh: 7 days, rotation enabled
- Rate limits: anon 60/min, authenticated 240/min, auth endpoints 30/min

---

<a name="14-appendix-role-permission-matrix"></a>
## 14. Appendix: Role-Permission Matrix (MVP)

| Permission | ceo | admin | teacher | parent | student |
|------------|-----|-------|---------|--------|---------|
| tenants.* | ✅ | | | | |
| branches.* | ✅ | ✅ | | | |
| rooms.* | ✅ | ✅ | | | |
| users.* | ✅ | ✅ | | | |
| students.* | ✅ | ✅ | ✅ (own groups) | ✅ (linked) | ✅ (own) |
| parents.* | ✅ | ✅ | | ✅ (own) | |
| groups.* | ✅ | ✅ | ✅ (own) | | |
| schedule.* | ✅ | ✅ | ✅ (own) | | |
| lessons.* | ✅ | ✅ | ✅ (own) | | |
| attendance.* | ✅ | ✅ | ✅ (own groups) | ✅ (view linked) | ✅ (view own) |
| assessments/scores.* | ✅ | ✅ | ✅ (own groups) | ✅ (view linked) | ✅ (view own) |
| leads.* | ✅ | ✅ | | | |
| payments.* | ✅ | ✅ | | ✅ (view linked) | ✅ (view own) |
| charges.* | ✅ | ✅ | | | |
| debts.view | ✅ | ✅ | | | |
| payment_methods.* | ✅ | ✅ | | | |
| pnl.view | ✅ | ✅ | | | |
| payroll.* | ✅ | ✅ | ✅ (view own) | | |
| messaging.* | ✅ | ✅ | | | |
| reports.* | ✅ | ✅ | | | |
| roles.manage | ✅ (v1.x) | | | | |
| audit_logs.view | ✅ | ✅ | | | |
| approval_requests.decide | ✅ | | | | |

**Rule:** `manage.all` is not granted to any role in MVP. Permissions are checked server-side on every endpoint; frontend only hides UI.

---

### Frontend contract notes

- Frontend calls `/api/v1/<path>` via `src/shared/api/api-client.ts` (axios).
- All mutating requests include `Idempotency-Key`.
- Tenant/branch sent via `X-Tenant-Id` / `X-Branch-Id` headers.
- No hardcoded URLs in frontend — all paths in `src/shared/config/routes.ts` mirror this spec.
- OpenAPI schema (`/api/schema/`, drf-spectacular) is the source of truth; frontend types are generated from it.
