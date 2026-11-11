# YolUp CRM — Frontend

YolUp — high-performance CRM for educational centers in Uzbekistan. B2B, multi-tenant, C-Panel.

## Structure (Feature-Sliced Design)

```
src/
  app/            → router, layout, providers, App root
  pages/          → screen-level components (route components)
  widgets/        → composite blocks (Sidebar, TopBar, KpiCard)
  modules/        → feature domains (auth, tenants, branches, ...)
    <domain>/     → api, lib, model, ui, types (FSD layers)
  shared/         → shared layer (api, config, constants, lib, model, types, ui)
    api/          → axios client + typed endpoint definitions (contract-first)
```

## Architecture rules (warehouse pattern adapted)

- **Layered:** View (thin) → Service/Store (business logic) → Selector → Model
- **One lib per concern:** one date lib (date-fns), one chart lib (recharts), one icon lib (lucide)
- **Strict TypeScript:** `no-explicit-any: error`, no `any`
- **File limits:** file ≤ 300 lines, component ≤ 150 lines
- **No magic strings:** routes in `shared/config/routes.ts`, endpoints in `shared/api/api-client.ts`
- **No hardcoded URLs** — all API paths mirror `BACKEND_API_SPEC.md`
- **Permissions server-side:** frontend only hides UI; backend enforces `resource.action` RBAC

## Getting started

```bash
# 1. Install deps
pnpm install   # or npm install

# 2. Environment
cp .env.example .env
# edit .env → set VITE_API_BASE_URL

# 3. Run dev
pnpm dev

# 4. Typecheck + lint
pnpm typecheck
pnpm lint

# 5. Build
pnpm build
```

## Backend spec

See `docs/BACKEND_API_SPEC.md` — the contract for the Django team.

## Demo mode (no backend needed)

The app ships with a mock API so the UI can be reviewed before the Django backend is ready.

- Enabled by default (`VITE_USE_MOCK_API` defaults to `true`); the axios instance swaps its
  adapter in `src/shared/api/axios.ts`, so no component or query changes.
- Demo data lives in `src/shared/api/mock/demo-data.ts`, routing in `src/shared/api/mock/mock-adapter.ts`.
- Login accepts any non-empty identifier/password.
- Covering `/auth/*`, `/tenants/`, `/branches/`, `/rooms/`, `/courses/`, `/groups/`, `/students/`, `/users/`.
- To use the real backend: set `VITE_USE_MOCK_API=false` and `VITE_API_URL` in `.env`. Nothing else changes.


## Analysis sources

- `docs/source-analysis/YOLUP_ANALYSIS.md`
- `docs/source-analysis/SOFFCRM_FULL_ANALYSIS.md`
